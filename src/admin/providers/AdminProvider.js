import React, { createContext, useContext, useState, useCallback } from 'react';
import { useApplication } from '../../providers/ApplicationProvider';
import { fetchAdminData, fetchRegistration } from '../../lib/api';

const AdminContext = createContext();

const AdminProvider = ({children}) => {
  const [registrations, setRegistrations] = useState([]);
  const { setApplicationError, clearApplicationError } = useApplication();

  const loadRegistrations = useCallback((event) => {
    setRegistrations([]);
    return fetchAdminData(event.eventId).then(data => {
      clearApplicationError();
      setRegistrations(data);
    })
    .catch(err => {
      setApplicationError(err, "Unable to load data for admin site");
      setRegistrations([]);
    });
  }, [ setRegistrations, setApplicationError, clearApplicationError ]);

  const resetRegistration = (userid, registration) => {
    let pos = registrations.findIndex(r => r.user.uid === userid);
    const newRegistration = {
      user: registrations[pos].user,
      registration
    };
    setRegistrations([...registrations.slice(0, pos), newRegistration, ...registrations.slice(pos+1)]);
  };

  const reloadRegistration = (event, user) => {
    return fetchRegistration(event, user).then(data => {
      clearApplicationError();
      resetRegistration(user.uid, data);
    })
    .catch(err => {
      setApplicationError(err, "Unable to reload registration for admin site");
    });
  };

  return (
    <AdminContext.Provider value={{
      registrations,
      loadRegistrations,
      reloadRegistration
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (typeof context === "undefined") {
    throw new Error("useAdmin must be used within a <AdminProvider />");
  }
  return context;
};
