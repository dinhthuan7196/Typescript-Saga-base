import { Notification } from '@xbotvn/react-ui/components';
import { clone } from '@xbotvn/utils/collection';
import {
  put,
  all,
  select,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';

import {
  graphQLCaller,
  uploadFiles,
  callAPI,
} from '../../libs/backend';
import { getYear } from '../../libs/utils';
import { FILES, FOLDERS } from './constants';

function* update(folder, data = {}) {
  yield put({
    type: FILES.update,
    folder,
    data,
  });
}

function* updateSearch(data = {}) {
  yield put({
    type: FILES.search,
    data,
  });
}

function* getFiles({ folder }) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  const storeType = (yield select())?.folders?.data?.[folder]?.storeType ?? 'permanent';
  const selectedYear = (yield select())?.folders?.year ?? '';
  const connectors = (yield select())?.catalogs?.system?.product?.data?.config?.connectors ?? [];
  const folders = (yield select())?.folders?.data ?? {};
  const year = getYear(storeType, selectedYear);
  try {
    const connector = connectors.find((e) => folder.startsWith(`${e}_`));
    const results = {};
    if (connector) {
      const {
        key,
        code,
        parent,
        originalUnitID,
      } = folders?.[folder];
      const connectorFiles = yield callAPI('connector/files', {
        folder: folder.replace(`${connector}_`, ''),
        year: selectedYear,
        connector,
        key,
        code,
        parent: parent.replace(`${connector}_`, ''),
        unitId: originalUnitID,
      });
      connectorFiles.forEach(({ keys, name, actions }) => {
        results[keys.join('_')] = {
          id: keys.join('_'),
          keys,
          name,
          unit: connector,
          folder,
          year,
          actions,
        };
      });
    } else {
      const { files } = yield graphQLCaller(
        'files',
        `{
            files(unitID: "${unitID}", folder: "${folder}", year: ${year}) {
              unit
              id
              folder
              year
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
              comment {
                user
                time
                content
              }
              labels
              removed
              description
              pageCount
              authority
              date
              category
              docType
              docNo
            }
          }`,
      );
      let total = 0;
      (files || []).forEach(({ id, size, ...rest }) => {
        results[id] = {
          id,
          size,
          permissions: folders?.[folder]?.permissions ?? [],
          ...rest,
        };
        if (!rest.removed) total += (size || 0);
      });
      if (folder !== 'unit') {
        yield put({
          type: FOLDERS.size,
          id: folder,
          size: total,
        });
      }
    }
    yield* update(folder, results);
  } catch ({ message }) {
    Notification.error(message);
    yield* update(folder);
  }
}

function* queryFiles({ query, options }) {
  if (query) {
    const unitID = (yield select())?.user?.unit?.id ?? '';
    try {
      const { search } = yield graphQLCaller(
        'files',
        `
        query search($unitID: String!, $query: String!, $options: OptionsInput) {
          search(unitID: $unitID, query: $query, options: $options) {
            unit
            id
            folder
            year
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
            comment {
              user
              time
              content
            }
            labels
            removed
            description
            pageCount
            authority
            date
            category
            docType
            docNo
          }
        }
      `,
        {
          unitID,
          query,
          options,
        },
      );

      const results = {};
      (search || []).forEach(({ id, size, ...rest }) => {
        results[id] = {
          id,
          size,
          ...rest,
        };
      });
      yield* updateSearch(results);
    } catch ({ message }) {
      Notification.error(message);
      yield* updateSearch();
    }
  }
}

function* getFolders(folder) {
  const isSharedFolder = ((yield select())?.folders?.data?.[folder]?.shares ?? []).length;
  const isReports = ((yield select())?.folders?.data?.[folder]?.reports ?? []).length;
  yield put({
    type: FOLDERS.handlers.get,
    category: '',
  });
  if (isReports) {
    yield put({
      type: FOLDERS.handlers.get,
      category: 'reports',
    });
  }
  if (isSharedFolder) {
    yield put({
      type: FOLDERS.handlers.get,
      category: 'shares',
    });
  }
}

