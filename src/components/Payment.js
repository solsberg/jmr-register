import React, { Component } from 'react';
import get from 'lodash/get';
import classNames from 'classnames';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import MoneyField from './MoneyField';
import Loading from './Loading';
import { LOADED, PAYPAL, CHECK } from '../constants';
import { formatMoney, isEarlyDiscountAvailable } from '../lib/utils';
import { sendAdminEmail, sendTemplateEmail } from '../lib/api';
import ROOM_DATA from '../roomData.json';
import TERMS from '../terms.json';

class Payment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      paymentAmount: null,
      paymentMethod: "credit_card"
    };
  }

  componentDidMount() {
    const {event, handleCharge} = this.props;

    this.stripehandler = window.StripeCheckout.configure({
      key: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
      image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
      locale: 'auto',
      token: (token, args) => {
        const isNewRegistration = !this.props.registration.order;
        const user = this.props.currentUser;
        const balance = this.balance,
              paymentAmount = this.getPaymentAmount();
        //reference props.currentUser here as auth state may have changed since component loaded
        handleCharge(this.getPaymentAmount(), token.id, 'JMR 27 Registration Payment', event, user, () => {
          const messageType = isNewRegistration ? "Registration" : "Additional registration payment";
          if (isNewRegistration) {
            sendTemplateEmail("JMR registration confirmation",
              balance > paymentAmount ? "confirmation_partial" : "confirmation_paid",
              user.email, `${event.eventId}@menschwork.org`,
              [
                {pattern: "%%first_name%%", value: this.props.profile.first_name},
                {pattern: "%%event_title%%", value: event.title},
                {pattern: "%%balance%%", value: formatMoney(balance - paymentAmount)},
                {pattern: "%%payment_date%%", value: moment(event.finalPaymentDate).format("MMMM Do")}
              ]);
          }
          sendAdminEmail("JMR " + messageType + " received",
            `${messageType} received from ${user.email} for ${event.title}`);
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { registration, registrationStatus, history } = nextProps;
    if (registrationStatus === LOADED && !registration.order && !registration.cart) {
      //redirect if no current order or cart
      history.push('/');
    }
  }

  componentWillUnmount() {
    if (this.stripehandler) {
      this.stripehandler.close();
    }
  }

  onHandleCreditCard = () => {
    this.setState({
      message: null
    });
    this.stripehandler.open({
      name: 'Menschwork',
      description: 'JMR 27 Registration',
      panelLabel: 'Make Payment',
      amount: this.getPaymentAmount(),
      email: this.props.currentUser.email,
      zipCode: true
    });
  }

  buildStatement = () => {
    const { registration, event, serverTimestamp } = this.props;
    if (!registration || !event) {
      return;
    }

    let order = Object.assign({}, registration.order, registration.cart);
    if (!order.roomChoice) {
      return;
    }
    let lineItems = [];

    //main registration
    let totalCharges = 0;
    let totalCredits = 0;
    lineItems.push({
      description: "Lodging type: " + ROOM_DATA[order.roomChoice].title,
      amount: event.priceList.roomChoice[order.roomChoice],
      type: "order"
    });
    totalCharges += event.priceList.roomChoice[order.roomChoice];

    if (isEarlyDiscountAvailable(event, order, serverTimestamp)) {
      const amount = event.priceList.roomChoice[order.roomChoice] * event.earlyDiscount.amount;
      lineItems.push({
        description: `${event.earlyDiscount.amount * 100}% early registration discount`,
        amount,
        type: "discount"
      });
      totalCharges -= amount;
    }

    if (order.singleSupplement) {
      lineItems.push({
        description: "Single room supplement",
        amount: event.priceList.singleRoom[order.roomChoice],
        type: "order"
      });
      totalCharges += event.priceList.singleRoom[order.roomChoice];
    }

    if (order.refrigerator) {
      lineItems.push({
        description: "Mini-fridge",
        amount: event.priceList.refrigerator,
        type: "order"
      });
      totalCharges += event.priceList.refrigerator;
    }

    if (order.thursdayNight) {
      lineItems.push({
        description: "Thursday evening arrival",
        amount: event.priceList.thursdayNight,
        type: "order"
      });
      totalCharges += event.priceList.thursdayNight;
    }

    if (order.donation) {
      lineItems.push({
        description: "Donation",
        amount: order.donation,
        type: "order"
      });
      totalCharges += order.donation;
    }

    lineItems.push({
      description: "Total charges",
      amount: totalCharges,
      type: "subtotal"
    });

    //early deposit credit
    if (registration.earlyDeposit && registration.earlyDeposit.status === 'paid') {
      lineItems.push({
        description: "Pre-registration credit",
        amount: 3600,
        type: "credit"
      });
      totalCredits += 3600;
    }

    //previous payments
    let payments = get(registration, "account.payments", []);
    let paymentsList = Object.keys(payments)
      .map(k => payments[k]);
    sortBy(paymentsList, p => p.created_at)
      .filter(p => p.status === 'paid')
      .forEach(p => {
        lineItems.push({
          description: "Payment received on " + moment(p.created_at).format("MMM D, Y"),
          amount: p.amount,
          type: "credit"
        });
        totalCredits += p.amount;
      });

    this.balance = totalCharges - totalCredits;
    lineItems.push({
      description: "Balance due",
      amount: this.balance,
      type: "balance"
    });

    return lineItems;
  }

  formatItemAmount = (item) => {
    let amount = formatMoney(item.amount);
    if (item.type === 'credit' || item.type === 'discount') {
      amount = '(' + amount + ')';
    }
    return amount;
  }

  renderLineItem = (item, idx) => {
    return (
      <tr key={"li" + idx} className={item.type === 'balance' ? 'table-success' : undefined}>
        <td>{item.description}</td>
        <td style={{textAlign: 'right'}}>{this.formatItemAmount(item)}</td>
      </tr>
    );
  }

  getPaymentMessage = () => {
    return "Thank you for completing your registration. We look forward to seeing you at the retreat.";
  }

  onHandlePayPal = () => {
    const {event, currentUser, recordExternalPayment} = this.props;
    this.setState({
      message: "Payments made using PayPal will be reflected on this page once confirmed after a few days"
    });
    recordExternalPayment(event, currentUser, PAYPAL);
  }

  renderPayPalForm = () => {
    return (
      <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank"
          onSubmit={this.onHandlePayPal} >
        <input type="hidden" name="business" value="info@menschwork.org" />
        <input type="hidden" name="cmd" value="_xclick" />
        <input type="hidden" name="item_name" value="JMR 27 Registration" />
        <input type="hidden" name="amount" value={(this.getPaymentAmount() * 0.01).toFixed(2)} />
        <input type="hidden" name="currency_code" value="USD" />
        <input type="submit" className="btn btn-primary xmt-1" value="Pay with PayPal" />
        <span className="ml-2">in a new window</span>
      </form>
    )
  }

  onHandleCheck = () => {
    const {event, currentUser, recordExternalPayment} = this.props;
    let amount = this.getPaymentAmount() * 0.01;
    if (amount !== parseInt(amount, 10)) {
      amount = amount.toFixed(2);
    }
    this.setState({
      message: "Please send a check for $" + amount + " made payable to Menschwork and mailed to PO Box 4076, Philadelphia, PA 19118"
    });
    recordExternalPayment(event, currentUser, CHECK);
  }

  handlePaymentAmountChange = (amount) => {
    this.setState({
      paymentAmount: amount
    });
  }

  getPaymentAmount = () => {
    if (typeof this.state.paymentAmount !== 'number') {
      return this.balance;
    }
    return this.state.paymentAmount;
  }

  handleDonationChange = (amount) => {
    const {event, currentUser, addToCart} = this.props;
    addToCart(event, currentUser, { donation: amount });
  }

  onToggleAcceptTerms = () => {
    const {event, currentUser, addToCart, registration } = this.props;
    addToCart(event, currentUser, { acceptedTerms: !(registration.cart && registration.cart.acceptedTerms) });
  }

  onPaymentMethodChange = (evt) => {
    this.setState({
      paymentMethod: evt.target.value,
      message: null
    });
    if (evt.target.value === 'check') {
      this.onHandleCheck();
    }
  }

  render() {
    const { registration, event, paymentProcessing } = this.props;
    const { message, paymentAmount } = this.state;

    let statement = this.buildStatement();
    if (!statement) {
      return <div></div>;
    }

    let paymentMade = !!get(registration, "account.payments.newPayment");

    let order = Object.assign({}, registration.order, registration.cart);
    const donation = order.donation;
    const paymentEnabled = this.balance > 0 && order.acceptedTerms;

    const acceptedTerms = registration.cart && registration.cart.acceptedTerms;
    const storedAcceptedTerms = registration.order && registration.order.acceptedTerms;

    let paymentMethod = this.state.paymentMethod;
    if (!paymentEnabled) {
      paymentMethod = '';
    }

    return (
      <div className="mb-5">
        <h4>Payment</h4>
        <div className="form-group row mt-3">
          <label htmlFor="donation" className="col-form-label col-md-3">
            Menschwork Scholarship Fund
          </label>
          <MoneyField id="donation" className="col-md-2"
            amount={donation}
            onChange={this.handleDonationChange}
            minimumAmount={100} allowNone
            maximumAmount={100000}
          />
        <div className="offset-md-3 mt-0 small">
          Your tax-deductible donation will help enable a man with financial need to attend. Thank you
        </div>
        </div>
        {!storedAcceptedTerms &&
          <div>
          <div className="form-check mt-2">
            <input className="form-check-input" type="checkbox" id="terms"
              checked={acceptedTerms}
              onChange={this.onToggleAcceptTerms}
            />
            <label className="form-check-label" htmlFor="terms">
              I agree with <a href="/terms.txt" target="_blank">terms and conditions</a> below.
            </label>
          </div>
          <div className="col-md-6 m-1" style={{height: '94px', overflow: 'scroll', fontSize: '8pt'}}
            dangerouslySetInnerHTML={{__html: TERMS.content}} />
          </div>
        }
        {storedAcceptedTerms &&
          <small className="font-italic">
            You have already accepted the <a href="/terms.txt" target="_blank">terms and conditions</a>.
          </small>
        }

        <div className="mt-5 col-md-6 offset-md-3">
          <table className="table table-sm">
            <tbody>
              {statement.map(this.renderLineItem)}
            </tbody>
          </table>
        </div>
        <div className="form-group row mt-5">
          <label htmlFor="payment_amount" className={classNames("col-form-label col-md-2", !paymentEnabled && 'text-muted')}>
            Payment Amount
          </label>
          <MoneyField id="payment_amount" className="col-md-2"
            amount={paymentAmount}
            onChange={this.handlePaymentAmountChange}
            disabled={this.balance <= 0}
            defaultAmount={this.balance}
            minimumAmount={event.priceList.minimumPayment}
            maximumAmount={this.balance}
          />
        </div>

        <div className="form-group row mt-3">
          <label htmlFor="payment_method" className={classNames("col-form-label col-md-2", !paymentEnabled && 'text-muted')}>
            Pay by
          </label>
          <select className={classNames("form-control col-md-2 mr-3", !paymentEnabled && 'text-muted')}
            id="payment_method"
            value={paymentMethod}
            onChange={this.onPaymentMethodChange}
            disabled={!paymentEnabled}
          >
            <option value="credit_card" key="credit_card">Credit Card</option>
            <option value="paypal" key="paypal">PayPal</option>
            <option value="check" key="check">Check</option>
          </select>

          {paymentMethod === 'credit_card' &&
            <button className="btn btn-primary" disabled={!paymentEnabled}
                onClick={this.onHandleCreditCard}>
              Pay with Credit Card
            </button>
          }
          {paymentMethod === 'paypal' && this.renderPayPalForm()}
        </div>
        {paymentProcessing && <Loading caption="Processing payment" spinnerScale={1.2} spinnerColor="#b44" />}
        {paymentMade && <div className="alert alert-success" role="alert">{this.getPaymentMessage()}</div>}
        {message &&
          <div className="row justify-content-center">
            <div className="alert alert-info mt-3 col-10" role="alert">
              <p className="text-center p-3">{message}</p>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default Payment;
