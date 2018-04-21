import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import RoomChoice from '../components/RoomChoice';
import { applyRoomChoice } from '../actions/registration';

const mapStateToProps = ({ registration }, { history, match }) => ({
  profile: registration.profile,
  history,
  match
});

const mapDispatchToProps = (dispatch) => ({
  applyRoomChoice(event, user, roomChoice) { dispatch(applyRoomChoice(event, user, roomChoice)); }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RoomChoice));
