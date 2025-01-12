import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import Application from './components/Application';
import ApplicationProvider from './providers/ApplicationProvider';
import EventsProvider from './providers/EventsProvider';
import RegistrationProvider from './providers/RegistrationProvider';
import AuthProvider from './providers/AuthProvider';
import PaymentCheckoutProvider from './providers/PaymentCheckoutProvider';

import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApplicationProvider>
      <EventsProvider>
        <RegistrationProvider>
          <AuthProvider>
            <PaymentCheckoutProvider>
              <BrowserRouter>
                <Application />
              </BrowserRouter>
            </PaymentCheckoutProvider>
          </AuthProvider>
        </RegistrationProvider>
      </EventsProvider>
    </ApplicationProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
