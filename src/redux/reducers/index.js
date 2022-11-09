import { combineReducers } from 'redux';

import catalogs from './catalogs';
import files from './files';
import folders from './folders';
import settings from './settings';
import units from './units';
import user from './user';

const rootReducer = combineReducers({
  user,
  catalogs,
  settings,
  folders,
  files,
  units,
});

export default rootReducer;
