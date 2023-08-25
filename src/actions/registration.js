import { fetchRegistration, recordExternalPayment as recordExternalPaymentApi, fetchUserData,
  updateUserProfile, updateRegistrationCart, updateRegistrationOrder, updateScholarshipApplication,
  sendAdminEmail, fetchPromotions, postBambamEmails } from '../lib/api';
import { setApplicationError, clearApplicationError } from './application';
import { SET_REGISTRATION, SET_REGISTRATION_STATUS, LOADING, LOADED, RECORD_EARLY_DEPOSIT,
  UPDATE_PROFILE, UPDATE_CART, UPDATE_ORDER, UPDATE_SCHOLARSHIP, SET_PERSONAL_INFO,
  SET_PROMOTIONS } from '../constants';

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

const setPromotions = (promotions) => {
  return {
    type: SET_PROMOTIONS,
    promotions
  }
}

export const loadRegistration = (event, user) => {
  return (dispatch) => {
    if (!event || !user) {
      return;
    }
    dispatch(setRegistrationStatus(LOADING));
    return Promise.all([
      fetchRegistration(event, user),
      fetchUserData(user.uid),
      fetchPromotions(event.eventId, user.uid)
    ]).then(([registration, userData, promotions]) => {
      dispatch(setRegistration(registration || {}, (userData && userData.profile) || {}));
      dispatch(setPromotions(promotions));
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
  return () => {
    let item = event.status == "EARLY" ? "earlyDeposit" : "registration";
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

export const addToCart = (event, user, values) => {
  return (dispatch) => {
    updateRegistrationCart(event.eventId, user.uid, values)
    .then(() => dispatch(loadRegistration(event, user)));
  }
};

const updateOrderData = (values) => ({
  type: UPDATE_ORDER,
  values
});

export const updateOrder = (event, user, values) => {
  return (dispatch) => {
    updateRegistrationOrder(event.eventId, user.uid, values)
    .then(() => {
      dispatch(updateOrderData(values));
    });
  }
};

const updateScholarship = (values) => ({
  type: UPDATE_SCHOLARSHIP,
  values
});

export const applyForScholarship = (event, user, values) => {
  return (dispatch) => {
    dispatch(updateScholarship({...values, submitted: false}));
    updateScholarshipApplication(event.eventId, user.uid, values)
    .then(() => {
      dispatch(updateScholarship({...values, submitted: true}));
      const messageType = (values.type === 'yml' ? "YML" : "Financial Aid");
      sendAdminEmail("JMR " + messageType + " application received",
        `${messageType} application received from ${user.email} for ${event.title}`,
        "scholarships@menschwork.org"
      );
    });
  }
};

export const submitBambamEmails = (event, user, emails, callback) => {
  return (dispatch) => {
    postBambamEmails(event.eventId, user.uid, emails)
    .then((errors) => {
      if (!!callback) {
        callback(errors);
      }
    });
  }
};
