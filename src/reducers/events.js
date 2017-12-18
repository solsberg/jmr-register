import { ADD_EVENT } from '../constants';

export default function(state = [], action) {
  switch (action.type) {
    case ADD_EVENT:
      return [...state, {
        eventId: action.eventId,
        title: action.title
      }];
    default:
      return state;
  }
}
