import React, { createContext, useState } from 'react';
import { createCheckoutSession } from '../lib/api';

// const stripe = Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
export const PaymentContext = createContext();

const PaymentProvider = ({children}) => {
  const [paymentAmount, setPaymentAmount] = useState();
  const [event, setEvent] = useState();
  const [user, setUser] = useState();

  // const fetchClientSecret = () => {
  //   return createCheckoutSession(paymentAmount);
  //   // const response = await fetch("/create-checkout-session", {
  //   //   method: "POST",
  //   // });
  //   // const { clientSecret } = await response.json();
  //   // return clientSecret;
  // };

  // const initializeCheckout = (amount) => {

  //   const checkout = stripe.initEmbeddedCheckout({
  //     fetchClientSecret,
  //   });
  // };

  const setupCheckout = (event, user, amount) => {
    setEvent(event);
    setUser(user);
    setPaymentAmount(amount);
  };

  const createSession = () => {
    return createCheckoutSession(event.eventId, user.uid, paymentAmount,
        event.status === 'EARLY' ? 'EARLY_DEPOSIT' : 'REGISTRATION')
      .then((data) => data.clientSecret);
  };

  return (
    <PaymentContext.Provider value={{
      setupCheckout,
      createSession
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentProvider;
