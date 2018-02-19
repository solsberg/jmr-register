import { ADD_EVENT } from '../constants';

export default function(state = [], action) {
  switch (action.type) {
    case ADD_EVENT:
      return [...state, action.event];
    default:
      return state;
  }
}
