import { Notification } from '@xbotvn/react-ui/components';
import {
  uniq,
  cloneDeep,
  unset,
  flattenDeep,
} from '@xbotvn/utils/collection';
import {
  put,
  all,
  select,
  takeEvery,
} from 'redux-saga/effects';

import { graphQLCaller, callAPI } from '../../libs/backend';
import { FOLDERS, FILES } from './constants';

function* merge(data = []) {
  yield put({
    type: FOLDERS.merge,
    data,
  });
}

function* update(id, data) {
  yield put({
    type: FOLDERS.update,
    id,
    data,
  });
}

function getChildrenSize(id, folders) {
  const children = folders.filter(({ parent, id: cid }) => cid !== id && parent === id);
  if (children.length) {
    return children.reduce(
      (total, { size, id: cid }) => total + (size || 0) + getChildrenSize(cid, folders),
      0,
    );
  }
  return 0;
}

function getRelatedIDs(id, folders) {
  const children = folders.filter(({ parent, id: cid }) => parent === id && id !== cid);
  if (children.length) {
    return uniq([
      id,
      ...children.map(({ id: cid }) => [cid, ...getRelatedIDs(cid, folders)]).flat(),
    ]);
  }
  return [id];
}

function* getFolders({ category }) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  const userEmail = (yield select())?.user?.email ?? '';
  const unitAdmins = (yield select())?.user?.unit?.admins ?? [];
  const units = (yield select())?.folders?.units ?? {};
  const xbotAccount = Object.values((yield select())?.user?.account ?? {}).some((value) => value);
  const isAdminPermission = unitAdmins.includes(userEmail) || xbotAccount;
  if (unitID) {
    const year = (yield select())?.folders?.year ?? '';
    const connectors = (yield select())?.catalogs?.system?.product?.data?.config?.connectors ?? [];
    try {
      const results = {};
      if (connectors.includes(category) && isAdminPermission) {
        const connectorUnitId = localStorage.getItem(`${category}_${unitID}`);
        const data = connectorUnitId === null
          ? { year, connector: category }
          : { year, connector: category, unitId: connectorUnitId };
        const connectorFolders = yield callAPI('connector/folders', data);
        if (!connectorUnitId && (connectorFolders || [])[0]?.unitId) {
          localStorage.setItem(`${category}_${unitID}`, connectorFolders[0].unitId);
        }
        (connectorFolders || []).forEach(({
          id,
          name,
          parent,
          unitId: originalUnitID,
          key,
          code,
        }) => {
          results[`${category}_${id}`] = {
            id: `${category}_${id}`,
            name,
            unit: category,
            parent: `${category}_${parent}`,
            storeType: year ? 'year' : '',
            originalUnitID,
            key,
            code,
          };
        });
      } else {
        const { folders } = yield graphQLCaller(
          'folders',
          `{
            folders (unitID: "${unitID}", category: "${category}") {
            id
            unit
            shares
            reports
            expire
            extend {
              unit
              time
            }
            name
            created {
              user
              time
            }
            modified {
              user
              time
            }
            size
            parent
            storeType
            permissions {
              group
              permissions
            }
            labels
          }
        }`,
        );
        const missing = [];
        (folders || []).forEach(({
          id,
          shares,
          reports,
          extend,
          ...rest
        }) => {
          const ext = {};
          (extend || []).forEach(({ unit, time }) => {
            ext[unit] = time;
          });
          results[id] = {
            id,
            shares: shares || [],
            reports: reports || [],
            extend: ext,
            childrenSize: getChildrenSize(id, folders || []),
            ...rest,
          };
          const tmp = [...(shares || []), ...(reports || [])].filter((uid) => !units[uid]);
          if (tmp.length) missing.push(tmp);
          if (rest.unit && unitID !== rest.unit) missing.push([rest.unit]);
        });

        if (missing.length) {
          const { getUnits } = yield graphQLCaller(
            'units',
            `
            query getUnits($units: [String]) {
              getUnits(units: $units) {
                id
                name
                type
              }
            }
          `,
            {
              units: uniq(missing.flat()),
            },
          );
          const tmp = {};
          getUnits.forEach(({ id, name, type }) => {
            tmp[id] = { name, type };
          });
          yield put({
            type: FOLDERS.units,
            units: tmp,
          });
        }

        if (!category && !folders.length && !connectors.includes(category) && isAdminPermission) {
          yield put({
            type: FOLDERS.handlers.askCreate,
            askCreate: true,
          });
        }
      }
      yield* merge(results);
    } catch ({ message }) {
      Notification.error(message);
      yield* merge([]);
    }
  }
}

