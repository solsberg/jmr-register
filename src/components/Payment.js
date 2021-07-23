import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import get from 'lodash/get';
import has from 'lodash/has';
import classNames from 'classnames';
import moment from 'moment';
import MoneyField from './MoneyField';
import StatementTable from './StatementTable';
import Loading from './Loading';
import { LOADED, PAYPAL, CHECK } from '../constants';
import { formatMoney, buildStatement, validateEmail } from '../lib/utils';
import { sendAdminEmail, sendTemplateEmail, validateDiscountCode } from '../lib/api';
import TERMS from '../terms.json';

class Payment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      paymentAmount: null,
      paymentMethod: "credit_card",
      bambam_emails: '',
      bambam_error: '',
      bambam_success: '',
      discountCode: '',
      discountCode_error: null,
      appliedDiscountCode: null,
      readCovidPolicy: get(props.registration, "cart.acceptedCovidPolicy")
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
        const profile = this.props.profile;
        const balance = this.balance,
              paymentAmount = this.getPaymentAmount();
        //reference props.currentUser here as auth state may have changed since component loaded
        handleCharge(this.getPaymentAmount(), token.id, `${event.title} Registration Payment`, event, user, () => {
          const messageType = isNewRegistration ? "Registration" : "Additional registration payment";
          if (isNewRegistration) {
            sendTemplateEmail("JMR registration confirmation",
              balance > paymentAmount ? "confirmation_partial" : "confirmation_paid",
              user.email, "jmr@menschwork.org",
              [
                {pattern: "%%first_name%%", value: profile.first_name},
                {pattern: "%%event_title%%", value: event.title},
                {pattern: "%%event_email%%", value: "jmr@menschwork.org"},
                {pattern: "%%balance%%", value: formatMoney(balance - paymentAmount)},
                {pattern: "%%payment_date%%", value: moment(event.finalPaymentDate).format("MMMM Do")}
              ]);
          }
          sendAdminEmail("JMR " + messageType + " received",
            `${messageType} received from ${profile.first_name} ${profile.last_name} (${user.email}) for ${event.title}`);
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
    const {event} = this.props;
    this.setState({
      message: null
    });
    this.stripehandler.open({
      name: 'Menschwork',
      description: `${event.title} Registration`,
      panelLabel: 'Make Payment',
      amount: this.getPaymentAmount(),
      email: this.props.currentUser.email,
      zipCode: true
    });
  }

  buildStatement = () => {
    const { registration, event, serverTimestamp, roomUpgrade, currentUser } = this.props;
    const { appliedDiscountCode } = this.state;
    if (!registration || !event) {
      return;
    }

    const { lineItems, balance } = buildStatement(registration, event, currentUser, serverTimestamp, roomUpgrade, appliedDiscountCode);

    this.balance = balance;
    return lineItems;
  }

  getPaymentMessage = () => {
    const { event } = this.props;

    if (this.balance <= 0) {
      return "Thank you for completing your registration. We look forward to seeing you at the retreat.";
    } else {
      return "Thank you for submitting your registration. Please return to this page to pay the balance " +
        `of the registration fee by ${moment(event.finalPaymentDate).format("MMMM Do")}.`;
    }
  }

  getRefundMessage = () => {
    return `You are due a refund of ${formatMoney(this.balance * -1)} on your account. ` +
      "This should be processed within the next several days.";
  }

  onHandlePayPal = () => {
    const {event, currentUser, recordExternalPayment} = this.props;
    this.setState({
      message: "Payments made using PayPal will be reflected on this page once confirmed after a few days"
    });
    recordExternalPayment(event, currentUser, PAYPAL);
  }

  handleUpdateDiscountCode = (evt) => {
    this.setState({
      discountCode: evt.target.value
    });
  }

  onSubmitDiscountCode = () => {
    const {event, currentUser} = this.props;
    const {discountCode} = this.state;
    validateDiscountCode(event.eventId, currentUser.uid, discountCode)
    .then(info => {
      if (info.valid) {
        this.setState({
          appliedDiscountCode: info.name,
          discountCode_error: null
        });
        this.updateCartOrOrder({ applyDiscountCode: discountCode });
      } else {
        this.setState({
          discountCode_error: info.status
        });
      }
    })
    .catch(err => {
      this.setState({
        discountCode_error: "Unable to verify discount code"
      });
    })
  }

  renderPayPalForm = () => {
    const {event} = this.props;
    return (
      <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank"
          onSubmit={this.onHandlePayPal} >
        <input type="hidden" name="business" value="treasurer@menschwork.org" />
        <input type="hidden" name="cmd" value="_xclick" />
        <input type="hidden" name="item_name" value={`${event.title} Registration`} />
        <input type="hidden" name="amount" value={(this.getPaymentAmount() * 0.01).toFixed(2)} />
        <input type="hidden" name="currency_code" value="USD" />
        <input type="submit" className="btn btn-primary my-1" value="Pay with PayPal" />
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
    this.updateCartOrOrder({ donation: amount });
  }

  updateCartOrOrder = (values) => {
    const {event, currentUser, registration, addToCart, updateOrder} = this.props;
    if (!!get(registration, "account.payments")) {
      updateOrder(event, currentUser, values);
    } else {
      addToCart(event, currentUser, values);
    }
  }

  onToggleAcceptTerms = () => {
    const {event, currentUser, addToCart, registration } = this.props;
    addToCart(event, currentUser, { acceptedTerms: !(registration.cart && registration.cart.acceptedTerms) });
  }

  onToggleAcceptCovidPolicy = () => {
    const {event, currentUser, addToCart, registration } = this.props;
    addToCart(event, currentUser, { acceptedCovidPolicy: !(registration.cart && registration.cart.acceptedCovidPolicy) });
  }

  onReadCovidPolicy = () => {
    this.setState({
      readCovidPolicy: true
    });
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

  handleChangeBambamEmails = (evt) => {
    this.setState({
      bambam_emails: evt.target.value,
    });
    if (!evt.target.value) {
      this.setState({
        bambam_error: '',
        bambam_success: ''
      });
    }
  }

  onSubmitBambamEmails = () => {
    const {event, currentUser, submitBambamEmails } = this.props;
    const emails = this.state.bambam_emails;
    let bambam_error = '', bambam_success = '';
    const emailsList = emails.trim()
      .split(',')
      .map(s => s.trim())
      .filter(s => !!s);
    if (emailsList.length > 0) {
      const badEmails = emailsList.filter(email => !validateEmail(email));
      if (badEmails.length === 1) {
        bambam_error = `${badEmails[0]} is not a valid email address`;
      } else if (badEmails.length > 1) {
        bambam_error = `${badEmails.join(', ')} are not valid email addresses`;
      } else {
        submitBambamEmails(event, currentUser, emailsList, (errors) => {
          if (Array.isArray(errors)) {
            bambam_error = errors.join(', ');
            if (errors.length < emailsList.length) {
              bambam_error = 'Some invites could not be made: ' + bambam_error;
            }
          } else {
            if (emailsList.length > 1) {
              bambam_success = 'The invitations have been sent';
            } else {
              bambam_success = 'The invitation has been sent';
            }
          }
          this.setState({
            bambam_error,
            bambam_success
          });
        });
      }
    }
    this.setState({
      bambam_error,
      bambam_success
    });
  }

  checkActiveDiscountCodes = (event) => {
    if (!event.discountCodes) {
      return false;
    }

    let discountCodes = Object.keys(event.discountCodes)
      .map(k => event.discountCodes[k]);
    return !!discountCodes.find(code => {
      if (has(code, 'enabled') && !code.enabled) {
        return false;
      }
      if (has(code, 'startDate') && moment().isBefore(moment(code.startDate).startOf('day'))) {
        return false;
      }
      if (has(code, 'endDate') && moment().isAfter(moment(code.endDate).endOf('day'))) {
        return false;
      }
      return true;
    });
  }

  render() {
    const { registration, event, paymentProcessing, match } = this.props;
    const { message, paymentAmount, bambam_emails, bambam_error, bambam_success,
      discountCode, discountCode_error, appliedDiscountCode, readCovidPolicy } = this.state;

    const hasCovidPolicy = event.acceptCovidPolicy;

    let statement = this.buildStatement();
    if (!statement) {
      return <div></div>;
    }

    let paymentMade = !!get(registration, "account.payments.newPayment");

    let order = Object.assign({}, registration.order, registration.cart);
    const donation = order.donation;
    const paymentEnabled = this.balance > 0 && !!order.acceptedTerms && (!hasCovidPolicy || !!order.acceptedCovidPolicy);
    let minimumAmount = this.balance;
    let minimumAmountText;
    if (moment().isBefore(event.finalPaymentDate) && event.priceList.minimumPayment < this.balance) {
      minimumAmount = event.priceList.minimumPayment;
      minimumAmountText = `Minimum deposit of ${formatMoney(minimumAmount)} required at this time`;
    }

    const acceptedTerms = !!registration.cart && !!registration.cart.acceptedTerms;
    const storedAcceptedTerms = !!registration.order && !!registration.order.acceptedTerms;

    const acceptedCovidPolicy = !!registration.cart && !!registration.cart.acceptedCovidPolicy;
    const storedAcceptedCovidPolicy = !!registration.order && !!registration.order.acceptedCovidPolicy;

    let paymentMethod = this.state.paymentMethod;
    if (!paymentEnabled) {
      paymentMethod = '';
    }

    const parentUrl = match.url.substring(0, match.url.lastIndexOf('/'));

    let hasDiscountCode = this.checkActiveDiscountCodes(event) && !registration.order;

    return (
      <div className="mb-5">
        <h4 className="mb-3">Payment</h4>
        {!event.onlineOnly &&
          <div className="form-group form-row d-none">
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
        }

        {!!event.bambamDiscount && event.bambamDiscount.enabled &&
          <div className="form-group form-row mt-3">
            <label htmlFor="bambam" className="col-form-label col-md-3">
              Be a Mensch - Bring a Mensch
            </label>
            <input id="bambam" type="text" value={bambam_emails}
              className={classNames("form-control col-md-6", bambam_error && 'is-invalid', bambam_success && 'is-valid')}
              onChange={this.handleChangeBambamEmails} onBlur={this.handleChangeBambamEmails}
            />
            <button className="btn btn-primary ml-2" disabled={!bambam_emails}
                onClick={this.onSubmitBambamEmails}>
              Send Invitation{bambam_emails.indexOf(',') > 0 ? 's' : ''}
            </button>
            <div className="offset-md-3 col-md-6 mt-0 small">
              Suggest one or more email addresses (separated with commas) of new men to invite to {event.title}.&nbsp;
              You will receive an additional {event.bambamDiscount.amount * 100}% discount if one of them registers within 2 weeks.&nbsp;
              <a href="https://www.menschwork.org/bambam-guidelines.html" target="_blank" rel="noopener noreferrer">Details here</a>
            </div>
            {bambam_success && <div className="valid-feedback offset-md-3 col-md-6">{bambam_success}</div>}
            {bambam_error && <div className="invalid-feedback offset-md-3 col-md-6">{bambam_error}</div>}
          </div>
        }

        {hasDiscountCode &&
          <div className="form-group form-row mt-3">
            <label htmlFor="discountCode" className="col-form-label col-md-3">
              Discount Code (if applicable)
            </label>
            <input id="discountCode" type="text" value={discountCode}
              className={classNames("form-control col-md-2", discountCode_error && 'is-invalid')}
              disabled={!!appliedDiscountCode}
              onChange={this.handleUpdateDiscountCode} onBlur={this.handleUpdateDiscountCode}
            />
          <button className="btn btn-primary ml-2" disabled={!discountCode || !!appliedDiscountCode}
                onClick={this.onSubmitDiscountCode}>
              Apply
            </button>
            {discountCode_error &&
              <div className="invalid-feedback offset-md-3 col-md-6">
                {discountCode_error}
              </div>
            }
          </div>
        }

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

        {hasCovidPolicy && !storedAcceptedCovidPolicy &&
          <div className="mt-3">
            <h5>JMR30 COVID Policy</h5>
            <div className="col-md-8">
              Please <a href="/covidpolicy.html" onClick={this.onReadCovidPolicy} target="_blank">click here to open and read the JMR30 COVID Policy</a> and then acknowledge below
            </div>
            <div className="form-check col-md-8 mt-2">
              <input className="form-check-input" type="checkbox" id="covidpolicy"
                checked={acceptedCovidPolicy}
                disabled={!readCovidPolicy && !acceptedCovidPolicy}
                onChange={this.onToggleAcceptCovidPolicy}
              />
              <label className="form-check-label" htmlFor="covidpolicy">
                I confirm that I have read and understand the JMR30 COVID Policy described above and agree to abide
                by its requirements and guidelines while attending JMR30
              </label>
            </div>
          </div>
        }
        {hasCovidPolicy && storedAcceptedCovidPolicy &&
          <small className="font-italic">
            You have already accepted the <a href="/covidpolicy.html" target="_blank">JMR30 COVID Policy</a>.
          </small>
        }

        <div className="mt-5 col-md-6 offset-md-3">
          <StatementTable lineitems={statement} />
        </div>
        <p className="font-italic mt-5">
          { this.balance > 0 &&
            <Link to={`${parentUrl}/scholarship`}>Apply for financial assistance to attend {event.title}.</Link>
          }
        </p>
        <div className="form-group form-row mt-3">
          <label htmlFor="payment_amount" className={classNames("col-form-label col-md-3", !paymentEnabled && 'text-muted')}>
            Payment Amount
          </label>
          <MoneyField id="payment_amount" className="col-md-2"
            amount={paymentAmount}
            onChange={this.handlePaymentAmountChange}
            disabled={this.balance <= 0}
            defaultAmount={this.balance > 0 ? this.balance : 0}
            minimumAmount={minimumAmount}
            maximumAmount={this.balance > 0 ? this.balance : 0}
          />
          {this.balance > 0 && !!minimumAmountText &&
            <span className="small ml-2 mt-2">
              {minimumAmountText}
            </span>
          }
        </div>

        <div className="form-group form-row mt-2">
          <label htmlFor="payment_method" className={classNames("col-form-label col-md-3 my-1", !paymentEnabled && 'text-muted')}>
            Choose Payment Method
          </label>
          <select className={classNames("form-control col-md-2 mr-3 my-1", !paymentEnabled && 'text-muted')}
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
            <button className="btn btn-primary my-1" disabled={!paymentEnabled}
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
        {this.balance < 0 && <div className="alert alert-success" role="alert">{this.getRefundMessage()}</div>}
      </div>
    );
  }
}

export default Payment;
