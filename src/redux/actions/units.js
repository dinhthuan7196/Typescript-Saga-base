import { Notification } from '@xbotvn/react-ui/components';
import { uniqBy } from '@xbotvn/utils/collection';
import {
  takeLatest,
  put,
  all,
  select,
} from 'redux-saga/effects';

import { graphQLCaller } from '../../libs/backend';
import { UNITS } from './constants';

export function* fetch(filters, data = {}) {
  yield put({
    type: UNITS.fetch,
    filters,
    data,
  });
}

export function* update(id, data) {
  yield put({
    type: UNITS.update,
    id,
    data,
  });
}

function* findUnits({ filter, cached }) {
  const support = (yield select())?.user?.account?.xbot?.support ?? false;
  const unitTypesOptions = (yield select())?.catalogs?.system?.product?.data?.config?.unitTypes
   ?? {};
  const filters = (yield select())?.units?.filters ?? [];
  const uid = (yield select())?.user?.uid ?? '';
  const {
    type,
    province,
    district,
    ward,
  } = filter;
  let skip = false;
  if (cached) {
    const found = filters.find(({
      type: ftype,
      province: fprovince,
      district: fdistrict,
      ward: fward,
    }) => ftype === type && fprovince === province && fdistrict === district && fward === ward);
    if (found) skip = true;
  }

  if (!skip) {
    try {
      const expand = unitTypesOptions?.[type]?.expand ?? [];
      const { findUnits: units } = yield graphQLCaller(
        'units',
        `{
          findUnits(type: "${type}", province: "${province || ''}", district: "${district || ''}", ward: "${ward || ''}", expand: [${expand.map((t) => `"${t}"`).join(',')}]) {
            id
            province
            district
            ward
            type
            storage
            elibot
            removed
            ${support ? `name
              admins
              staffs
            ` : 'name'}
          }
        }`,
      );
      const data = {};
      units.forEach(({ id, ...rest }) => {
        data[id] = rest;
      });
      const fetchedUnits = units.map(({ id, name }) => ({ id, name }));
      const temp = JSON.parse(localStorage.getItem(`cachedUnits_${uid}`));
      const cachedUnits = temp ? uniqBy(temp.concat(fetchedUnits), 'id') : fetchedUnits;
      if (support) {
        localStorage.setItem(`cachedUnits_${uid}`, JSON.stringify(cachedUnits));
      }
      yield* fetch([
        ...filters, {
          type,
          province,
          district,
          ward,
        },
      ], data);
    } catch ({ message }) {
      Notification.error(message);
      yield* fetch(filters);
    }
  } else yield* fetch(filters);
}

function* createUnit({ data, onComplete }) {
  try {
    const { createUnit: { id } } = yield graphQLCaller('units', `
      mutation createUnit( $information: UnitInput!) {
        createUnit(information: $information) {
          id
        }
      }
    `, {
      information: data,
    });
    const unit = {
      id,
      ...data,
    };
    yield* update(id, unit);
    Notification.success('Tạo đơn vị thành công.', { action: onComplete });
  } catch ({ message }) {
    yield* update();
    Notification.error(message, { action: () => onComplete(message) });
  }
}

function* updateUnit({ id, data, onComplete }) {
  const log = (yield select())?.units?.data?.[id]?.name ?? '';
  try {
    yield graphQLCaller(
      'units',
      data ? `
        mutation updateUnitInformation($id: ID!, $information: UnitInput!) {
          updateUnitInformation(id: $id, information: $information)
        }
      ` : `
        mutation removeUnit($log: String!, $id: ID!) {
          removeUnit(log: $log, id: $id)
        }
      `,
      data ? { id, information: data } : { log, id },
    );
    yield* update(id, data);
    Notification.success(`${data ? 'Cập nhật' : 'Xoá'} đơn vị thành công.`, { action: onComplete });
  } catch ({ message }) {
    yield* update();
    Notification.error(message, { action: () => onComplete(message) });
  }
}

export const handleFindUnits = (filter, cached = true) => ({
  type: UNITS.handlers.find,
  filter,
  cached,
});

export const handleCreateUnit = (data, onComplete) => ({
  type: UNITS.handlers.create,
  data,
  onComplete,
});

export const handleUpdateUnit = (id, data, onComplete) => ({
  type: UNITS.handlers.update,
  id,
  data,
  onComplete,
});

export default function* saga() {
  yield all([
    yield takeLatest(UNITS.handlers.find, findUnits),
    yield takeLatest(UNITS.handlers.create, createUnit),
    yield takeLatest(UNITS.handlers.update, updateUnit),
  ]);
}
