import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';

import reducer from './reducers';
import ApplicationContainer from './containers/ApplicationContainer';
import AuthProvider from './contexts/AuthContext';
import { fetchEvents } from './actions/events';
import { setServerTimestamp } from './actions/application';
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

store.dispatch(fetchEvents());

initServer().then((response) => {
  store.dispatch(setServerTimestamp(response.data.timestamp));
});

ReactDOM.render(
  <Provider store={store}>
    <AuthProvider>
      <BrowserRouter>
        <ApplicationContainer />
      </BrowserRouter>
    </AuthProvider>
  </Provider>,
  document.getElementById('root')
);
