import {
  cloneDeep,
  unset,
} from '@xbotvn/utils/collection';

import { SIGN_OUT, FOLDERS } from '../actions/constants';

const initialState = {
  year: new Date().getFullYear(),
  showHidden: false,
  askCreate: false,
};

export default function folders(state = initialState, action) {
  const {
    id,
    data,
    units,
    type,
    size,
    year,
    folder,
    search,
    askCreate,
    reportedUnit,
  } = action;

  switch (type) {
    case FOLDERS.handlers.clean:
    case FOLDERS.handlers.get:
    case FOLDERS.handlers.update:
    case FOLDERS.handlers.create:
    case FOLDERS.handlers.files:
    case FOLDERS.handlers.remove:
    case FOLDERS.handlers.template:
      return {
        ...state,
        handling: true,
      };
    case FOLDERS.handlers.year:
      return {
        ...state,
        year,
      };
    case FOLDERS.handlers.view:
      return {
        ...state,
        folder,
        search,
        reportedUnit,
      };
    case FOLDERS.handlers.askCreate:
      return {
        ...state,
        askCreate,
      };
    case FOLDERS.merge:
      return {
        ...state,
        data: {
          ...(state?.data ?? {}),
          ...data,
        },
        handling: false,
      };
    case FOLDERS.reload:
      return {
        ...state,
        data,
        handling: false,
      };
    case FOLDERS.showHidden:
      return {
        ...state,
        showHidden: !(state?.showHidden ?? false),
      };
    case FOLDERS.update:
      if (id) {
        if (data) {
          return {
            ...state,
            data: {
              ...(state?.data ?? {}),
              [id]: {
                ...(state?.data?.[id] ?? {}),
                ...data,
              },
            },
            handling: false,
          };
        }
        const clone = cloneDeep(state?.data ?? {});
        unset(clone, id);
        return {
          ...state,
          data: clone,
          handling: false,
        };
      }
      return {
        ...state,
        handling: false,
      };
    case FOLDERS.size:
      return {
        ...state,
        data: {
          ...(state?.data ?? {}),
          [id]: {
            ...(state?.data?.[id] ?? {}),
            size,
          },
        },
      };
    case FOLDERS.units:
      return {
        ...state,
        units: {
          ...(state?.units ?? {}),
          ...units,
        },
      };
    case FOLDERS.files:
      return {
        ...state,
        data: {
          ...(state?.data ?? {}),
          [id]: {
            ...(state?.data?.[id] ?? {}),
            files: data,
          },
        },
        handling: false,
      };
    case SIGN_OUT:
      return initialState;
    default:
      return state;
  }
}
