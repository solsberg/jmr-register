import { connect } from 'react-redux';
import EarlyDeposit from '../components/EarlyDeposit';
import { setCurrentEvent } from '../actions/application';
import { attemptCharge } from '../actions/payment';
import { loadRegistration, recordExternalPayment } from '../actions/registration';
import { PAYMENT_PROCESSING } from '../constants';


const mapStateToProps = ({ application, auth, registration, earlyDeposit }) => ({
  currentUser: auth.currentUser,
  registrationStatus: registration.status,
  paymentProcessing: application.state === PAYMENT_PROCESSING,
  madeEarlyDeposit: earlyDeposit.complete
});

const mapDispatchToProps = (dispatch) => ({
  handleCharge(amount, token, description, event, user) {
    dispatch(attemptCharge(amount, token, description, event, user));
  },
  setCurrentEvent(event) {
    dispatch(setCurrentEvent(event));
  },
  loadRegistration(event, user) {
    dispatch(loadRegistration(event, user));
  },
  recordExternalPayment(event, user, externalType) {
    dispatch(recordExternalPayment(event, user, externalType));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(EarlyDeposit);
