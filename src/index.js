import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import { thunk } from 'redux-thunk';
import { BrowserRouter } from 'react-router';

import reducer from './reducers';
import ApplicationContainer from './containers/ApplicationContainer';
import ErrorProvider from './contexts/ErrorContext';
import AuthProvider from './contexts/AuthContext';
import PaymentProvider from './contexts/PaymentContext';
import { fetchEvents } from './actions/events';
import { setServerTimestamp } from './actions/application';
import { initServer } from './lib/api';

import './index.css';
import reportWebVitals from './reportWebVitals';

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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorProvider>
        <AuthProvider>
          <PaymentProvider>
            <BrowserRouter>
              <ApplicationContainer />
            </BrowserRouter>
          </PaymentProvider>
        </AuthProvider>
      </ErrorProvider>
    </Provider>,
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
