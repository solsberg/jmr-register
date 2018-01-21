import axios from 'axios';
import config from '../config';

export const attemptCharge = (amount, token, description) => {
  return (dispatch) => {
    //TODO loading spinner
    axios.post(config.API_BASE_URL + 'charge', {
      token,
      amount,
      description
    }).then(function (response) {
      console.log('charge response:', response);
      // dispatch(clearApplicationError());
    })
    .catch(function (error) {
      console.log('charge error', error);
      // dispatch(setApplicationError(`signIn error: (${err.code}) ${err.message}`, err.message));
    });
  }
}