function* createFolder({ parent, data, onSuccess }) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  try {
    const cleanData = cloneDeep(data);
    if (cleanData.extend) {
      cleanData.extend = Object.entries(cleanData.extend).map(([unit, time]) => ({
        unit,
        time,
      }));
    }
    const { createFolder: folder } = yield graphQLCaller(
      'folders',
      `
          mutation createFolder($unitID: String!, $parent: String!, $folder: InformationInput!) {
            createFolder(unitID: $unitID, parent: $parent, folder: $folder) {
              id
              unit
              name
              created {
                user
                time
              }
              size
              parent
              permissions {
                group
                permissions
              }
              storeType
              shares
              reports
              expire
              extend {
                unit
                time
              }
            }
          }
        `,
      {
        unitID,
        parent,
        folder: cleanData,
      },
    );
    const { id } = folder || {};
    if (id) {
      if (folder.extend) {
        const ext = {};
        folder.extend.forEach(({ unit, time }) => {
          ext[unit] = time;
        });
        folder.extend = ext;
      }
      yield* update(id, folder);
      Notification.success('Tạo thư mục thành công.', { action: onSuccess });
    } else {
      yield* update();
      Notification.error('Tạo thư mục không thành công.');
    }
  } catch ({ message }) {
    yield* update();
    Notification.error(message);
  }
}

function* createFromTemplate({
  parent,
  folders,
  onSuccess,
}) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  try {
    yield graphQLCaller(
      'folders',
      `
          mutation createFromTemplate($unitID: String!, $parent: String!, $folders: [CreateFolderInput]!) {
            createFromTemplate(unitID: $unitID, parent: $parent, folders: $folders)
          }
        `,
      {
        unitID,
        parent,
        folders,
      },
    );
    Notification.success('Tạo thư mục thành công.', { action: onSuccess });
    yield put({
      type: FOLDERS.handlers.get,
    });
  } catch ({ message }) {
    yield* update();
    Notification.error(message);
  }
}

function* updateFolder({
  id,
  data,
  related,
  onComplete,
}) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  const folders = (yield select())?.folders?.data ?? {};
  try {
    const updateIds = (Array.isArray(id) && id.length > 1) ? [...id] : [id];
    const ids = related ? getRelatedIDs(id, Object.values(folders)) : updateIds;
    const cleanData = cloneDeep(data);
    if (data.extend) {
      cleanData.extend = Object.entries(data.extend).map(([uid, time]) => ({
        unit: uid,
        time,
      }));
    }
    if (!data.expire) {
      unset(cleanData, 'expire');
    }
    const missing = [...(data?.shares ?? []), ...(data?.reports ?? [])];
    yield graphQLCaller(
      'folders',
      `
        mutation modifyFolders($unitID: String!, $folders: [FolderInput]) {
          modifyFolders(unitID: $unitID, folders: $folders)
        }
      `,
      {
        unitID,
        folders: ids.map((tid) => ({ id: tid, information: cleanData })),
      },
    );
    yield* ids.map((cid) => update(cid, data));
    if (missing.length) {
      const { getUnits } = yield graphQLCaller(
        'units',
        `
          query getUnits($units: [String]) {
            getUnits(units: $units) {
              id
              name
            }
          }
        `,
        {
          units: uniq(missing.flat()),
        },
      );
      const tmp = {};
      getUnits.forEach(({ id: uid, name }) => {
        tmp[uid] = { name };
      });
      yield put({
        type: FOLDERS.units,
        units: tmp,
      });
    }
    Notification.success('Cập nhật thư mục thành công.', { action: onComplete });
  } catch ({ message }) {
    yield* update();
    Notification.error(message, { action: () => onComplete(message) });
  }
}

function* removeFolders({ ids, onComplete }) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  const folders = (yield select())?.folders?.data ?? {};
  const folderIds = uniq(flattenDeep(ids.map(
    (id) => getRelatedIDs(id, Object.values(folders)),
  )));

  try {
    yield graphQLCaller(
      'folders',
      `
        mutation removeFolders($unitID: String!, $folders: [String]!) {
          removeFolders(unitID: $unitID, folders: $folders)
        }
      `,
      {
        unitID,
        folders: folderIds,
      },
    );
    yield* folderIds.map((cid) => update(cid));
    Notification.success('Xoá thư mục thành công.', { action: onComplete });
  } catch ({ message }) {
    yield* update();
    Notification.error(message, { action: () => onComplete(message) });
  }
}

