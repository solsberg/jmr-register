import { fetchAdminData } from '../../lib/api';
import { SET_ADMIN_DATA } from '../../constants';
import { setApplicationError, clearApplicationError } from '../../actions/application';

const setAdminData = (data) => {
  return {
    type: SET_ADMIN_DATA,
    data
  };
};

export const loadAdminData = (event) => {
  return (dispatch) => {
    dispatch(setAdminData());
    return fetchAdminData(event.eventId).then(data => {
      dispatch(clearApplicationError());
      dispatch(setAdminData(data));
    })
    .catch(err => {
      dispatch(setApplicationError(err, "Unable to load data for admin site"));
      dispatch(setAdminData());
    });
  };
};
