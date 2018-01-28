import { combineReducers } from 'redux';
import application from './application';
import auth from './auth';
import events from './events';
import registration from './registration';

const reducer = combineReducers({
  application,
  auth,
  events,
  registration
});

export default reducer;
