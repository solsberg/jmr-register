import { auth } from '../firebase';
import axios from 'axios';
import config from '../config';
import { setRegistration } from './registration';
import { setApplicationError, clearApplicationError } from './application';
import { UPDATE_APPLICATION_STATE, PAYMENT_PROCESSING, LOADED } from '../constants';

const setPaymentProcessing = () => ({
  type: UPDATE_APPLICATION_STATE,
  value: PAYMENT_PROCESSING
});

const clearPaymentProcessing = () => ({
  type: UPDATE_APPLICATION_STATE,
  value: LOADED
});


export const attemptCharge = (amount, token, description, eventid, userid) => {
  return (dispatch) => {
    //TODO loading spinner
    dispatch(setPaymentProcessing());
    auth.currentUser.getIdToken().then(idToken =>
      axios.post(config.API_BASE_URL + 'charge', {
        token,
        amount,
        description,
        eventid,
        userid,
        idToken
      })
    ).then(function (response) {
      console.log('charge response:', response);
      dispatch(setRegistration({madeEarlyDeposit: true}));
      dispatch(clearApplicationError());
      dispatch(clearPaymentProcessing());
    })
    .catch(function (error) {
      console.log('charge error', error);
      dispatch(setApplicationError("There was an error trying to charge your card"));
      dispatch(clearPaymentProcessing());
    });
  }
}
