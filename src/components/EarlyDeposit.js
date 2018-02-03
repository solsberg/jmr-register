import React from 'react';
import SignInContainer from '../containers/SignInContainer';
import Loading from './Loading';
import { LOADING } from '../constants';

class EarlyDeposit extends React.Component {
  componentDidMount() {
    const {event, currentUser, handleCharge, setCurrentEvent, loadRegistration} = this.props;

    setCurrentEvent(event);
    if (!!currentUser) {
      loadRegistration(event, currentUser);
    }

    this.stripehandler = window.StripeCheckout.configure({
      key: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
      image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
      locale: 'auto',
      token: (token, args) => {
        //reference props.currentUser here as auth state may have changed since component loaded
        handleCharge(36, token.id, 'JMR 27 Early Deposit', event.eventId, this.props.currentUser.uid);
      }
    });
  }

  componentWillUnmount() {
    if (this.stripehandler) {
      this.stripehandler.close();
    }
  }

  onHandleCreditCard = () => {
    this.currentPayment = true;
    this.stripehandler.open({
      name: 'Menschwork',
      description: 'JMR 27 Deposit',
      panelLabel: 'Make Deposit',
      amount: 3600,
      email: this.props.currentUser.email,
      zipCode: true
    });
  }

  getExistingDepositMessage() {
    let msg = this.currentPayment ? "Thank you for making a $36 deposit"
      : "You have already made a $36 deposit";
    return msg + ". We will hold a place at the event for you and let you know when registration has opened."
  }

  render() {
    const {event, currentUser, madeEarlyDeposit, registrationStatus, paymentProcessing} = this.props;
    return !currentUser ? <SignInContainer /> :
      <div className="row justify-content-center">
        <div className="card col-8 mt-3">
          <div className="card-body">
            {registrationStatus === LOADING ?
                <Loading /> :
              paymentProcessing ?
                <Loading
                  caption="Processing payment"
                  spinnerScale={1.2}
                  spinnerColor="#b44"
                /> :
              madeEarlyDeposit ?
              <h5 className="text-center">{this.getExistingDepositMessage()}</h5> :
              <div>
                <h5 className="text-center">Hold Your Place for {event.title} with a $36 Deposit</h5>
                <div className="d-flex justify-content-center mt-4">
                  <button className="btn btn-primary" onClick={this.onHandleCreditCard}>Pay with Credit Card</button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    ;
  }
}

export default EarlyDeposit;
