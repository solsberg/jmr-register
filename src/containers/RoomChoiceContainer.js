import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import get from 'lodash/get';
import has from 'lodash/has';
import RoomChoice from '../components/RoomChoice';
import { addToCart, updateOrder } from '../actions/registration';
import { calculateBalance } from '../lib/utils';

function _getOrder(registration) {
  if (!registration || !registration.data) {
    return {};
  }
  return Object.assign({}, registration.data.cart, registration.data.order);
}

const mapStateToProps = ({ registration, application, auth }, { history, match, event, currentUser }) => ({
  order: _getOrder(registration),
  bambam: get(registration, 'data.bambam'),
  roomUpgrade: get(registration, 'data.roomUpgrade') || application.roomUpgrade,
  registrationStatus: registration.status,
  madePayment: !!get(registration, "data.account.payments"),
  hasBalance: has(registration, 'data.order') && calculateBalance(registration.data, event, currentUser) > 0,
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
