import { connect } from 'react-redux';
import EarlyDeposit from '../components/EarlyDeposit';
import { attemptCharge, recordExternalPayment } from '../actions/payment';
import { PAYMENT_PROCESSING } from '../constants';


const mapStateToProps = ({ application, auth, registration, earlyDeposit }) => ({
  currentUser: auth.currentUser,
  registrationStatus: registration.status,
  paymentProcessing: application.state === PAYMENT_PROCESSING,
  madeEarlyDeposit: earlyDeposit.complete
});

const mapDispatchToProps = (dispatch) => ({
  handleCharge(amount, token, description, event, user, onSuccess) {
    dispatch(attemptCharge(amount, token, description, event, user, onSuccess));
  },
  recordExternalPayment(event, user, externalType) {
    dispatch(recordExternalPayment(event, user, externalType));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(EarlyDeposit);
