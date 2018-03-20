import { auth } from '../firebase';
import axios from 'axios';
import config from '../config';
import { recordEarlyDeposit } from './registration';
import { setApplicationError, clearApplicationError } from './application';
import { sendAdminEmail } from '../lib/api';
import { UPDATE_APPLICATION_STATE, PAYMENT_PROCESSING, LOADED } from '../constants';
import { log } from '../lib/utils';

const setPaymentProcessing = () => ({
  type: UPDATE_APPLICATION_STATE,
  value: PAYMENT_PROCESSING
});

const clearPaymentProcessing = () => ({
  type: UPDATE_APPLICATION_STATE,
  value: LOADED
});


export const attemptCharge = (amount, token, description, event, user) => {
  return (dispatch) => {
    dispatch(setPaymentProcessing());
    auth.currentUser.getIdToken().then(idToken =>
      axios.post(config.API_BASE_URL + 'charge', {
        token,
        amount,
        description,
        eventid: event.eventId,
        userid: user.uid,
        idToken
      })
    ).then(function (response) {
      log('charge response:', response);
      dispatch(recordEarlyDeposit());
      dispatch(clearApplicationError());
      dispatch(clearPaymentProcessing());
      sendAdminEmail("JMR Early Deposit received",
        `Early deposit received from ${user.email} for ${event.title}`);
      window.Rollbar.info("Early deposit made", {eventid: event.eventId, userid: user.uid});
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
