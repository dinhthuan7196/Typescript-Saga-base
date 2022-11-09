import { USER, SIGN_OUT } from '../actions/constants';

const initialState = {
  authorizing: true,
};

export default function user(state = initialState, action) {
  const {
    type,
    admins,
    staffs,
    groups,
    labels,
    ...rest
  } = action;

  switch (type) {
    case USER.handlers.login:
    case USER.handlers.signOut:
      return {
        authorizing: true,
      };
    case USER.handlers.update:
    case USER.handlers.unit:
      return {
        ...state,
        handling: true,
      };
    case USER.update:
      return {
        ...state,
        ...rest,
        handling: false,
      };
    case USER.unit:
      return {
        ...state,
        unit: {
          ...(state?.unit ?? {}),
          admins,
          staffs,
          groups,
          labels,
        },
        handling: false,
      };
    case SIGN_OUT:
      return {
        authorizing: false,
      };
    default:
      return state;
  }
}
