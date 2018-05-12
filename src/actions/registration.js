import { fetchRegistration, recordExternalPayment as recordExternalPaymentApi, fetchUserData,
  updateUserProfile, updateRegistrationCart } from '../lib/api';
import { setApplicationError, clearApplicationError } from './application';
import { SET_REGISTRATION, SET_REGISTRATION_STATUS, LOADING, LOADED, RECORD_EARLY_DEPOSIT,
  UPDATE_PROFILE, UPDATE_CART, SET_PERSONAL_INFO } from '../constants';

export const setRegistration = (registration, profile) => {
  return {
    type: SET_REGISTRATION,
    registration,
    profile
  }
}

export const setRegistrationStatus = (status) => {
  return {
    type: SET_REGISTRATION_STATUS,
    status
  }
}

export const clearRegistration = () => {
  return setRegistration(null, null);
}

export const loadRegistration = (event, user) => {
  return (dispatch) => {
    if (!event || !user) {
      return;
    }
    dispatch(setRegistrationStatus(LOADING));
    return Promise.all([
      fetchRegistration(event, user),
      fetchUserData(user.uid)
    ]).then(([registration, userData]) => {
      dispatch(setRegistration(registration || {}, (userData && userData.profile) || {}));
      dispatch(setRegistrationStatus(LOADED));
      dispatch(clearApplicationError());
    })
    .catch(err => dispatch(setApplicationError(err, "Unable to load registration")));
  };
};

export const recordEarlyDeposit = () => ({
  type: RECORD_EARLY_DEPOSIT
});

export const recordExternalPayment = (event, user, externalType) => {
  return (dispatch) => {
    let item = event.status === "FULL" ? "registration" : "earlyDeposit";
    recordExternalPaymentApi(event, user, externalType, item);
    window.Rollbar.info("External payment", {event, user, externalType, item});
  }
}

const setProfile = (profile) => ({
  type: UPDATE_PROFILE,
  profile
});

const setPersonalInfo = (personalInfo) => ({
  type: SET_PERSONAL_INFO,
  personalInfo
});

export const updateProfile = (user, event, profile, personalInfo) => {
  return (dispatch) => {
    dispatch(setProfile(profile));
    dispatch(setPersonalInfo(personalInfo));
    updateUserProfile(user.uid, event.eventId, profile, personalInfo)
    .then(() => dispatch(clearApplicationError()))
    .catch(err => dispatch(setApplicationError(err, "Unable to save profile changes")));
  };
};

const updateCart = (values) => ({
  type: UPDATE_CART,
  values
});

export const applyRoomChoice = (event, user, values) => {
  return (dispatch) => {
    updateRegistrationCart(event.eventId, user.uid, values);
    dispatch(updateCart(values));
    window.Rollbar.info("Record room choice", {event, user, values});
  }
};