function* removeFiles({
  folder,
  ids,
  removeAll,
  onComplete,
}) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  const connectors = (yield select())?.catalogs?.system?.product?.data?.config?.connectors ?? [];
  try {
    const connector = connectors.find((e) => folder.startsWith(`${e}_`));
    if (connector) {
      const { key, originalUnitID } = (yield select())?.folders?.data?.[folder] ?? {};
      const files = (yield select())?.files?.data?.[folder] ?? {};
      const removedFiles = ids.map((id) => ({ name: files?.[id]?.name ?? '' }));
      yield callAPI('connector/removeFiles', {
        folder: folder.replace(`${connector}_`, ''),
        connector,
        key,
        unitId: originalUnitID,
        files: JSON.stringify(removedFiles),
      });
    } else {
      yield* ids.map(function* removeFile(id) {
        yield graphQLCaller(
          'files',
          `
        mutation removeFile($unitID: String!, $id: String!, $all: Boolean) {
          removeFile(unitID: $unitID, id: $id, all: $all)
        }
      `,
          {
            unitID,
            id,
            all: removeAll,
          },
        );
      });
    }
    Notification.success('Xoá file thành công.', { action: onComplete });
    yield* getFolders(folder);
    yield put({
      type: FILES.handlers.get,
      folder,
      label: '',
    });
  } catch ({ message }) {
    Notification.error(message, { action: () => onComplete(message) });
    yield* update(unitID, folder);
  }
}

function* writeComment({
  folder,
  id,
  content,
  onComplete,
}) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  try {
    yield graphQLCaller(
      'files',
      `
        mutation writeComment($unitID: String!, $id: String!, $content: String) {
          writeComment(unitID: $unitID, id: $id, content: $content)
        }
      `,
      {
        unitID,
        id,
        content,
      },
    );
    Notification.success('Cập nhật nhận xét thành công.', { action: onComplete });
    yield put({
      type: FILES.handlers.get,
      folder,
      label: '',
    });
  } catch ({ message }) {
    Notification.error(message);
    yield* update(unitID, folder);
  }
}

function* upload({
  folder,
  files,
  replace,
  isSignAction,
}) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  const storeType = (yield select())?.folders?.data?.[folder]?.storeType ?? 'permanent';
  const originalUnitID = (yield select())?.folders?.data?.[folder]?.originalUnitID ?? '';
  const key = (yield select())?.folders?.data?.[folder]?.key ?? '';
  const year = getYear(storeType, (yield select())?.folders?.year ?? '');
  const connectors = (yield select())?.catalogs?.system?.product?.data?.config?.connectors ?? [];
  try {
    const connector = connectors.find((e) => folder.startsWith(`${e}_`));
    const params = connector ? {
      unitId: originalUnitID,
      folder: folder.replace(`${connector}_`, ''),
      connector,
      key,
    } : {
      unitID,
      folder,
      year,
      replace,
      extract: storeType === 'document',
    };
    yield uploadFiles(params, files, connector);
    yield* getFolders(folder);
    yield put({
      type: FILES.handlers.get,
      folder,
      label: '',
    });
    Notification.success(isSignAction ? 'Đã ký file thành công' : 'Upload files thành công.');
  } catch ({ message }) {
    yield* update();
    Notification.error(message);
  }
}

function* updateFile({
  id,
  folder,
  data,
  onComplete,
}) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  try {
    yield graphQLCaller(
      'files',
      `
        mutation updateFile($unitID: String!, $id: String!, $file: FileInput!) {
          updateFile(unitID: $unitID, id: $id, file: $file)
        }
      `,
      {
        unitID,
        id,
        file: data,
      },
    );
    yield put({
      type: FILES.file.update,
      folder,
      file: id,
      data,
    });
    Notification.success('Cập nhật file thành công.', { action: onComplete });
  } catch ({ message }) {
    yield* update();
    Notification.error(message);
  }
}

