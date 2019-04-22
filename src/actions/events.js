import get from 'lodash/get';
import { fetchEvents as fetchEventsApi, fetchRoomUpgradeStatus } from '../lib/api';
import { ADD_EVENT, SET_ROOM_UPGRADE } from '../constants';
import { setApplicationLoaded, setApplicationError } from './application';
import { log } from '../lib/utils';

export const addEvent = (event) => {
  return {
    type: ADD_EVENT,
    event: event
  };
};

const setRoomUpgrade = (eventid, roomUpgrade) => {
  return {
    type: SET_ROOM_UPGRADE,
    eventid,
    roomUpgrade
  }
}

export const fetchEvents = () => {
  return (dispatch) => {
    return fetchEventsApi().then(events => {
      events
        .forEach(event => {
          dispatch(addEvent(event));
        });
      dispatch(setApplicationLoaded())
    })
    .catch(err => dispatch(setApplicationError(err, "Unable to load events")));
  };
};

export const loadEvent = (event) => {
  return (dispatch) => {
    if (!event) {
      return;
    }
    //for now just fetches room upgrade status
    if (get(event, 'roomUpgrade.enabled')) {
      return fetchRoomUpgradeStatus(event.eventId)
      .then(roomUpgrade => dispatch(setRoomUpgrade(event.eventId, roomUpgrade)))
      .catch(err => {
        log("error fetching room upgrade status", err);
      });
    }
  };
};
