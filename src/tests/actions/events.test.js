import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/events';
import { ADD_EVENT, UPDATE_APPLICATION_STATE, LOADED } from '../../constants';

jest.mock('../../firebase', () => ({
  database: {
    ref: jest.fn()
  }
}));

let mockFetchedEvents;
jest.mock('../../lib/api', () => ({
  fetchEvents: jest.fn(() => new Promise((resolve, reject) => {
    resolve(mockFetchedEvents);
  }))
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('addEvent', () => {
  it('should create ADD_EVENT with the event', () => {
    const event = 'an event';
    const expectedAction = {
      type: ADD_EVENT,
      event
    };
    expect(actions.addEvent(event)).toEqual(expectedAction);
  });
});

describe('fetchEvents', () => {
  it('should create ADD_EVENT with each event fetched', () => {
    const event1 = 'event1';
    const event2 = 'event2';
    mockFetchedEvents = [event1, event2];
    const expectedActions = [
      { type: ADD_EVENT, event: event1 },
      { type: ADD_EVENT, event: event2 }
    ];

    const store = mockStore({});

    return store.dispatch(actions.fetchEvents()).then(() => {
      expect(store.getActions()).toContainEqual(expectedActions[0]);
      expect(store.getActions()).toContainEqual(expectedActions[1]);
    });
  });

  it('should create UPDATE_APPLICATION_STATE with LOADED', () => {
    const event = 'event';
    mockFetchedEvents = [event];
    const expectedAction = { type: UPDATE_APPLICATION_STATE, value: LOADED };

    const store = mockStore({});

    return store.dispatch(actions.fetchEvents()).then(() => {
      expect(store.getActions()).toContainEqual(expectedAction);
    });
  });
});
