import { fetchAdminData, fetchRegistration } from '../../lib/api';
import { SET_ADMIN_DATA, UPDATE_ADMIN_REGISTRATION } from '../../constants';
import { setApplicationError, clearApplicationError } from '../../actions/application';

const setAdminData = (data) => {
  return {
    type: SET_ADMIN_DATA,
    data
  };
};

const setRegistration = (uid, registration) => {
  return {
    type: UPDATE_ADMIN_REGISTRATION,
    uid,
    registration
  };
};

export const loadAdminData = (event) => {
  return (dispatch) => {
    dispatch(setAdminData());
    return fetchAdminData(event.eventId).then(data => {
      dispatch(clearApplicationError());
      dispatch(setAdminData(data));
    })
    .catch(err => {
      dispatch(setApplicationError(err, "Unable to load data for admin site"));
      dispatch(setAdminData());
    });
  };
};

export const reloadRegistration = (event, user) => {
  return (dispatch) => {
    return fetchRegistration(event, user).then(data => {
      dispatch(clearApplicationError());
      dispatch(setRegistration(user.uid, data));
    })
    .catch(err => {
      dispatch(setApplicationError(err, "Unable to reload registration for admin site"));
    });
  };
};
