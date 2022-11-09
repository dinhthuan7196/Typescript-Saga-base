import { unset, cloneDeep } from '@xbotvn/utils/collection';

import { UNITS, SIGN_OUT } from '../actions/constants';

const initialState = {
  filters: [],
};

export default function units(state = initialState, action) {
  const {
    type,
    id,
    data,
    filters,
  } = action;

  switch (type) {
    case UNITS.handlers.find:
      return {
        ...state,
        handling: true,
      };
    case UNITS.handlers.update:
    case UNITS.handlers.create:
      return {
        ...state,
        handling: true,
      };
    case UNITS.fetch:
      return {
        ...state,
        filters,
        data: {
          ...(state?.data ?? {}),
          ...data,
        },
        handling: false,
      };
    case UNITS.update:
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
      const cloned = cloneDeep(state.data);
      unset(cloned, id);
      return {
        ...state,
        data: cloned,
        handling: false,
      };
    case SIGN_OUT:
      return initialState;
    default:
      return state;
  }
}
