import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router';
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
  const [balance, setBalance] = useState(null);
  const { loadedSessionData } = usePaymentCheckout();
  const { status: registrationState, registration, profile } = useRegistration();
  const { serverTimestamp } = useApplication();
  const location = useLocation();

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
      `${messageType} received from ${profile.first_name} ${profile.last_name} (${currentUser.email}) for ${event.title}`,
      "JMRNotifications@menschwork.org"
    );
  }, [ balance, currentUser, event, loadedSessionData, profile ]);

  useEffect(() => {
    if (registrationState === LOADED) {
      const { balance: statementBalance } = buildStatement(registration, event, currentUser, serverTimestamp);
      setBalance(statementBalance);

      if (!emailSent) {
        sendEmailConfirmation();
      }
    }
  }, [registrationState, registration, event, currentUser, serverTimestamp, sendEmailConfirmation, emailSent]);

  if (registrationState !== LOADED || balance === null) {
    return (
      <Loading spinnerScale={1.7} spinnerColor="888" />
    );
  } else if (balance <= 0) {
    return (
      <div className="alert alert-success" role="alert">
        Thank you for completing your registration. You will receive a confirmation email shortly. We look forward to seeing you at the retreat.
      </div>
    );
  } else {
    const parentUrl = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    return (
      <div className="alert alert-success" role="alert">
        Thank you for submitting your registration. You will receive a confirmation email shortly. Please <Link to={`${parentUrl}/payment`}>return to the payment page</Link> to pay the balance
        of the registration fee by {moment(event.finalPaymentDate).format("MMMM Do")}.
      </div>
    );
  }
};

export default CheckoutCompleted;
