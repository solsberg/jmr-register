import get from 'lodash/get';
import { fetchRoomUpgradeStatus } from '../lib/api';
import { SET_ROOM_UPGRADE } from '../constants';
import { log } from '../lib/utils';

const setRoomUpgrade = (eventid, roomUpgrade) => {
  return {
    type: SET_ROOM_UPGRADE,
    eventid,
    roomUpgrade
  }
}

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
