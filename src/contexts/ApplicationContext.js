import React, { createContext, useState } from 'react';

const { LOADING, } from '../constants';

export const ApplicationContext = createContext();

    //   return { ...state, state: action.value };
    // case APPLICATION_ERROR_CHANGED:
    //   return { ...state, error: action.message };
    // case CURRENT_EVENT_SELECTED:
    //   return { ...state, currentEvent: action.event };
    // case SERVER_TIMESTAMP_RECEIVED:
    //   return { ...state, serverTimestamp: action.timestamp };
    // case SET_ROOM_UPGRADE:
    //   let roomUpgrade = action.roomUpgrade || {};
    //   roomUpgrade.eventId = action.eventid;
    //   return { ...state, roomUpgrade };
const ApplicationProvider = ({children}) => {
  const [status, setStatus] = useState(LOADING);
  const [currentEvent, setCurrentEvent] = useState();
  const [serverTimestamp, setServerTimestamp] = useState();
  const [roomUpgrade, setRoomUpgrade] = useState();

  const setApplicationError = (err, uiMessage) => {
    log(err);
    setErrorMessage(uiMessage);
  };

  const clearApplicationError = () => {
    setErrorMessage('');
  };

  return (
    <ApplicationContext.Provider value={{
      errorMessage,
      setApplicationError,
      clearApplicationError
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export default ApplicationProvider;
