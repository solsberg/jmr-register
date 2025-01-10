import { combineReducers } from 'redux';
import application from './application';
import registration from './registration';
import earlyDeposit from './earlyDeposit';
import admin from '../admin/reducers/admin';

const reducer = combineReducers({
  application,
  registration,
  earlyDeposit,
  admin
});

export default reducer;
