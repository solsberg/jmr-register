import { LOADING } from './constants';

const initialState = {
  application: {
    state: LOADING,
    error: ''
  },
  auth: {
    currentUser: null
  },
  events: []
};

export default initialState;
