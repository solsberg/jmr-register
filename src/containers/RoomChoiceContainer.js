import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import RoomChoice from '../components/RoomChoice';
// import { updateProfile } from '../actions/registration';

const mapStateToProps = ({ registration }, { history, match }) => ({
  profile: registration.profile,
  history,
  match
});

const mapDispatchToProps = (dispatch) => ({
  // updateProfile(user, profile) { dispatch(updateProfile(user, profile)); }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RoomChoice));
