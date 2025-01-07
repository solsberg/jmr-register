import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import get from 'lodash/get';
import has from 'lodash/has';
import classNames from 'classnames';
import moment from 'moment';
import MoneyField from './MoneyField';
import StatementTable from './StatementTable';
import Loading from './Loading';
import { LOADED, PAYPAL, CHECK } from '../constants';
import { formatMoney, buildStatement, validateEmail, isPreRegistered, getPreRegistrationDiscount } from '../lib/utils';
import { sendAdminEmail, sendTemplateEmail, validateDiscountCode } from '../lib/api';
import TERMS from '../terms.json';
import { min } from 'lodash';
import { PaymentContext } from '../contexts/PaymentContext';

const Payment = ({
  registration, registrationStatus, event, currentUser, profile, serverTimestamp, roomUpgrade, paymentProcessing, recordExternalPayment, updateOrder, addToCart, submitBambamEmails
}) => {
  const [message, setMessage] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [bambamEmails, setBambamEmails] = useState('');
  const [bambamError, setBambamError] = useState('');
  const [bambamSuccess, setBambamSuccess] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountCodeError, setDiscountCodeError] = useState(null);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState(null);
  const [readCovidPolicy, setReadCovidPolicy] = useState(get(registration, 'cart.acceptedCovidPolicy'));
  const [balance, setBalance] = useState(0);
  const [lineItems, setLineItems] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setPaymentAmount: setPaymentAmountContext } = useContext(PaymentContext);

  // componentDidMount() {
  //   const {event, handleCharge} = this.props;

  //   this.stripehandler = window.StripeCheckout.configure({
  //     key: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
  //     image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
  //     locale: 'auto',
  //     token: (token, args) => {
  //       const isNewRegistration = !this.props.registration.order;
  //       const user = this.props.currentUser;
  //       const profile = this.props.profile;
  //       const balance = this.balance,
  //             paymentAmount = this.getPaymentAmount();

  //       if (this.props.paymentProcessing) {
  //         //avoid double payments
  //         return;
  //       }

  //       let description = `${event.title} ${!isNewRegistration ? "Additional " : ""}Registration Payment`;
  //       let order = Object.assign({}, this.props.registration.order, this.props.registration.cart);
  //       const donation = order.donation;
  //       if (!!donation) {
  //         description += `, ${formatMoney(donation)}`;
  //       }

  //       //reference props.currentUser here as auth state may have changed since component loaded
  //       handleCharge(this.getPaymentAmount(), token.id, description, event, user, () => {
  //         const messageType = isNewRegistration ? "Registration" : "Additional registration payment";
  //         if (isNewRegistration) {
  //           sendTemplateEmail("JMR registration confirmation",
  //             balance > paymentAmount ? "confirmation_partial" : "confirmation_paid",
  //             user.email, "jmr@menschwork.org",
  //             [
  //               {pattern: "%%first_name%%", value: profile.first_name},
  //               {pattern: "%%event_title%%", value: event.title},
  //               {pattern: "%%event_email%%", value: "jmr@menschwork.org"},
  //               {pattern: "%%balance%%", value: formatMoney(balance - paymentAmount)},
  //               {pattern: "%%payment_date%%", value: moment(event.finalPaymentDate).format("MMMM Do")}
  //             ]);
  //         }
  //         sendAdminEmail("JMR " + messageType + " received",
  //           `${messageType} received from ${profile.first_name} ${profile.last_name} (${user.email}) for ${event.title}`);
  //       });
  //     }
  //   });
  // }

  useEffect(() => {
    if (registrationStatus === LOADED && !registration.order && !registration.cart) {
      //redirect if no current order or cart
      navigate('/');
    }
    if (registrationStatus === LOADED) {
      const { lineItems, balance: statementBalance } = buildStatement(registration, event, currentUser, serverTimestamp, roomUpgrade, appliedDiscountCode);
      setBalance(statementBalance);
      setLineItems(lineItems);
    }
  }, [registrationStatus, registration]);

  // componentWillUnmount() {
  //   if (this.stripehandler) {
  //     this.stripehandler.close();
  //   }
  // }

  const onHandleCreditCard = () => {
    setMessage(null);
    setPaymentAmountContext(getPaymentAmount());
    const parentUrl = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    navigate(parentUrl + '/checkout');
    // this.stripehandler.open({
    //   name: 'Menschwork',
    //   description: `${event.title} Registration`,
    //   panelLabel: 'Make Payment',
    //   amount: this.getPaymentAmount(),
    //   email: this.props.currentUser.email,
    //   zipCode: true
    // });
  };

  const onHandleWaitList = () => {
    updateCartOrOrder({ joinedWaitlist: moment().valueOf() });
  };

  // const buildStatementObject = () => {
  //   if (!registration || !event) {
  //     return;
  //   }

  //   const { lineItems, statementBalance } = buildStatement(registration, event, currentUser, serverTimestamp, roomUpgrade, appliedDiscountCode);
  //   setBalance(statementBalance);
  //   return lineItems;
  // };

  const getPaymentMessage = () => {
    if (balance <= 0) {
      return "Thank you for completing your registration. We look forward to seeing you at the retreat.";
    } else {
      return "Thank you for submitting your registration. Please return to this page to pay the balance " +
        `of the registration fee by ${moment(event.finalPaymentDate).format("MMMM Do")}.`;
    }
  };

  const getRefundMessage = (order) => {
    if (order.roomChoice.indexOf("online") >= 0 && !!order.onlineExtraDonated) {
      return "You have chosen to donate to Menschwork the difference between the amount you have already paid for a room " +
        "and the fee for the Digital Connection option. Thank you.";
    } else {
      return `You are due a refund of ${formatMoney(balance * -1)} on your account. ` +
        "This should be processed within the next several days.";
    }
  };

  const onHandlePayPal = () => {
    setMessage("Payments made using PayPal will be reflected on this page once confirmed after a few days");
    recordExternalPayment(event, currentUser, PAYPAL);
  };

  const handleUpdateDiscountCode = (evt) => {
    setDiscountCode(evt.target.value);
  };

  const onSubmitDiscountCode = () => {
    validateDiscountCode(event.eventId, currentUser.uid, discountCode)
    .then(info => {
      if (info.valid) {
        setAppliedDiscountCode(info.name);
        setDiscountCodeError(null);
        updateCartOrOrder({ applyDiscountCode: discountCode });
      } else {
        setDiscountCodeError(info.status);
      }
    })
    .catch(() => {
      setDiscountCodeError("Unable to verify discount code");
    })
  };

  const renderPayPalForm = () => {
    return (
      <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank"
          onSubmit={onHandlePayPal} >
        <input type="hidden" name="business" value="treasurer@menschwork.org" />
        <input type="hidden" name="cmd" value="_xclick" />
        <input type="hidden" name="item_name" value={`${event.title} Registration`} />
        <input type="hidden" name="amount" value={(getPaymentAmount() * 0.01).toFixed(2)} />
        <input type="hidden" name="currency_code" value="USD" />
        <input type="submit" className="btn btn-primary my-1" value="Pay with PayPal" />
        <span className="ml-2">in a new window</span>
      </form>
    );
  };

  const onHandleCheck = () => {
    let amount = getPaymentAmount() * 0.01;
    if (amount !== parseInt(amount, 10)) {
      amount = amount.toFixed(2);
    }
    setMessage("Please send a check for $" + amount + " made payable to Menschwork and mailed to Menschwork, PO Box 4020, Philadelphia, PA 19118");
    recordExternalPayment(event, currentUser, CHECK);
  };

  const handlePaymentAmountChange = (amount) => {
    setPaymentAmount(amount);
  };

  const getPaymentAmount = () => {
    if (typeof paymentAmount !== 'number') {
      return balance;
    }
    return paymentAmount;
  };

  const handleDonationChange = (amount) => {
    updateCartOrOrder({ donation: amount });
  };

  const updateCartOrOrder = (values) => {
    if (!!get(registration, "account.payments")) {
      updateOrder(event, currentUser, values);
    } else {
      addToCart(event, currentUser, values);
    }
  };

  const onToggleAcceptTerms = () => {
    addToCart(event, currentUser, { acceptedTerms: !(registration.cart && registration.cart.acceptedTerms) });
  }

  const onToggleAcceptCovidPolicy = () => {
    addToCart(event, currentUser, { acceptedCovidPolicy: !(registration.cart && registration.cart.acceptedCovidPolicy) });
  };

  const onToggleWaiveDiscount = () => {
    let order = Object.assign({}, registration.order, registration.cart);
    updateCartOrOrder({ waiveDiscount: !order.waiveDiscount });
  };

  const onReadCovidPolicy = () => {
    setReadCovidPolicy(true);
  };

  const onPaymentMethodChange = (evt) => {
    setPaymentMethod(evt.target.value);
    setMessage(null);
    if (evt.target.value === 'check') {
      onHandleCheck();
    }
  };

  const handleChangeBambamEmails = (evt) => {
    setBambamEmails(evt.target.value);
    if (!evt.target.value) {
      setBambamError('');
      setBambamSuccess('');
    }
  };

  const onSubmitBambamEmails = () => {
    const emails = bambamEmails;
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
          setBambamError(bambam_error);
          setBambamSuccess(bambam_success);
        });
      }
    }
    setBambamError(bambam_error);
    setBambamSuccess(bambam_success);
  };

  const checkActiveDiscountCodes = (event) => {
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
  };

  const hasCovidPolicy = event.acceptCovidPolicy;

  // let statement = buildStatementObject();
  if (!lineItems) {
    return <div></div>;
  }

  let paymentMade = !!get(registration, "account.payments.newPayment");

  let order = Object.assign({}, registration.order, registration.cart);
  const donation = order.donation;
  const isOnline = order.roomChoice.indexOf("online") >= 0;
  const isWaitlist = !has(order, 'created_at') && event.status == 'WAITLIST' && !order.allowWaitlist;
  const onWaitlist = isWaitlist && !!order.joinedWaitlist;
  const paymentEnabled = balance > 0 && !!order.acceptedTerms && !isWaitlist && (isOnline || !hasCovidPolicy || !!order.acceptedCovidPolicy);
  const isNewRegistration = !registration.order;
  let minimumAmount = balance;
  let minimumAmountText;

  let minimumPayment = 0;
  if (isNewRegistration) {
    minimumPayment = event.priceList.minimumPayment;
    if (isPreRegistered(currentUser, event)) {
      minimumPayment -= event.preRegistration.depositAmount;
    }
  }
  if (has(order, 'minimumPayment') && order.minimumPayment < minimumPayment) {
    minimumPayment = order.minimumPayment;
  }
  if (!!donation) {
    minimumPayment += donation;
  }
  if (moment().isBefore(event.finalPaymentDate) && minimumPayment < balance) {
    minimumAmount = minimumPayment;
    minimumAmountText = `Minimum deposit of ${formatMoney(minimumAmount)} required at this time`;
  }

  const acceptedTerms = !!registration.cart && !!registration.cart.acceptedTerms;
  const storedAcceptedTerms = !!registration.order && !!registration.order.acceptedTerms;

  const acceptedCovidPolicy = !!registration.cart && !!registration.cart.acceptedCovidPolicy;
  const storedAcceptedCovidPolicy = !!registration.order && !!registration.order.acceptedCovidPolicy;

  let paymentMethodToRender = paymentMethod;
  if (!paymentEnabled) {
    paymentMethodToRender = '';
  }

  const parentUrl = location.pathname.substring(0, location.pathname.lastIndexOf('/'));

  let hasDiscountCode = checkActiveDiscountCodes(event) && !registration.order;

  let preRegistrationDiscount = getPreRegistrationDiscount(currentUser, event, order, serverTimestamp);
  const displayWaiveDiscount = !!preRegistrationDiscount && preRegistrationDiscount.userCanWaive;

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
            onChange={handleDonationChange}
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
          <input id="bambam" type="text" value={bambamEmails}
            className={classNames("form-control col-md-6", bambamError && 'is-invalid', bambamSuccess && 'is-valid')}
            onChange={handleChangeBambamEmails} onBlur={handleChangeBambamEmails}
          />
          <button className="btn btn-primary ml-2" disabled={!bambamEmails}
              onClick={onSubmitBambamEmails}>
            Send Invitation{bambamEmails.indexOf(',') > 0 ? 's' : ''}
          </button>
          <div className="offset-md-3 col-md-6 mt-0 small">
            Suggest one or more email addresses (separated with commas) of new men to invite to {event.title}.&nbsp;
            You will receive an additional {event.bambamDiscount.amount * 100}% discount if one of them registers within 2 weeks.&nbsp;
            <a href="https://www.menschwork.org/bambam-guidelines.html" target="_blank" rel="noopener noreferrer">Details here</a>
          </div>
          {bambamSuccess && <div className="valid-feedback offset-md-3 col-md-6">{bambamSuccess}</div>}
          {bambamError && <div className="invalid-feedback offset-md-3 col-md-6">{bambamError}</div>}
        </div>
      }

      {hasDiscountCode &&
        <div className="form-group form-row mt-3">
          <label htmlFor="discountCode" className="col-form-label col-md-3">
            Discount Code (if applicable)
          </label>
          <input id="discountCode" type="text" value={discountCode}
            className={classNames("form-control col-md-2", discountCodeError && 'is-invalid')}
            disabled={!!appliedDiscountCode}
            onChange={handleUpdateDiscountCode} onBlur={handleUpdateDiscountCode}
          />
        <button className="btn btn-primary ml-2" disabled={!discountCode || !!appliedDiscountCode}
              onClick={onSubmitDiscountCode}>
            Apply
          </button>
          {discountCodeError &&
            <div className="invalid-feedback offset-md-3 col-md-6">
              {discountCodeError}
            </div>
          }
        </div>
      }

      {!storedAcceptedTerms &&
        <div>
          <div className="form-check mt-2">
            <input className="form-check-input" type="checkbox" id="terms"
              checked={acceptedTerms}
              onChange={onToggleAcceptTerms}
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

      {!isOnline && hasCovidPolicy && !storedAcceptedCovidPolicy &&
        <div className="mt-3">
          <h5>JMR33 COVID Policy</h5>
          <div className="col-md-8">
            Please <a href="/covidpolicy.html" onClick={onReadCovidPolicy} target="_blank">click here to open and read the JMR33 COVID Policy</a> and then acknowledge below
          </div>
          <div className="form-check col-md-8 mt-2">
            <input className="form-check-input" type="checkbox" id="covidpolicy"
              checked={acceptedCovidPolicy}
              disabled={!readCovidPolicy && !acceptedCovidPolicy}
              onChange={onToggleAcceptCovidPolicy}
            />
            <label className="form-check-label" htmlFor="covidpolicy">
              I confirm that I have read and understand the JMR33 COVID Policy described above and agree to abide
              by its requirements and guidelines while attending JMR33
            </label>
          </div>
        </div>
      }
      {!isOnline && hasCovidPolicy && storedAcceptedCovidPolicy &&
        <small className="font-italic">
          You have already accepted the <a href="/covidpolicy.html" target="_blank">JMR33 COVID Policy</a>.
        </small>
      }

      {displayWaiveDiscount &&
        <div className="form-check my-4">
          <p><strong>Waive Discount</strong></p>
          <p className="italic"><em>
            Menschwork has been faced with a 20% price increase from the retreat center this year and has absorbed much of this to help our
            community. Please select this option if you are able to waive your discount to help us continue to keep prices affordable.
            </em></p>
          <input className="form-check-input" type="checkbox" id="waive-discount"
            checked={order.waiveDiscount}
            onChange={onToggleWaiveDiscount}
          />
          <label className={classNames("form-check-label")} htmlFor="waive-discount">
            I choose to pay the full amount of my registration fee and forgo the $75 discount for pre-registering early
          </label>
        </div>
      }

      <div className="mt-5 col-md-6 offset-md-3">
        <StatementTable lineitems={lineItems} />
      </div>
      <p className="font-italic mt-5">
        { balance > 0 &&
          <Link to={`${parentUrl}/scholarship`}>Apply for financial assistance to attend {event.title}.</Link>
        }
      </p>
      <div className="form-group form-row mt-3">
        <label htmlFor="payment_amount" className={classNames("col-form-label col-md-3", !paymentEnabled && 'text-muted')}>
          Payment Amount
        </label>
        <MoneyField id="payment_amount" className="col-md-2"
          amount={paymentAmount}
          onChange={handlePaymentAmountChange}
          disabled={balance <= 0}
          defaultAmount={balance > 0 ? balance : 0}
          minimumAmount={minimumAmount}
          maximumAmount={balance > 0 ? balance : 0}
        />
        {balance > 0 && !!minimumAmountText &&
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
          value={paymentMethodToRender}
          onChange={onPaymentMethodChange}
          disabled={!paymentEnabled}
        >
          <option value="credit_card" key="credit_card">Credit Card</option>
          <option value="paypal" key="paypal">PayPal</option>
          <option value="check" key="check">Check</option>
        </select>

        {paymentMethodToRender === 'credit_card' &&
          <button className="btn btn-primary my-1" disabled={!paymentEnabled || paymentProcessing}
              onClick={onHandleCreditCard}>
            Pay with Credit Card
          </button>
        }
        {paymentMethodToRender === 'paypal' && renderPayPalForm()}
      </div>
      {
        isWaitlist && !onWaitlist &&
          <div className="form-group form-row mt-2">
            <button className="btn btn-primary my-1 offset-md-3 col-md-2" onClick={onHandleWaitList}>
              Join Wait List
            </button>
          </div>
      }
      {paymentProcessing && <Loading caption="Processing payment" spinnerScale={1.2} spinnerColor="#b44" />}
      {paymentMade && <div className="alert alert-success" role="alert">{getPaymentMessage()}</div>}
      {onWaitlist && <div className="alert alert-info" role="alert">You are on the waitlist</div>}
      {message &&
        <div className="row justify-content-center">
          <div className="alert alert-info mt-3 col-10" role="alert">
            <p className="text-center p-3">{message}</p>
          </div>
        </div>
      }
      {balance < 0 && <div className="alert alert-success" role="alert">{getRefundMessage(order)}</div>}
    </div>
  );
};

export default Payment;
