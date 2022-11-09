export const USER = {
  handlers: {
    login: 'USER_LOGIN_HANDLER',
    update: 'USER_UPDATE_HANDLER',
    unit: 'USER_UPDATE_UNIT_HANDLERS',
    logs: 'USER_LOGS_HANDLER',
    signOut: 'USER_SIGNOUT_HANDLER',
    switch: 'USER_SWITCH_HANDLER',
  },
  update: 'USER_UPDATE',
  unit: 'USER_UPDATE_UNIT',
};

export const CATALOGS = {
  handlers: {
    system: 'CATALOGS_QUERY_SYSTEM_HANDLER',
    app: 'CATALOGS_QUERY_APP_HANDLER',
  },
  system: 'CATALOGS_SYSTEM',
  app: 'CATALOGS_APP',
};

export const FOLDERS = {
  handlers: {
    get: 'FOLDERS_GET_HANDLERS',
    create: 'FOLDERS_CREATE_HANDLERS',
    update: 'FOLDERS_UPDATE_HANDLERS',
    remove: 'FOLDERS_REMOVE_HANDLERS',
    upload: 'FOLDERS_UPLOAD_HANDLERS',
    files: 'FOLDERS_FILES_HANDLERS',
    permissions: 'FOLDERS_PERMISSIONS_HANDLERS',
    year: 'FOLDERS_YEAR_HANDLERS',
    template: 'FOLDERS_TEMPLATE_HANDLERS',
    clean: 'FOLDERS_CLEAN_HANDLERS',
    view: 'FOLDERS_VIEW_HANDLERS',
    askCreate: 'FOLDERS_ASK_CREATE_HANDLERS',
  },
  merge: 'FOLDER_MERGE',
  reload: 'FOLDER_RELOAD',
  update: 'FOLDER_UPDATE',
  files: 'FOLDER_FILES',
  units: 'FOLDER_UNITS',
  size: 'FOLDER_SIZE',
  showHidden: 'FOLDERS_SHOWHIDDEN',
};

export const UNITS = {
  handlers: {
    create: 'UNITS_CREATE_HANDLER',
    update: 'UNITS_UPDATE_HANDLER',
    remove: 'UNITS_REMOVE_HANDLER',
    find: 'UNITS_FIND_HANDLER',
  },
  fetch: 'UNITS_FETCH',
  update: 'UNITS_UPDATE',
};

export const FILES = {
  handlers: {
    get: 'FILES_GET_HANDLERS',
    search: 'FILES_SEARCH_HANDLERS',
    upload: 'FILES_UPLOAD_HANDLERS',
    remove: 'FILES_REMOVE_HANDLERS',
    name: 'FILES_NAME_HANDLERS',
    comment: 'FILES_COMMENT_HANDLERS',
    update: 'FILES_UPDATE_HANDLERS',
    batch: 'FILES_BATCH_HANDLERS',
    move: 'FILES_MOVE_HANDLERS',
  },
  update: 'FILES_UPDATE',
  comment: 'FILES_COMMENT',
  search: 'FILES_SEARCH',
  file: {
    update: 'FILE_UPDATE',
  },
};

export const SETTINGS = {
  update: 'UPDATE_SETTINGS',
};

export const LOGS = {
  handlers: {
    recent: 'LOGS_RECENT_HANDLER',
    document: 'LOGS_DOCUMENT_HANDLER',
  },
  update: 'LOGS_UPDATE',
};

export const SIGN_OUT = 'SIGN_OUT';
