import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Payment from '../components/Payment';
import { attemptCharge } from '../actions/payment';
import { recordExternalPayment } from '../actions/registration';

const mapStateToProps = ({ registration }, { history, match }) => ({
  registration: registration.data,
  registrationStatus: registration.status,
  history,
  match
});

const mapDispatchToProps = (dispatch) => ({
  handleCharge(amount, token, description, event, user, onSuccess) {
    dispatch(attemptCharge(amount, token, description, event, user, onSuccess));
  },
  recordExternalPayment(event, user, externalType) {
    dispatch(recordExternalPayment(event, user, externalType));
  }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Payment));
