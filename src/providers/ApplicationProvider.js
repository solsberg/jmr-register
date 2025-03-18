import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initServer } from '../lib/api';
import { log } from '../lib/utils';
import { LOADING } from '../constants';

const ApplicationContext = createContext();

const ApplicationProvider = ({children}) => {
  const [errorMessage, setErrorMessage] = useState();
  const [status, setStatus] = useState(LOADING);
  const [serverTimestamp, setServerTimestamp] = useState();
  const [roomUpgrade, setRoomUpgrade] = useState();

  useEffect(() => {
    initServer().then((response) => {
      setServerTimestamp(response.data.timestamp);
    });
  } , []);

  const setApplicationError = useCallback((err, uiMessage) => {
    log(err);
    setErrorMessage(uiMessage);
  }, [ setErrorMessage ]);

  const clearApplicationError = useCallback(() => {
    setErrorMessage('');
  }, [ setErrorMessage ]);

  return (
    <ApplicationContext.Provider value={{
      errorMessage,
      setApplicationError,
      clearApplicationError,
      status,
      setStatus,
      serverTimestamp,
      roomUpgrade,
      setRoomUpgrade,
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export default ApplicationProvider;

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (typeof context === "undefined") {
    throw new Error("useApplication must be used within a <ApplicationProvider />");
  }
  return context;
};
