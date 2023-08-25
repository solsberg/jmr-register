import { auth } from '../firebase';
import axios from 'axios';
import config from '../config';
import { recordEarlyDeposit } from './registration';
import { setApplicationError, clearApplicationError } from './application';
import { APPLICATION_STATE_CHANGED, ADD_PAYMENT, PAYMENT_PROCESSING, LOADED } from '../constants';
import { log } from '../lib/utils';

const setPaymentProcessing = () => ({
  type: APPLICATION_STATE_CHANGED,
  value: PAYMENT_PROCESSING
});

const clearPaymentProcessing = () => ({
  type: APPLICATION_STATE_CHANGED,
  value: LOADED
});

const recordPayment = (payment) => ({
  type: ADD_PAYMENT,
  payment
});

export const attemptCharge = (amount, token, description, event, user, onSuccess) => {
  return (dispatch) => {
    const isEarlyDeposit = (event.status == 'EARLY');
    dispatch(setPaymentProcessing());
    auth.currentUser.getIdToken().then(idToken =>
      axios.post(config.API_BASE_URL + 'charge', {
        token,
        amountInCents: amount,
        description,
        eventid: event.eventId,
        userid: user.uid,
        paymentType: isEarlyDeposit ? 'EARLY_DEPOSIT' : 'REGISTRATION',
        idToken
      })
    ).then(function (response) {
      log('charge response:', response);
      if (isEarlyDeposit) {
        dispatch(recordEarlyDeposit());
      } else {
        dispatch(recordPayment(response.data));
      }
      dispatch(clearApplicationError());
      dispatch(clearPaymentProcessing());
      if (onSuccess) {
        onSuccess();
      }
      const paymentType = isEarlyDeposit ? "Early deposit" : "Registration payment";
      window.Rollbar.info(paymentType + " made", {eventid: event.eventId, userid: user.uid});
    })
    .catch(function (error) {
      log('charge error', error);
      window.Rollbar.info("Error making early deposit payment", {eventid: event.eventId, userid: user.uid, error});
      let uiMessage;
      if (!!error.response) {
        uiMessage = error.response.data && error.response.data.userMessage;
        if (!uiMessage) {
          uiMessage = "We were unable to process your payment";
        }
      } else {
        uiMessage = "We had a problem sending your payment request";
      }
      dispatch(setApplicationError(`payment charge error: ${error}`, uiMessage));
      dispatch(clearPaymentProcessing());
    });
  }
}
