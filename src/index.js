import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import reducer from './reducers';
import ApplicationContainer from './containers/ApplicationContainer';
import { startListeningToAuthChanges } from './actions/auth';
import { fetchEvents } from './actions/events';

import './index.css';

const middleware = [ thunk ];
const enhancers = [];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducer,
  {},
  composeEnhancers(
    applyMiddleware(...middleware),
    ...enhancers
  )
);

store.dispatch(startListeningToAuthChanges(store));
store.dispatch(fetchEvents());

ReactDOM.render(
  <Provider store={store}>
    <ApplicationContainer />
  </Provider>,
  document.getElementById('root')
);
