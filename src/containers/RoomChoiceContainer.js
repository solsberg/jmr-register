import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import RoomChoice from '../components/RoomChoice';
import { applyRoomChoice } from '../actions/registration';

function _getOrder(registration) {
  if (!registration || !registration.data) {
    return {};
  }
  return Object.assign({}, registration.data.cart, registration.data.order);
}

const mapStateToProps = ({ registration }, { history, match }) => ({
  order: _getOrder(registration),
  madePayment: !!registration && !!registration.data && !!registration.data.account,
  history,
  match
});

const mapDispatchToProps = (dispatch) => ({
  applyRoomChoice(event, user, roomChoice) { dispatch(applyRoomChoice(event, user, roomChoice)); }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RoomChoice));
