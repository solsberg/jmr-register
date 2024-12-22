import { connect } from 'react-redux';
import get from 'lodash/get';
import Profile from '../components/Profile';
import { updateProfile } from '../actions/registration';

const mapStateToProps = ({ registration }) => ({
  profile: registration.profile,
  personalInfo: (registration.data && registration.data.personal) || {},
  order: Object.assign({}, get(registration, "data.order"), get(registration, "data.cart"))
});

const mapDispatchToProps = (dispatch) => ({
  updateProfile(user, event, profile, personalInfo) { dispatch(updateProfile(user, event, profile, personalInfo)); }
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
