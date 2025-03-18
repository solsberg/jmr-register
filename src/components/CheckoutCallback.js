import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';

import { useApplication } from '../providers/ApplicationProvider';
import { useAuth } from '../providers/AuthProvider';
import { usePaymentCheckout } from '../providers/PaymentCheckoutProvider';
import Loading from './Loading';
import { LOADED } from '../constants';

const CheckoutCallback = () => {
  const { status: applicationStatus } = useApplication();
  const { currentUser } = useAuth();
  const { fetchSession, loadedSessionData } = usePaymentCheckout();
  const [ searchParams ] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get('session_id');
  if (!sessionId) {
    navigate('/'); // redirect to home if no session id
  }

  useEffect(() => {
    console.log('CheckoutCallback: sessionId', sessionId);
    if (currentUser) {
      fetchSession(sessionId, currentUser);
    }
  }, [ currentUser, fetchSession, sessionId ]);

  useEffect(() => {
    if (loadedSessionData) {
      if (loadedSessionData.isAdmin === 'true') {
        console.log('CheckoutCallback: redirect to admin');
        navigate('/admin');
      } else if (applicationStatus === LOADED) {
        console.log('CheckoutCallback: redirect to event: ', loadedSessionData.eventid);
        navigate(`/${loadedSessionData.eventid}/completed`);
      }
    }
  }, [ applicationStatus, loadedSessionData, navigate ]);

  return (
    <Loading spinnerScale={1.7} spinnerColor="888" caption="Confirming payment..."/>
  );

};

export default CheckoutCallback;
