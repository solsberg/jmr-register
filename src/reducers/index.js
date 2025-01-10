import { combineReducers } from 'redux';
import application from './application';
import registration from './registration';
import earlyDeposit from './earlyDeposit';

const reducer = combineReducers({
  application,
  registration,
  earlyDeposit,
});

export default reducer;
