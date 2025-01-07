import React, { createContext, useState } from 'react';

// const stripe = Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
export const PaymentContext = createContext();

const PaymentProvider = ({children}) => {
  const [paymentAmount, setPaymentAmount] = useState();

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

  return (
    <PaymentContext.Provider value={{
      paymentAmount,
      setPaymentAmount
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentProvider;
