import { database } from '../firebase';
import forIn from 'lodash/forIn';

import { ADD_EVENT } from '../constants';
import { setApplicationLoaded } from './application';

const eventsRef = database.ref('/events');

export const addEvent = (eventId, event) => {
  return {
    type: ADD_EVENT,
    eventId: eventId,
    title: event.title
  };
};

export const fetchEvents = () => {
  return (dispatch) => {
    eventsRef.once('value').then(snapshot => {
      forIn(snapshot.val(), (event, eventId) => {
        if (event.status !== 'CLOSED') {
          dispatch(addEvent(eventId, event));
        }
      });
      dispatch(setApplicationLoaded())
    });
  };
};
