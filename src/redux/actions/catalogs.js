import { Notification } from '@xbotvn/react-ui/components';
import {
  put,
} from 'redux-saga/effects';

import { callAPI } from '../../libs/backend';
import { CATALOGS } from './constants';

function* querySystem(id) {
  yield put({
    type: CATALOGS.handlers.system,
    id,
  });
}

function* updateSystem(id, data) {
  yield put({
    type: CATALOGS.system,
    id,
    data,
  });
}

function* querySystemCatalogs() {
  try {
    yield* querySystem('cities');
    const cities = yield callAPI('api/cities');
    yield* updateSystem('cities', cities || {});
  } catch ({ message }) {
    Notification.error(message);
    yield* updateSystem('cities', {});
  }

  try {
    yield* querySystem('product');
    const product = yield callAPI('api/product');
    if (product?.config) product.config = JSON.parse(product.config);
    yield* updateSystem('product', product || {});
  } catch ({ message }) {
    Notification.error(message);
    yield* updateSystem('product', {});
  }
}

export function* queryCatalogs() {
  yield* querySystemCatalogs();
}
