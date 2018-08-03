import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/registration';
import { SET_REGISTRATION_STATUS, SET_REGISTRATION, APPLICATION_ERROR_CHANGED, LOADING, LOADED } from '../../constants';
import * as api from '../../lib/api';

jest.mock('../../firebase', () => ({
  database: {
    ref: jest.fn()
  }
}));

let mockFetchedRegistration;
jest.mock('../../lib/api', () => ({
  fetchRegistration: jest.fn(() => new Promise((resolve, reject) => {
    resolve(mockFetchedRegistration);
  })),
  recordExternalPayment: jest.fn(() => new Promise((resolve, reject) => {
    resolve();
  }))
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const event = {eventId: 'test-event'};
const user = {uid: 'test-user'};

describe('loadRegistration', () => {
  it('should create SET_REGISTRATION_STATUS with LOADING', () => {
    const expectedAction = { type: SET_REGISTRATION_STATUS, status: LOADING };

    const store = mockStore({});

    return store.dispatch(actions.loadRegistration(event, user)).then(() => {
      expect(store.getActions()).toContainEqual(expectedAction);
    });
  });

  it('should create SET_REGISTRATION with the fetched registration', () => {
    const registration = 'test-registration';
    mockFetchedRegistration = registration;
    const expectedAction = { type: SET_REGISTRATION, registration };

    const store = mockStore({});

    return store.dispatch(actions.loadRegistration(event, user)).then(() => {
      expect(store.getActions()).toContainEqual(expectedAction);
    });
  });

  it('should create SET_REGISTRATION_STATUS with LOADED', () => {
    const expectedAction = { type: SET_REGISTRATION_STATUS, status: LOADED };

    const store = mockStore({});

    return store.dispatch(actions.loadRegistration(event, user)).then(() => {
      expect(store.getActions()).toContainEqual(expectedAction);
    });
  });

  it('should create APPLICATION_ERROR_CHANGED with empty message', () => {
    const expectedAction = { type: APPLICATION_ERROR_CHANGED, message: '' };

    const store = mockStore({});

    return store.dispatch(actions.loadRegistration(event, user)).then(() => {
      expect(store.getActions()).toContainEqual(expectedAction);
    });
  });

  it('should pass event and user to fetchRegistration', () => {
    const store = mockStore({});

    return store.dispatch(actions.loadRegistration(event, user)).then(() => {
      expect(api.fetchRegistration.mock.calls[0]).toEqual([event, user]);
    });
  });
});

describe('recordExternalPayment', () => {
  it('should call recordExternalPayment in api params', () => {
    const paymentType = 'payment-type';
    const store = mockStore({});

    store.dispatch(actions.recordExternalPayment(event, user, paymentType));
    expect(api.recordExternalPayment.mock.calls[0]).toEqual([event, user, paymentType]);
  });
});
