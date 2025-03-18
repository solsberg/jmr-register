import React, { createContext, useContext, useState } from 'react';
import { createCheckoutSession, fetchCheckoutSession } from '../lib/api';

// const stripe = Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
const PaymentCheckoutContext = createContext();

const PaymentCheckoutProvider = ({children}) => {
  const [paymentAmount, setPaymentAmount] = useState();
  const [event, setEvent] = useState();
  const [user, setUser] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [loadedSessionData, setLoadedSessionData] = useState();

  const setupCheckout = (event, user, amount, isAdmin = false, isNewRegistration = false) => {
    setEvent(event);
    setUser(user);
    setPaymentAmount(amount);
    setIsAdmin(isAdmin);
    setIsNewRegistration(isNewRegistration);
  };

  const createSession = () => {
    return createCheckoutSession(event.eventId, user.uid, paymentAmount, isAdmin, isNewRegistration,
        event.status === 'EARLY' ? 'EARLY_DEPOSIT' : 'REGISTRATION')
      .then((data) => data.clientSecret);
  };

  const fetchSession = (sessionId) => {
    fetchCheckoutSession(sessionId)
    .then((data) => {
      setLoadedSessionData(data)
    });
  };

  return (
    <PaymentCheckoutContext.Provider value={{
      setupCheckout,
      createSession,
      fetchSession,
      loadedSessionData
    }}>
      {children}
    </PaymentCheckoutContext.Provider>
  );
};

export default PaymentCheckoutProvider;

export const usePaymentCheckout = () => {
  const context = useContext(PaymentCheckoutContext);
  if (typeof context === "undefined") {
    throw new Error("usePaymentCheckout must be used within a <PaymentCheckoutProvider />");
  }
  return context;
};
