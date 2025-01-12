import React, { useState } from 'react';
import SignIn from '../components/SignIn';
import Loading from './Loading';
import { LOADING, PAYPAL, CHECK, PAYMENT_PROCESSING } from '../constants';
import { sendAdminEmail } from '../lib/api';
import { useAuth } from '../providers/AuthProvider';
import { useApplication } from '../providers/ApplicationProvider';
import { useRegistration } from '../providers/RegistrationProvider';

const EarlyDeposit = ({ event }) => {
  const [currentPayment, setCurrentPayment] = useState(false);
  const [message, setMessage] = useState(null);
  const { currentUser } = useAuth();
  const { status : registrationStatus, madeEarlyDeposit } = useRegistration();
  const { status : applicationStatus } = useApplication();

  const paymentProcessing = applicationStatus === PAYMENT_PROCESSING;

  // componentDidMount() {
  //   const {event, handleCharge} = this.props;

  //   this.stripehandler = window.StripeCheckout.configure({
  //     key: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
  //     image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
  //     locale: 'auto',
  //     token: (token, args) => {
  //       //reference props.currentUser here as auth state may have changed since component loaded
  //       handleCharge(3600, token.id, `${event.title} Early Deposit`, event, this.props.currentUser, () => {
  //         sendAdminEmail("JMR Early deposit received",
  //           `Early deposit received from ${this.props.currentUser.email} for ${event.title}`);
  //       });
  //     }
  //   });
  // }

  // componentWillUnmount() {
  //   if (this.stripehandler) {
  //     this.stripehandler.close();
  //   }
  // }

  const onHandleCreditCard = () => {
    setCurrentPayment(true);
    setMessage(null);
    // this.stripehandler.open({
    //   name: 'Menschwork',
    //   description: `${event.title} Deposit`,
    //   panelLabel: 'Make Deposit',
    //   amount: 3600,
    //   email: this.props.currentUser.email,
    //   zipCode: true
    // });
  };

  const onHandlePayPal = () => {
    // window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=259FLZRBLKRZY', '_blank');
    setMessage("Payments made using PayPal will be reflected on this page once confirmed after a few days");
    // });
    // recordExternalPayment(event, currentUser, PAYPAL);
  };

  const onHandleCheck = () => {
    setMessage("Please send a check for $36 made payable to Menschwork and mailed to Menschwork, PO Box 4020, Philadelphia, PA 19118");
    // recordExternalPayment(event, currentUser, CHECK);
  };

  const getExistingDepositMessage = () => {
    let msg = currentPayment ? "Thank you for making a $36 deposit"
      : "You have already made a $36 deposit";
    return msg + ". We will hold a place at the event for you and let you know when registration has opened."
  };

  return !currentUser ? <SignIn /> :
    <div className="row justify-content-center">
      <div className="card col col-md-8 m-3">
        <div className="card-body">
          {registrationStatus === LOADING ?
              <Loading /> :
            paymentProcessing ?
              <Loading
                caption="Processing payment"
                spinnerScale={1.2}
                spinnerColor="#b44"
              /> :
            madeEarlyDeposit() ?
            <h5 className="text-center">{getExistingDepositMessage()}</h5> :
            <div id="early-deposit-request">
              <h5 className="text-center">Hold Your Place for {event.title} with a $36 Deposit</h5>
              <div className="d-flex flex-column flex-md-row justify-content-center mt-4">
                <button className="btn btn-primary m-1" onClick={onHandleCreditCard}>Pay with Credit Card</button>
                <button className="btn btn-sm btn-outline-info m-1" onClick={onHandlePayPal}>Pay with PayPal</button>
                <button className="btn btn-sm btn-outline-success m-1" onClick={onHandleCheck}>Pay with Check</button>
              </div>
              {message &&
                <div className="row justify-content-center">
                  <div className="alert alert-info mt-3 col-10" role="alert">
                    <p className="text-center p-3">{message}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  ;
}

export default EarlyDeposit;
