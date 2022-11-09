import { all } from 'redux-saga/effects';

import filesSaga from './files';
import foldersSaga from './folders';
import settingsSaga from './settings';
import unitsSaga from './units';
import userSaga from './user';

export default function* rootSaga() {
  yield all([
    userSaga(),
    settingsSaga(),
    filesSaga(),
    foldersSaga(),
    unitsSaga(),
  ]);
}
