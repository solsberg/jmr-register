import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useApplication } from '../providers/ApplicationProvider';
import { fetchEvents  } from '../lib/api';
import { LOADED } from '../constants';

const EventsContext = createContext();

const EventsProvider = ({children}) => {
  const [events, setEvents] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState();
  const { setApplicationError, setStatus } = useApplication();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchEvents().then(events => {
      setEvents(events);
      setActiveEvents(events.filter(e => e.status !== 'CLOSED'));
      setStatus(LOADED);
    })
    .catch(err => setApplicationError(err, "Unable to load events"));
  }, [ setApplicationError, setStatus, dispatch ]);

  return (
    <EventsContext.Provider value={{
      events,
      activeEvents,
      currentEvent,
      setCurrentEvent,
    }}>
      {children}
    </EventsContext.Provider>
  );
};

export default EventsProvider;

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (typeof context === "undefined") {
    throw new Error("useEvents must be used within a <EventsProvider />");
  }
  return context;
};
