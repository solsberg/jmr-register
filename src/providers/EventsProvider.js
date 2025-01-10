import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchEvents  } from '../lib/api';
import { ErrorContext } from '../contexts/ErrorContext';
import { setApplicationLoaded } from '../actions/application';

const EventsContext = createContext();

const EventsProvider = ({children}) => {
  const [events, setEvents] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState();
  const { setApplicationError } = useContext(ErrorContext);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchEvents().then(events => {
      setEvents(events);
      setActiveEvents(events.filter(e => e.status !== 'CLOSED'));
      dispatch(setApplicationLoaded());
    })
    .catch(err => setApplicationError(err, "Unable to load events"));
  }, [ setApplicationError, dispatch ]);

  return (
    <EventsContext.Provider value={{
      events,
      activeEvents,
      currentEvent,
      setCurrentEvent
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
