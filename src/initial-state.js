import { LOADING } from './constants';

const initialState = {
  application: {
    state: LOADING,
    error: ''
  },
  auth: {
    currentUser: null
  },
  registration: {
  }
};

export default initialState;
