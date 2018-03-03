import firebase, { database, auth } from '../firebase';
import pick from 'lodash/pick';
import { SIGN_IN, SIGN_OUT, GOOGLE_OAUTH_PROVIDER, FACEBOOK_OAUTH_PROVIDER, FIRST_NAME_FIELD, LAST_NAME_FIELD } from '../constants';
import { setApplicationError, clearApplicationError } from './application';
import { loadRegistration } from './registration';
import { isMobile } from '../lib/utils';

const usersRef = database.ref('/users');

export const signInWithCredentials = (email, password) => {
  return (dispatch) => {
    console.log('signInWithCredentials: signing in');
    auth.signInWithEmailAndPassword(email, password).then(() => {
      console.log('signInWithCredentials: signed in');
      dispatch(clearApplicationError());
    }).catch(err => {
      dispatch(setApplicationError(`signIn error: (${err.code}) ${err.message}`, err.message));
    });
  }
}

const initializeUser = (user, profile) => {
  let userRef = usersRef.child(user.uid);
  return userRef.once("value").then(snapshot => {
    if (!snapshot.val()) {
      //create user with profile data
      let userData = pick(user, ['email', 'uid']);
      if (!!profile) {
        userData.profile = profile;
      }
      userData.created_at = firebase.database.ServerValue.TIMESTAMP;
      userData.last_login = firebase.database.ServerValue.TIMESTAMP;
      userRef.set(userData);
    }
  });
};

export const signInWithOAuthProvider = (providerName) => {
  return (dispatch) => {
    console.log('signInWithOAuthProvider: show popup for ' + providerName);
    let provider;
    let profileFields;
    switch (providerName) {
      case GOOGLE_OAUTH_PROVIDER:
        provider = new firebase.auth.GoogleAuthProvider();
        profileFields = {
          [FIRST_NAME_FIELD]: 'given_name',
          [LAST_NAME_FIELD]: 'family_name'
        };
        break;
      case FACEBOOK_OAUTH_PROVIDER:
        provider = new firebase.auth.FacebookAuthProvider();
        profileFields = {
          [FIRST_NAME_FIELD]: 'first_name',
          [LAST_NAME_FIELD]: 'last_name'
        };
        break;
      default:
    }
    const authResult = isMobile() ? auth.signInWithRedirect(provider) : auth.signInWithPopup(provider);
    authResult.then((result) => {
      console.log('signInWithOAuthProvider: signed in', result);
      const user = result.user;
      const userInfo = result.additionalUserInfo;
      if (!!userInfo && userInfo.isNewUser) {
        window.Rollbar.info("New user account created with OAuth for " + user.email, {provider: userInfo.providerId});
        if (!!userInfo.profile &&
            userInfo.profile[profileFields[FIRST_NAME_FIELD]] &&
            userInfo.profile[profileFields[LAST_NAME_FIELD]]) {
          initializeUser(user, {
            first_name: userInfo.profile[profileFields[FIRST_NAME_FIELD]],
            last_name: userInfo.profile[profileFields[LAST_NAME_FIELD]]
          });
        }
      }
      dispatch(clearApplicationError());
    }).catch(err => {
      if (err.code !== 'auth/popup-closed-by-user') {
        dispatch(setApplicationError(`signIn error: (${err.code}) ${err.message}`, err.message));
      }
    });
  }
}

export const createAccount = (email, password, profile) => {
  return (dispatch) => {
    auth.createUserWithEmailAndPassword(email, password).then((user) => {
      initializeUser(user, profile);
      dispatch(clearApplicationError());
      window.Rollbar.info("New user account created for " + email);
    }).catch(err => {
      dispatch(setApplicationError(`signUp error: (${err.code}) ${err.message}`, err.message));
      window.Rollbar.error("Error creating new user account for " + email, {error: err});
    });
  }
}

export const signOut = () => {
  return (dispatch) => {
    auth.signOut();
    dispatch(clearApplicationError());
  }
}

export const signedIn = (user) => ({
  type: SIGN_IN,
  email: user.email,
  uid: user.uid
});

export const signedOut = () => ({
  type: SIGN_OUT
});

export const forgotPassword = (email) => {
  return (dispatch) => {
    console.log('forgotPassword: sending reset password email');
    auth.sendPasswordResetEmail(email).then(() => {
      console.log('forgotPassword: sent email');
      dispatch(clearApplicationError());
    }).catch(err => {
      let uiMessage;
      switch(err.code) {
        case 'auth/invalid-email':
          uiMessage = "Please enter a valid email address.";
          break;
        case 'auth/user-not-found':
          uiMessage = "There is no matching account with that email address."
          break;
        default:
          uiMessage = "There was an error trying to send the reset password email. " +
            "Please contact registration@menschwork.org for help";
            break;
      }
      dispatch(setApplicationError(`forgotPassword error: (${err.code}) ${err.message}`, uiMessage));
    });
  }
}

export const startListeningToAuthChanges = (store) => {
  return (dispatch) => {
    return auth.onAuthStateChanged(user => {
      if (user) {
        console.log("user has signed in", user);
        initializeUser(user).then(() => {
          dispatch(signedIn(user));
          const state = store.getState();
          dispatch(loadRegistration(state.application.currentEvent, state.auth.currentUser));
        })
        .catch(err => {
          dispatch(setApplicationError(err, "Unable to load your account data"));
          auth.signOut();
        });
      } else {
        dispatch(signedOut());
      }
    });
  };
};
