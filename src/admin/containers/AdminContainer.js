import { connect } from 'react-redux';
import Admin from '../components/Admin';
import { loadAdminData, reloadRegistration } from '../actions/admin';

const mapStateToProps = ({ admin }) => {
  return {
    data: admin.data,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadAdminData(event) { dispatch(loadAdminData(event)); },
    reloadRegistration(event, user) { dispatch(reloadRegistration(event, user)); }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
