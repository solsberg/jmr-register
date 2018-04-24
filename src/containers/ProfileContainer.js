import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Profile from '../components/Profile';
import { updateProfile } from '../actions/registration';

const mapStateToProps = ({ registration }, { history, match }) => ({
  profile: registration.profile
});

const mapDispatchToProps = (dispatch) => ({
  updateProfile(user, profile) { dispatch(updateProfile(user, profile)); }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
