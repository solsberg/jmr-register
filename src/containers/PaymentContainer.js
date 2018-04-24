import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Payment from '../components/Payment';

const mapStateToProps = ({ registration }, { history, match }) => ({
  registration: registration.data,
  history,
  match
});

const mapDispatchToProps = (dispatch) => ({
//  applyRoomChoice(event, user, roomChoice) { dispatch(applyRoomChoice(event, user, roomChoice)); }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Payment));
