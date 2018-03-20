import { connect } from 'react-redux';
import Profile from '../components/Profile';
import { updateProfile } from '../actions/registration';

const mapStateToProps = ({ registration }) => ({
  profile: registration.profile
});

const mapDispatchToProps = (dispatch) => ({
  updateProfile(user, profile) { dispatch(updateProfile(user, profile)); }
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