function* batchUpdateFiles({
  folderId,
  files,
  onComplete,
}) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  try {
    yield graphQLCaller(
      'files',
      `
        mutation updateFiles($unitID: String!, $files: [FileInput]!) {
          updateFiles(unitID: $unitID, files: $files)
        }
      `,
      {
        unitID,
        files,
      },
    );
    yield put({
      type: FILES.handlers.get,
      folder: folderId,
    });
    Notification.success('Cập nhật files thành công.', { action: onComplete });
  } catch ({ message }) {
    yield* update();
    Notification.error(message);
  }
}

function* moveFiles({
  files,
  folder,
  onComplete,
}) {
  const unitID = (yield select())?.user?.unit?.id ?? '';
  const from = files[0].folder === 'unit' ? 'Hồ sơ đơn vị' : (yield select())?.folders?.data?.[files[0].folder]?.name ?? '';
  const to = folder === 'unit' ? 'Hồ sơ đơn vị' : (yield select())?.folders?.data?.[folder]?.name ?? '';
  const log = `${from} đến ${to}`;
  const allFiles = (yield select())?.files?.data ?? {};
  const updateFiles = clone(files);
  files.forEach(
    (file) => Object.entries(allFiles).forEach(([parrent, cfiles]) => {
      Object.values(cfiles).forEach((cFile) => {
        if (parrent === file.folder && (cFile.name).replace('_signed', '') === (file.name).replace('_signed', '') && file.id !== cFile.id) {
          updateFiles.push(({ ...cFile }));
        }
      });
    }),
  );
  try {
    yield graphQLCaller(
      'files',
      `
        mutation moveFiles($unitID: String!, $ids: [FileInput]!, $folder: String!, $log: String!) {
          moveFiles(unitID: $unitID, ids: $ids, folder: $folder, log: $log)
        }
      `,
      {
        unitID,
        ids: updateFiles.map(({ id }) => ({ id })),
        folder,
        log,
      },
    );
    Notification.success('Cập nhật file thành công.', { action: onComplete });
    yield put({
      type: FILES.handlers.get,
      folder: updateFiles[0].folder,
      label: '',
    });
    yield* getFolders(folder);
  } catch ({ message }) {
    yield* update();
    Notification.error(message);
  }
}

export const handleUploadFiles = (
  folder,
  files,
  replace = false,
  isSignAction = false,
) => ({
  type: FILES.handlers.upload,
  folder,
  files,
  replace,
  isSignAction,
});

export const handleGetFiles = (folder) => ({
  type: FILES.handlers.get,
  folder,
});

export const handleQueryFiles = (query, options = {}) => ({
  type: FILES.handlers.search,
  query,
  options,
});

export const handleRemoveFiles = (
  folder,
  ids,
  removeAll,
  onComplete,
) => ({
  type: FILES.handlers.remove,
  folder,
  ids,
  removeAll,
  onComplete,
});

export const handleWriteComment = (
  id,
  folder,
  content,
  onComplete,
) => ({
  type: FILES.handlers.comment,
  folder,
  id,
  content,
  onComplete,
});

export const handleUpdateFile = (
  id,
  folder,
  data,
  onComplete,
) => ({
  type: FILES.handlers.update,
  id,
  folder,
  data,
  onComplete,
});

export const handleBatchUpdateFiles = (
  folderId,
  files,
  onComplete,
) => ({
  type: FILES.handlers.batch,
  folderId,
  files,
  onComplete,
});

export const handleMoveFiles = (
  files,
  folder,
  onComplete,
) => ({
  type: FILES.handlers.move,
  files,
  folder,
  onComplete,
});

export default function* saga() {
  yield all([
    yield takeEvery(FILES.handlers.upload, upload),
    yield takeEvery(FILES.handlers.get, getFiles),
    yield takeEvery(FILES.handlers.remove, removeFiles),
    yield takeEvery(FILES.handlers.comment, writeComment),
    yield takeEvery(FILES.handlers.update, updateFile),
    yield takeEvery(FILES.handlers.batch, batchUpdateFiles),
    yield takeEvery(FILES.handlers.move, moveFiles),
    yield takeLatest(FILES.handlers.search, queryFiles),
  ]);
}
