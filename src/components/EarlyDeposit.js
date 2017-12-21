import React from 'react';
import SignInContainer from '../containers/SignInContainer';

const EarlyDeposit = ({event, currentUser}) => (
  !currentUser ?
    <SignInContainer /> :
    <div>
      Payment Form - $36
    </div>
);

export default EarlyDeposit;
