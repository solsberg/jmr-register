import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Payment from '../components/Payment';
import { attemptCharge } from '../actions/payment';
import { recordExternalPayment, addToCart, updateOrder } from '../actions/registration';
import { PAYMENT_PROCESSING } from '../constants';

const mapStateToProps = ({ registration, application }, { match }) => ({
  registration: registration.data,
  registrationStatus: registration.status,
  paymentProcessing: application.state === PAYMENT_PROCESSING,
  profile: registration.profile,
  serverTimestamp: application.serverTimestamp,
  match
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
  }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Payment));
