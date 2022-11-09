import {
  takeLatest,
  call,
  all,
} from 'redux-saga/effects';

import { SETTINGS } from './constants';

function* updateSettings({ settings }) {
  yield call(() => new Promise((resolve) => {
    localStorage.setItem('settings', JSON.stringify(settings));
    resolve(true);
  }));
}

export const handleUpdateSettings = (settings) => ({
  type: SETTINGS.update,
  settings,
});

export default function* saga() {
  yield all([
    yield takeLatest(SETTINGS.update, updateSettings),
  ]);
}
