import {
  omit,
} from '@xbotvn/utils/collection';

import { SIGN_OUT, FILES } from '../actions/constants';

const initialState = {};

export default function files(state = initialState, action) {
  const {
    folder,
    data,
    file,
    type,
    query,
    options,
  } = action;

  switch (type) {
    case FILES.handlers.search:
      if (query) {
        return {
          ...state,
          search: {
            query,
            options,
            data: {},
          },
          handling: true,
        };
      }
      return {
        ...state,
        search: {},
      };
    case FILES.handlers.get:
    case FILES.handlers.upload:
    case FILES.handlers.update:
    case FILES.handlers.remove:
      return {
        ...state,
        handling: true,
      };
    case FILES.search:
      return {
        ...state,
        search: {
          ...(state.search ?? {}),
          data,
        },
        handling: false,
      };
    case FILES.update:
      return {
        ...state,
        data: {
          ...(state?.data ?? {}),
          [folder]: data,
        },
        handling: false,
      };
    case FILES.file.update:
      const fileKeys = Object.keys(data);
      return {
        ...state,
        data: {
          ...(state?.data ?? {}),
          [folder]: {
            ...(state?.data?.[folder] ?? {}),
            [file]: {
              ...omit(state?.data?.[folder]?.[file] ?? {}, fileKeys),
              ...data,
            },
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
