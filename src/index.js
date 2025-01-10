import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import { thunk } from 'redux-thunk';
import { BrowserRouter } from 'react-router';

import reducer from './reducers';
import ApplicationContainer from './containers/ApplicationContainer';
import ApplicationProvider from './providers/ApplicationProvider';
import EventsProvider from './providers/EventsProvider';
import AuthProvider from './contexts/AuthContext';
import PaymentCheckoutProvider from './providers/PaymentCheckoutProvider';

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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ApplicationProvider>
        <EventsProvider>
          <AuthProvider>
            <PaymentCheckoutProvider>
              <BrowserRouter>
                <ApplicationContainer />
              </BrowserRouter>
            </PaymentCheckoutProvider>
          </AuthProvider>
        </EventsProvider>
      </ApplicationProvider>
    </Provider>,
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
