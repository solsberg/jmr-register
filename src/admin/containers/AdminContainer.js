import { connect } from 'react-redux';
import Admin from '../components/Admin';
import { loadAdminData } from '../actions/admin';


const mapStateToProps = ({ auth, events, admin }) => {
  return {
    currentUser: auth.currentUser,
    events,
    data: admin.data
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadAdminData(event) { dispatch(loadAdminData(event)); }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
