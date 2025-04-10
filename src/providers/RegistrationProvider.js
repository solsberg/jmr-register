import React, { createContext, useContext, useState, useCallback } from 'react';
import { useApplication } from '../providers/ApplicationProvider';
import { fetchRegistration, fetchUserData,
  updateUserProfile, updateRegistrationCart, updateRegistrationOrder, updateScholarshipApplication,
  sendAdminEmail, fetchPromotions, postBambamEmails } from '../lib/api';
import { LOADING, LOADED } from '../constants';

const RegistrationContext = createContext();

const RegistrationProvider = ({children}) => {
  const [status, setStatus] = useState();
  const [registration, setRegistration] = useState();
  const [profile, setProfile] = useState();
  const [bambam, setBambam] = useState();
  const [roomUpgrade, setRoomUpgrade] = useState();
  const [madeEarlyDeposit, setMadeEarlyDeposit] = useState(false);
  const { setApplicationError, clearApplicationError } = useApplication();

  const loadRegistration = useCallback((event, user) => {
    if (!event || !user) {
      return;
    }
    setStatus(LOADING);
    return Promise.all([
      fetchRegistration(event, user),
      fetchUserData(user.uid),
      fetchPromotions(event.eventId, user.uid)
    ]).then(([registration, userData, promotions]) => {
      setRegistration(registration || {});
      setProfile((userData && userData.profile) || {});
      setBambam(promotions.bambam);
      setRoomUpgrade(promotions.roomUpgrade);
      setMadeEarlyDeposit(registration && registration.earlyDeposit && registration.earlyDeposit.status === 'paid');
      setStatus(LOADED);
      clearApplicationError();
    })
    .catch(err => setApplicationError(err, "Unable to load registration"));
  }, [ setStatus, setRegistration, setProfile, setBambam, setRoomUpgrade, setApplicationError, clearApplicationError ]);

  const clearRegistration = useCallback(() => {
    setRegistration();
    setProfile();
    setBambam();
    setRoomUpgrade();
  }, [ setRegistration, setProfile, setBambam, setRoomUpgrade ]);

  const updateProfile = (user, event, profile, personalInfo) => {
    setProfile(profile);
    setRegistration({ ...registration, personal: personalInfo });
    updateUserProfile(user.uid, event.eventId, profile, personalInfo)
    .then(() => clearApplicationError())
    .catch(err => setApplicationError(err, "Unable to save profile changes"));
  };

  const addToCart = (event, user, values) => {
    updateRegistrationCart(event.eventId, user.uid, values)
    .then(() => loadRegistration(event, user));
  };

  const updateOrder = (event, user, values) => {
    updateRegistrationOrder(event.eventId, user.uid, values)
    .then(() => {
      let order = (registration && registration.order) || {};
      order = { ...order, ...values };
      setRegistration({ ...registration, order });
    });
  };

  const setScholarship = (values) => {
    setRegistration({ ...registration, scholarship: values });
  };

  const applyForScholarship = (event, user, values) => {
    setScholarship({...values, submitted: false});
    updateScholarshipApplication(event.eventId, user.uid, values)
    .then(() => {
      setScholarship({...values, submitted: true});
      const messageType = (values.type === 'yml' ? "YML" : "Financial Aid");
      sendAdminEmail("JMR " + messageType + " application received",
        `${messageType} application received from ${user.email} for ${event.title}`,
        "finaid@menschwork.org"
      );
    });
  };

  const submitBambamEmails = (event, user, emails, callback) => {
    postBambamEmails(event.eventId, user.uid, emails)
    .then((errors) => {
      if (!!callback) {
        callback(errors);
      }
    });
  };

  // const recordPayment = (payment) => {
  //   let payments = (registration && registration.account && registration.account.payments) || {};
  //   payments = Object.assign({}, payments, {newPayment: payment});
  //   const account = { ...registration.account, payments };
  //   setRegistration({ ...registration, account });
  // };

  // const recordEarlyDeposit = () => {
  //   setMadeEarlyDeposit(true);
  // };

  /*
    from old attemptCharge action, on complete do:
      if (isEarlyDeposit) {
        dispatch(recordEarlyDeposit());
      } else {
        dispatch(recordPayment(response.data));
      }
  */

  return (
    <RegistrationContext.Provider value={{
      status,
      registration,
      profile,
      bambam,
      roomUpgrade,
      loadRegistration,
      clearRegistration,
      updateProfile,
      addToCart,
      updateOrder,
      applyForScholarship,
      submitBambamEmails,
      madeEarlyDeposit
    }}>
      {children}
    </RegistrationContext.Provider>
  );
};

export default RegistrationProvider;

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (typeof context === "undefined") {
    throw new Error("useRegistration must be used within a <RegistrationProvider />");
  }
  return context;
};
