import React, { createContext, useState } from 'react';
import { log } from '../lib/utils';

export const ErrorContext = createContext();

const ErrorProvider = ({children}) => {
  const [errorMessage, setErrorMessage] = useState();

  const setApplicationError = (err, uiMessage) => {
    log(err);
    setErrorMessage(uiMessage);
  };

  const clearApplicationError = () => {
    setErrorMessage('');
  };

  return (
    <ErrorContext.Provider value={{
      errorMessage,
      setApplicationError,
      clearApplicationError
    }}>
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorProvider;
