import { connect } from 'react-redux';
import EarlyDeposit from '../components/EarlyDeposit';
import { setCurrentEvent } from '../actions/application';
import { attemptCharge } from '../actions/payment';
import { loadRegistration } from '../actions/registration';


const mapStateToProps = ({ auth, registration }) => ({
  currentUser: auth.currentUser,
  madeEarlyDeposit: registration.madeEarlyDeposit
});

const mapDispatchToProps = (dispatch) => ({
  handleCharge(amount, token, description, eventid, userid) {
    dispatch(attemptCharge(amount, token, description, eventid, userid));
  },
  setCurrentEvent(event) {
    dispatch(setCurrentEvent(event));
  },
  loadRegistration(event, user) {
    dispatch(loadRegistration(event, user));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(EarlyDeposit);
