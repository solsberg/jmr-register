import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useStore, useDispatch } from 'react-redux';
import {
  signInWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  signOut as signOutAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider
} from "firebase/auth";
import { serverTimestamp } from 'firebase/database';
import { auth } from '../firebase';
import pick from 'lodash/pick';

import { GOOGLE_OAUTH_PROVIDER, FACEBOOK_OAUTH_PROVIDER, FIRST_NAME_FIELD, LAST_NAME_FIELD } from '../constants';
import { fetchImportedProfile, fetchUserData, updateUserData } from '../lib/api';
import { log, b64DecodeUnicode, isMobile } from '../lib/utils';
import { loadRegistration, clearRegistration } from '../actions/registration';
import { useApplication } from '../providers/ApplicationProvider';

const createOrUpdateUser = (user, profile) => {
  return fetchUserData(user.uid).then((userData) => {
    //local function to create or update the user record in firebase
    //based on input state
    const updateUser = (userData, newProfile, importedProfile) => {
      if (!userData) {
        userData = pick(user, ['email', 'uid']);
        userData.created_at = serverTimestamp();
      }
      userData.profile = Object.assign({}, importedProfile, newProfile, userData.profile);
      if (Object.keys(userData.profile).length === 0) {
        delete userData.profile;
      }
      userData.last_login = serverTimestamp();
      return updateUserData(user.uid, userData);
    };
    //should we look in the imported profile
    if (!userData || !userData.profile || Object.keys(userData.profile).length <= 2) {
      return fetchImportedProfile(user.email).then((importedProfile) =>
        updateUser(userData, profile, importedProfile)
      )
      .catch((err) => {
        // window.Rollbar.error("Error fetching imported profile for " + user.email, {error: err});
        //update the data without the imported profile
        return updateUser(userData, profile);
      });
    } else {
      //dont query imported profile in this case
      return updateUser(userData, profile);
    }
  });
};

export const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const store = useStore();
  const dispatch = useDispatch();
  const { setApplicationError, clearApplicationError } = useApplication();

  const signOut = useCallback(() => {
    setCurrentUser(null);
    dispatch(clearRegistration());
    signOutAuth(auth);
    clearApplicationError();
  }, [ dispatch, clearApplicationError ]);

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        log("user has signed in", user);
        Promise.all([
          createOrUpdateUser(user),
          user.getIdToken()
        ]).then(([_x, token]) => {
          const claims = JSON.parse(b64DecodeUnicode(token.split('.')[1]));
          setCurrentUser({
            email: user.email,
            uid: user.uid,
            admin: !!claims.admin
          });
        })
        .catch(err => {
          setApplicationError(err, "Unable to load your account data");
          setCurrentUser(null);
          signOut(auth);
        });
      } else {
        setCurrentUser(null);
        dispatch(clearRegistration());
      }
    });
  }, [dispatch, setApplicationError, signOut ]);

  useEffect(() => {
    if (currentUser) {
      const state = store.getState();
      dispatch(loadRegistration(state.application.currentEvent, currentUser));
    }
  }, [currentUser, dispatch, store]);

  const signInWithCredentials = (email, password) => {
    log('signInWithCredentials: signing in');
    signInWithEmailAndPassword(auth, email, password).then(() => {
      log('signInWithCredentials: signed in');
      clearApplicationError();
    }).catch(err => {
      let message = err.message;
      if (message.indexOf("no user record corresponding to this identifier") >= 0) {
        message = `We could not find an existing account in the system for ${email}. Please click Create Account to create a new account with this email address.`;
      }
      setApplicationError(`signIn error: (${err.code}) ${err.message}`, message);
    });
  }

  const signInWithOAuthProvider = (providerName) => {
    log('signInWithOAuthProvider: show popup for ' + providerName);
    let provider;
    let profileFields;
    switch (providerName) {
      case GOOGLE_OAUTH_PROVIDER:
        provider = new GoogleAuthProvider();
        profileFields = {
          [FIRST_NAME_FIELD]: 'given_name',
          [LAST_NAME_FIELD]: 'family_name'
        };
        break;
      case FACEBOOK_OAUTH_PROVIDER:
        provider = new FacebookAuthProvider();
        profileFields = {
          [FIRST_NAME_FIELD]: 'first_name',
          [LAST_NAME_FIELD]: 'last_name'
        };
        break;
      default:
    }
    const authResult = isMobile() ? signInWithRedirect(auth, provider) : signInWithPopup(auth, provider);
    authResult.then((result) => {
      log('signInWithOAuthProvider: signed in', result);
      const user = result.user;
      const userInfo = result.additionalUserInfo;
      if (!!userInfo && userInfo.isNewUser) {
        // window.Rollbar.info("New user account created with OAuth for " + user.email, {provider: userInfo.providerId});
        if (!!userInfo.profile &&
            userInfo.profile[profileFields[FIRST_NAME_FIELD]] &&
            userInfo.profile[profileFields[LAST_NAME_FIELD]]) {
          createOrUpdateUser(user, {
            first_name: userInfo.profile[profileFields[FIRST_NAME_FIELD]],
            last_name: userInfo.profile[profileFields[LAST_NAME_FIELD]]
          });
        }
      }
      clearApplicationError();
    }).catch(err => {
      if (err.code !== 'auth/popup-closed-by-user') {
        setApplicationError(`signIn error: (${err.code}) ${err.message}`, err.message);
      }
    });
  }

  const createAccount = (email, password, profile) => {
    createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
      createOrUpdateUser(userCredential.user, profile);
      clearApplicationError();
      // window.Rollbar.info("New user account created for " + email);
    }).catch(err => {
      setApplicationError(`signUp error: (${err.code}) ${err.message}`, err.message);
      // window.Rollbar.error("Error creating new user account for " + email, {error: err});
    });
  }

  const forgotPassword = (email) => {
    log('forgotPassword: sending reset password email');
    sendPasswordResetEmail(auth, email).then(() => {
      log('forgotPassword: sent email');
      clearApplicationError();
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
      setApplicationError(`forgotPassword error: (${err.code}) ${err.message}`, uiMessage);
    });
  }

  return (
    <AuthContext.Provider value={{
        currentUser,
        signInWithCredentials,
        signInWithOAuthProvider,
        createAccount,
        forgotPassword,
        signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
