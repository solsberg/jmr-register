import React, { Component } from 'react';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import { LOADED, PAYPAL, CHECK } from '../constants';
import { formatMoney, isEarlyDiscountAvailable } from '../lib/utils';
import { sendAdminEmail } from '../lib/api';
import ROOM_DATA from '../roomData.json';

class Payment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPayment: true,
      message: null,
      maskedPaymentAmount: ""
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
        //reference props.currentUser here as auth state may have changed since component loaded
        handleCharge(this.getPaymentAmount(), token.id, 'JMR 27 Registration Payment', event, this.props.currentUser, () => {
          const messageType = isNewRegistration ? "Registration" : "Additional registration payment";
          sendAdminEmail("JMR " + messageType + " received",
            `${messageType} received from ${this.props.currentUser.email} for ${event.title}`);
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
      currentPayment: true,
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
      return [];
    }

    let order = Object.assign({}, registration.order, registration.cart);
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

    if (isEarlyDiscountAvailable(event, serverTimestamp)) {
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
        <input type="submit" className="btn btn-sm btn-outline-info m-1" value="Pay with PayPal" />
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

  handlePaymentAmountChange = (evt) => {
    evt.preventDefault();
    let input = evt.target.value;
    let dollars = "";
    let cents = "";
    let decimal = false;
    for (let i = 0; i < input.length; i++) {
      const char = input.charAt(i);
      if (char === "$" || char.match(/\s/)) {
        if (dollars.length > 0 || decimal) {
          break;
        }
      } else if (!!char.match(/\d/)) {
        if (!decimal) {
          dollars += char;
        } else {
          cents += char;
          if (cents.length === 2) {
            break;
          }
        }
      } else if (char === '.' && !decimal) {
        decimal = true;
      } else {
        break;
      }
    }

    this.setState({
      maskedPaymentAmount: `$${dollars}${decimal ? '.' : ''}${cents}`
    });
  }

  handlePaymentAmountBlur = (evt) => {
    const { event } = this.props;

    evt.preventDefault();
    let amount = this.getPaymentAmount();
    if (amount < event.priceList.minimumPayment) {
      amount = event.priceList.minimumPayment;
    }
    if (amount > this.balance) {
      amount = this.balance;
    }
    this.setState({
      maskedPaymentAmount: formatMoney(amount)
    });
  }

  getPaymentAmount = () => {
    if (!this.state.maskedPaymentAmount) {
      return this.balance;
    }
    return this.parseMoney(this.state.maskedPaymentAmount);
  }

  parseMoney = (input) => {
    if (input.charAt(0) === '$') {
      input = input.substring(1);
    }
    return parseFloat(input).toFixed(2) * 100;
  }

  render() {
    const { registration } = this.props;
    const { currentPayment, message } = this.state;

    let statement = this.buildStatement();
    let paymentMade = currentPayment && !!get(registration, "account.payments.newPayment");

    return (
      <div>
        Payment Form
        <div className="mt-3 col-md-6 offset-md-4">
          <table className="table table-sm">
            <tbody>
              {statement.map(this.renderLineItem)}
            </tbody>
          </table>
        </div>
        <div className="form-group row">
          <label htmlFor="payment-amount" className="col-md-2 offset-md-5 col-form-label">Payment Amount</label>
          <input id="payment-amount" type="text" className="form-control col-md-2"
            value={this.state.maskedPaymentAmount || formatMoney(this.balance)}
            onChange={this.handlePaymentAmountChange}
            onBlur={this.handlePaymentAmountBlur}
          />
        </div>
        {!paymentMade && this.balance > 0 &&
          <div>
          <button className="btn btn-primary m-1" disabled={this.balance === 0}
              onClick={this.onHandleCreditCard}>
            Pay with Credit Card
          </button>
          {this.renderPayPalForm()}
          <button className="btn btn-sm btn-outline-success m-1" onClick={this.onHandleCheck}>Pay with Check</button>
          </div>
        }
        {paymentMade && <div className="alert alert-success" role="alert">{this.getPaymentMessage()}</div> }
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
