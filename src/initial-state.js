import { LOADING } from './constants';

const initialState = {
  application: {
    state: LOADING,
    error: ''
  },
  auth: {
    currentUser: null
  },
  events: [],
  registration: {
  }
};

export default initialState;
