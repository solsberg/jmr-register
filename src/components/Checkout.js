import React, { useCallback, useContext } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { createCheckoutSession } from '../lib/api';
import { PaymentContext } from '../contexts/PaymentContext';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// import get from 'lodash/get';
// import has from 'lodash/has';
// import classNames from 'classnames';
// import moment from 'moment';
// import MoneyField from './MoneyField';
// import StatementTable from './StatementTable';
// import Loading from './Loading';
// import { LOADED, PAYPAL, CHECK } from '../constants';
// import { formatMoney, buildStatement, validateEmail, isPreRegistered, getPreRegistrationDiscount } from '../lib/utils';
// import { sendAdminEmail, sendTemplateEmail, validateDiscountCode } from '../lib/api';
// import TERMS from '../terms.json';
// import { min } from 'lodash';

const Checkout = ({
  registration, registrationStatus, event, currentUser, serverTimestamp
}) => {
  const { paymentAmount } = useContext(PaymentContext);

  const fetchClientSecret = useCallback(() => {
    // Create a Checkout Session
    return createCheckoutSession(event.eventId, currentUser.uid, paymentAmount,
        event.status == 'EARLY' ? 'EARLY_DEPOSIT' : 'REGISTRATION')
      .then((data) => data.clientSecret);
  }, [ paymentAmount]);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )

};

export default Checkout;
