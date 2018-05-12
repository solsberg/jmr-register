import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Profile from '../components/Profile';
import { updateProfile } from '../actions/registration';

const mapStateToProps = ({ registration }, { history, match }) => ({
  profile: registration.profile,
  personalInfo: (registration.data && registration.data.personal) || {}
});

const mapDispatchToProps = (dispatch) => ({
  updateProfile(user, event, profile, personalInfo) { dispatch(updateProfile(user, event, profile, personalInfo)); }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
