import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';

import reducer from './reducers';
import ApplicationContainer from './containers/ApplicationContainer';
import { startListeningToAuthChanges } from './actions/auth';
import { fetchEvents } from './actions/events';
import { initServer } from './lib/api';

import './index.css';

if (!!process.env.REACT_APP_STAGING) {
  window.Rollbar.configure({payload: {environment: 'staging'}});
}

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

initServer();

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <ApplicationContainer />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
