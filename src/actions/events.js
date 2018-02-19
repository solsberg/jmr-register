import { fetchEvents as fetchEventsApi } from '../lib/api';
import { ADD_EVENT } from '../constants';
import { setApplicationLoaded, setApplicationError } from './application';

export const addEvent = (event) => {
  return {
    type: ADD_EVENT,
    event: event
  };
};

export const fetchEvents = () => {
  return (dispatch) => {
    return fetchEventsApi().then(events => {
      events
        .filter(event => event.status !== 'CLOSED')
        .forEach(event => {
          dispatch(addEvent(event));
        });
      dispatch(setApplicationLoaded())
    })
    .catch(err => dispatch(setApplicationError(err, "Unable to load events")));
  };
};
