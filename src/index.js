import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import reducer from './reducers';
import initialState from './initial-state';
import './index.css';
import ApplicationContainer from './containers/ApplicationContainer';
import { fetchEvents } from './actions/events';

const middleware = [ thunk ];
const enhancers = [];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducer,
  initialState,
  composeEnhancers(
    applyMiddleware(...middleware),
    ...enhancers
  )
);

store.dispatch(fetchEvents());

ReactDOM.render(
  <Provider store={store}>
    <ApplicationContainer />
  </Provider>,
  document.getElementById('root')
);