function* cleanFolders({ ids }) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  try {
    yield graphQLCaller(
      'folders',
      `
        mutation removeFolders($unitID: String!, $folders: [String]!) {
          removeFolders(unitID: $unitID, folders: $folders)
        }
      `,
      {
        unitID,
        folders: ids,
      },
    );
    yield* ids.map((cid) => update(cid));
    Notification.success('Xoá thư mục thành công.');
  } catch ({ message }) {
    yield* update();
    Notification.error(message);
  }
}

function* updatePermissions({
  id,
  permissions,
  related,
  onSuccess,
}) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  const folders = (yield select())?.folders?.data ?? {};
  try {
    const ids = related ? getRelatedIDs(id, Object.values(folders)) : [id];
    yield graphQLCaller(
      'folders',
      `
        mutation setPermissions($unitID: String!, $folders: [String]!, $permissions: [PermissionInput]) {
          setPermissions(unitID: $unitID, folders: $folders, permissions: $permissions)
        }
      `,
      {
        unitID,
        folders: ids,
        permissions,
      },
    );
    yield* ids.map((cid) => update(cid, { permissions }));
    Notification.success('Cập nhật phân quyền thành công.', { action: onSuccess });
  } catch ({ message }) {
    yield* update();
    Notification.error(message);
  }
}

function* getFiles({
  folderId,
}) {
  const connectors = (yield select())?.catalogs?.system?.product?.data?.config?.connectors ?? [];
  const unit = (yield select())?.user?.unit ?? {};
  const unitFolders = Object.values((yield select())?.folders.data ?? {}).filter(
    ({ parent, unit: fUnit }) => parent === 'unit' && fUnit === unit.id,
  );
  // eslint-disable-next-line no-restricted-syntax
  for (const connector of connectors) {
    if (unit[connector]) {
      yield put({
        type: FOLDERS.handlers.get,
        category: connector,
      });
    }
  }

  if (folderId) {
    yield put({
      type: FILES.handlers.get,
      folder: folderId,
    });
    yield all(unitFolders.map(({ id }) => put({ type: FILES.handlers.get, folder: id })));
  }
}

export const handleGetFolders = (category) => ({
  type: FOLDERS.handlers.get,
  category,
});

export const handleCreateFolder = (parent, data, onSuccess) => ({
  type: FOLDERS.handlers.create,
  parent,
  data,
  onSuccess,
});

export const handleCreateFolderFromTemplate = (
  parent,
  folders,
  onSuccess,
) => ({
  type: FOLDERS.handlers.template,
  parent,
  folders,
  onSuccess,
});

export const handleUpdateFolder = (
  id,
  data,
  related = false,
  onComplete,
) => ({
  type: FOLDERS.handlers.update,
  id,
  data,
  related,
  onComplete,
});

export const handleRemoveFolders = (ids, onComplete) => ({
  type: FOLDERS.handlers.remove,
  ids,
  onComplete,
});

export const handleUpdatePermissions = (
  id,
  permissions,
  related = false,
  onSuccess = undefined,
) => ({
  type: FOLDERS.handlers.permissions,
  id,
  permissions,
  related,
  onSuccess,
});

export const handleChangeYear = (year, folderId = '') => ({
  type: FOLDERS.handlers.year,
  year,
  folderId,
});

export const handleShowHidden = () => ({
  type: FOLDERS.showHidden,
});

export const handleCleanFolders = (ids) => ({
  type: FOLDERS.handlers.clean,
  ids,
});

export const handleFoldersViewChanged = (folder, search, reportedUnit) => ({
  type: FOLDERS.handlers.view,
  folder,
  search,
  reportedUnit,
});

export const handleCloseCreateFolders = () => ({
  type: FOLDERS.handlers.askCreate,
  askCreate: false,
});

export default function* saga() {
  yield all([
    yield takeEvery(FOLDERS.handlers.get, getFolders),
    yield takeEvery(FOLDERS.handlers.create, createFolder),
    yield takeEvery(FOLDERS.handlers.template, createFromTemplate),
    yield takeEvery(FOLDERS.handlers.remove, removeFolders),
    yield takeEvery(FOLDERS.handlers.clean, cleanFolders),
    yield takeEvery(FOLDERS.handlers.update, updateFolder),
    yield takeEvery(FOLDERS.handlers.permissions, updatePermissions),
    yield takeEvery(FOLDERS.handlers.year, getFiles),
  ]);
}
