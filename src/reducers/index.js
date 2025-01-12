import { combineReducers } from 'redux';
import application from './application';
import earlyDeposit from './earlyDeposit';

const reducer = combineReducers({
  application,
  earlyDeposit,
});

export default reducer;
