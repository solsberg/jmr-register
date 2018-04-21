import React from 'react';
import SignInContainer from '../containers/SignInContainer';
import Loading from './Loading';
import { LOADING, PAYPAL, CHECK } from '../constants';

class EarlyDeposit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPayment: false,
      message: null
    };
  }

  componentDidMount() {
    const {event, handleCharge} = this.props;

    this.stripehandler = window.StripeCheckout.configure({
      key: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
      image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
      locale: 'auto',
      token: (token, args) => {
        //reference props.currentUser here as auth state may have changed since component loaded
        handleCharge(36, token.id, 'JMR 27 Early Deposit', event, this.props.currentUser);
      }
    });
  }

  componentWillUnmount() {
    if (this.stripehandler) {
      this.stripehandler.close();
    }
  }

  onHandleCreditCard = () => {
    this.setState({currentPayment: true, message: null});
    this.stripehandler.open({
      name: 'Menschwork',
      description: 'JMR 27 Deposit',
      panelLabel: 'Make Deposit',
      amount: 3600,
      email: this.props.currentUser.email,
      zipCode: true
    });
  }

  onHandlePayPal = () => {
    const {event, currentUser, recordExternalPayment} = this.props;
    window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=259FLZRBLKRZY', '_blank');
    this.setState({
      message: "Payments made using PayPal will be reflected on this page once confirmed after a few days"
    });
    recordExternalPayment(event, currentUser, PAYPAL);
  }

  onHandleCheck = () => {
    const {event, currentUser, recordExternalPayment} = this.props;
    this.setState({
      message: "Please send a check for $36 made payable to Menschwork and mailed to PO Box 4076, Philadelphia, PA 19118"
    });
    recordExternalPayment(event, currentUser, CHECK);
  }

  getExistingDepositMessage() {
    let msg = this.state.currentPayment ? "Thank you for making a $36 deposit"
      : "You have already made a $36 deposit";
    return msg + ". We will hold a place at the event for you and let you know when registration has opened."
  }

  render() {
    const {event, currentUser, madeEarlyDeposit, registrationStatus, paymentProcessing} = this.props;
    const {message} = this.state;
    return !currentUser ? <SignInContainer /> :
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
              madeEarlyDeposit ?
              <h5 className="text-center">{this.getExistingDepositMessage()}</h5> :
              <div id="early-deposit-request">
                <h5 className="text-center">Hold Your Place for {event.title} with a $36 Deposit</h5>
                <div className="d-flex flex-column flex-md-row justify-content-center mt-4">
                  <button className="btn btn-primary m-1" onClick={this.onHandleCreditCard}>Pay with Credit Card</button>
                  <button className="btn btn-sm btn-outline-info m-1" onClick={this.onHandlePayPal}>Pay with PayPal</button>
                  <button className="btn btn-sm btn-outline-success m-1" onClick={this.onHandleCheck}>Pay with Check</button>
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
}

export default EarlyDeposit;
