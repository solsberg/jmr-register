import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import get from 'lodash/get';
import RoomChoice from '../components/RoomChoice';
import { addToCart, updateOrder } from '../actions/registration';

function _getOrder(registration) {
  if (!registration || !registration.data) {
    return {};
  }
  return Object.assign({}, registration.data.cart, registration.data.order);
}

const mapStateToProps = ({ registration, application }, { history, match }) => ({
  order: _getOrder(registration),
  bambam: get(registration, 'data.bambam'),
  roomUpgrade: get(registration, 'data.roomUpgrade') || application.roomUpgrade,
  registrationStatus: registration.status,
  madePayment: !!get(registration, "data.account.payments"),
  serverTimestamp: application.serverTimestamp,
  history,
  match
});

const mapDispatchToProps = (dispatch) => ({
  applyRoomChoice(event, user, values, isUpdate) {
    dispatch(!isUpdate ? addToCart(event, user, values) : updateOrder(event, user, values));
  }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RoomChoice));
