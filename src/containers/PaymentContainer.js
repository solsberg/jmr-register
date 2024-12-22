import { connect } from 'react-redux';
import Payment from '../components/Payment';
import { attemptCharge } from '../actions/payment';
import { recordExternalPayment, addToCart, updateOrder, submitBambamEmails } from '../actions/registration';
import { PAYMENT_PROCESSING } from '../constants';

const mapStateToProps = ({ registration, application }) => ({
  registration: registration.data,
  registrationStatus: registration.status,
  paymentProcessing: application.state === PAYMENT_PROCESSING,
  roomUpgrade: registration.data?.roomUpgrade,
  profile: registration.profile,
  serverTimestamp: application.serverTimestamp,
});

const mapDispatchToProps = (dispatch) => ({
  handleCharge(amount, token, description, event, user, onSuccess) {
    dispatch(attemptCharge(amount, token, description, event, user, onSuccess));
  },
  recordExternalPayment(event, user, externalType) {
    dispatch(recordExternalPayment(event, user, externalType));
  },
  addToCart(event, user, values) {
    dispatch(addToCart(event, user, values));
  },
  updateOrder(event, user, values) {
    dispatch(updateOrder(event, user, values));
  },
  submitBambamEmails(event, user, emails, callback) {
    dispatch(submitBambamEmails(event, user, emails, callback));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Payment);
