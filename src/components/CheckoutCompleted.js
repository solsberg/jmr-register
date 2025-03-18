import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';

import { usePaymentCheckout } from '../providers/PaymentCheckoutProvider';
import { useRegistration } from '../providers/RegistrationProvider';
import { useApplication } from '../providers/ApplicationProvider';
import Loading from './Loading';
import { buildStatement, formatMoney } from '../lib/utils';
import { sendAdminEmail, sendTemplateEmail } from '../lib/api';
import { LOADED } from '../constants';

const CheckoutCompleted = ({ event, currentUser }) => {
  const [emailSent, setEmailSent] = useState(false);
  const [message, setMessage] = useState(null);
  const [balance, setBalance] = useState(null);
  const { loadedSessionData } = usePaymentCheckout();
  const { status: registrationState, registration, profile } = useRegistration();
  const { serverTimestamp } = useApplication();

  const sendEmailConfirmation = useCallback(() => {
    setEmailSent(true);

    const isNewRegistration = loadedSessionData.isNewRegistration === 'true';

    const messageType = isNewRegistration ? "Registration" : "Additional registration payment";
    if (isNewRegistration) {
      sendTemplateEmail("JMR registration confirmation",
        balance > 0 ? "confirmation_partial" : "confirmation_paid",
        currentUser.email, "jmr@menschwork.org",
        [
          {pattern: "%%first_name%%", value: profile.first_name},
          {pattern: "%%event_title%%", value: event.title},
          {pattern: "%%event_email%%", value: "jmr@menschwork.org"},
          {pattern: "%%balance%%", value: formatMoney(balance)},
          {pattern: "%%payment_date%%", value: moment(event.finalPaymentDate).format("MMMM Do")}
        ]);
    }
    sendAdminEmail("JMR " + messageType + " received",
      `${messageType} received from ${profile.first_name} ${profile.last_name} (${currentUser.email}) for ${event.title}`);
  }, [ balance, currentUser, event, loadedSessionData, profile ]);

  useEffect(() => {
    if (registrationState === LOADED && balance !== null) {
      if (!emailSent) {
        console.log('CheckoutCompleted: sending email confirmation');
        sendEmailConfirmation();
      }

      if (balance <= 0) {
        setMessage("Thank you for completing your registration. We look forward to seeing you at the retreat.");
      } else {
        setMessage("Thank you for submitting your registration. Please return to this page to pay the balance " +
          `of the registration fee by ${moment(event.finalPaymentDate).format("MMMM Do")}.`);
      }
    }
  }, [ registrationState, loadedSessionData, sendEmailConfirmation, emailSent, balance, event ]);

  useEffect(() => {
    if (registrationState === LOADED) {
      console.log('CheckoutCompleted: setting balance');
      const { balance: statementBalance } = buildStatement(registration, event, currentUser, serverTimestamp);
      setBalance(statementBalance);
    }
  }, [registrationState, registration, event, currentUser, serverTimestamp]);

  if (registrationState !== LOADED) {
    return (
      <Loading spinnerScale={1.7} spinnerColor="888" />
    );
  } else {
    return (
      <div className="alert alert-success" role="alert">
        {message}
      </div>
    );
  }
};

export default CheckoutCompleted;
