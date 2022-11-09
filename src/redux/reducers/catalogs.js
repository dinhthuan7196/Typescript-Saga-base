import { CATALOGS, SIGN_OUT } from '../actions/constants';

const initialState = {
  system: {},
  app: {},
};

export default function catalogs(state = initialState, action) {
  const { system, app } = state;
  const {
    id,
    data,
  } = action;

  switch (action.type) {
    case CATALOGS.handlers.system:
      return {
        ...state,
        system: {
          ...system,
          [id]: {
            handling: true,
          },
        },
      };
    case CATALOGS.handlers.app:
      return {
        ...state,
        app: {
          ...app,
          [id]: {
            handling: true,
          },
        },
      };
    case CATALOGS.handlers.doctypes:
      return {
        ...state,
        app: {
          ...app,
          docTypes: {
            data: app?.docTypes?.data ?? {},
            handling: true,
          },
        },
      };
    case CATALOGS.handlers.departments:
      return {
        ...state,
        app: {
          ...app,
          departments: {
            data: app?.departments?.data ?? {},
            handling: true,
          },
        },
      };
    case CATALOGS.system:
      return {
        ...state,
        system: {
          ...system,
          [id]: {
            data,
            handling: false,
          },
        },
      };
    case CATALOGS.app:
      return {
        ...state,
        app: {
          ...app,
          [id]: {
            data,
            handling: false,
          },
        },
      };
    case SIGN_OUT:
      return initialState;
    default:
      return state;
  }
}
