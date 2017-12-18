import { UPDATE_APPLICATION_STATE } from '../constants';

export default function(state = {}, action) {
  switch (action.type) {
    case UPDATE_APPLICATION_STATE:
      return {
        state: action.value
      };
    default:
      return state;
  }
}
