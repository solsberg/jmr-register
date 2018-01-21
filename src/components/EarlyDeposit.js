import React from 'react';
import SignInContainer from '../containers/SignInContainer';

class EarlyDeposit extends React.Component {
  componentDidMount() {
    this.stripehandler = window.StripeCheckout.configure({
      key: 'pk_test_eunKeAa2W0vsgApWvvsECRUy',
      image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
      locale: 'auto',
      token: (token, args) => {
        console.log("Stripe token", token);
        console.log("Stripe args", args);
        this.props.handleCharge(36, token.id, 'JMR 27 Ealy Deposit');
      }
    });
  }

  componentWillUnmount() {
    if (this.stripehandler) {
      this.stripehandler.close();
    }
  }

  onHandleCreditCard = () => {
    this.stripehandler.open({
      name: 'Menschwork',
      description: 'JMR 27 Deposit',
      panelLabel: 'Make Deposit',
      amount: 3600,
      email: this.props.currentUser.email,
      zipCode: true
    });
  }

  render() {
    const {event, currentUser} = this.props;
    return !currentUser ?
      <SignInContainer /> :
      <div className="row justify-content-center">
        <div className="card col-8 mt-3">
          <div className="card-body">
            <h5 className="text-center">Hold Your Place for {event.title} with a $36 Deposit</h5>
            <div className="d-flex justify-content-center mt-4">
              <button className="btn btn-primary" onClick={this.onHandleCreditCard}>Pay with Credit Card</button>
            </div>
          </div>
        </div>
      </div>
    ;
  }
}

export default EarlyDeposit;
