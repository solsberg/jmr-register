import { combineReducers } from 'redux';
import application from './application';
import auth from './auth';
import events from './events';
import registration from './registration';
import earlyDeposit from './earlyDeposit';

const reducer = combineReducers({
  application,
  auth,
  events,
  registration,
  earlyDeposit
});

export default reducer;
