import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Event from '../components/Event';
import { selectCurrentEvent } from '../actions/application';
import { loadRegistration } from '../actions/registration';


const mapStateToProps = ({ auth }, { match }) => ({
  currentUser: auth.currentUser,
  match
});

const mapDispatchToProps = (dispatch) => ({
  selectCurrentEvent(event) {
    dispatch(selectCurrentEvent(event));
  },
  loadRegistration(event, user) {
    dispatch(loadRegistration(event, user));
  }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Event));
