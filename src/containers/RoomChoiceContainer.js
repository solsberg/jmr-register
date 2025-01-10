import { connect } from 'react-redux';
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

const mapStateToProps = ({ registration }, { event, currentUser }) => ({
  order: _getOrder(registration),
  bambam: get(registration, 'data.bambam'),
  roomUpgradeInRegistration: get(registration, 'data.roomUpgrade'),
  registrationStatus: registration.status,
  madePayment: !!get(registration, "data.account.payments"),
  payments: get(registration, "data.account.payments"),
  hasBalance: has(registration, 'data.order') && calculateBalance(registration.data, event, currentUser) > 0,
});

const mapDispatchToProps = (dispatch) => ({
  applyRoomChoice(event, user, values, isUpdate) {
    dispatch(!isUpdate ? addToCart(event, user, values) : updateOrder(event, user, values));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(RoomChoice);
