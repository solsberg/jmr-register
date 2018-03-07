import { fetchAdminData } from '../../lib/api';
import { SET_ADMIN_DATA } from '../../constants';
import { setApplicationError } from '../../actions/application';

const setAdminData = (data) => {
  return {
    type: SET_ADMIN_DATA,
    data
  };
};

export const loadAdminData = (event) => {
  return (dispatch) => {
    return fetchAdminData(event.eventId).then(data => {
      dispatch(setAdminData(data))
    })
    .catch(err => dispatch(setApplicationError(err, "Unable to load data for admin site")));
  };
};
