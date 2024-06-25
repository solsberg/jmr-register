import { connect } from 'react-redux';
import ScholarshipForm from '../components/ScholarshipForm';
import { applyForScholarship } from '../actions/registration';

const mapStateToProps = ({ registration, application }) => ({
  scholarship: registration.data && registration.data.scholarship,
  serverTimestamp: application.serverTimestamp,
});

const mapDispatchToProps = (dispatch) => ({
  applyForScholarship(event, user, values) {
    dispatch(applyForScholarship(event, user, values));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ScholarshipForm);
