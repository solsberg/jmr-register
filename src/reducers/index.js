import { combineReducers } from 'redux';
import application from './application';
import events from './events';
import registration from './registration';
import earlyDeposit from './earlyDeposit';
import admin from '../admin/reducers/admin';

const reducer = combineReducers({
  application,
  events,
  registration,
  earlyDeposit,
  admin
});

export default reducer;
