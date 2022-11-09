import { SETTINGS, SIGN_OUT } from '../actions/constants';

const initialState = {
  dark: false,
};

export default function settings(state = initialState, action) {
  switch (action.type) {
    case SETTINGS.update:
      const newState = { ...state };
      Object.entries(action.settings).forEach(([key, val]) => {
        newState[key] = val;
      }, action.settings);
      return newState;
    case SIGN_OUT:
      return initialState;
    default:
      return state;
  }
}
