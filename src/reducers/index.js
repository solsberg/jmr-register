import { combineReducers } from 'redux';
import application from './application';
import events from './events';

const reducer = combineReducers({
  application,
  events
});

export default reducer;
