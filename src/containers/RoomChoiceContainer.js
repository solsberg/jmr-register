import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import RoomChoice from '../components/RoomChoice';
import { addToCart } from '../actions/registration';

function _getOrder(registration) {
  if (!registration || !registration.data) {
    return {};
  }
  return Object.assign({}, registration.data.cart, registration.data.order);
}

const mapStateToProps = ({ registration, application }, { history, match }) => ({
  order: _getOrder(registration),
  registrationStatus: registration.status,
  madePayment: !!registration && !!registration.data && !!registration.data.account,
  serverTimestamp: application.serverTimestamp,
  history,
  match
});

const mapDispatchToProps = (dispatch) => ({
  applyRoomChoice(event, user, values) { dispatch(addToCart(event, user, values)); }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RoomChoice));
