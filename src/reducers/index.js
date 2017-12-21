import { combineReducers } from 'redux';
import application from './application';
import auth from './auth';
import events from './events';

const reducer = combineReducers({
  application,
  auth,
  events
});

export default reducer;
