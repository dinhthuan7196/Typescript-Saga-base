import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const config = ['development', 'qa'].includes(process.env.REACT_APP_STAGE) ? {
  apiKey: 'AIzaSyDOQ4LoxE9kRvDIGj7INm-_vwz6Dts4l3s',
  authDomain: 'xbot-accounts-dev.firebaseapp.com',
  databaseURL: 'https://xbot-accounts-dev.firebaseio.com',
  projectId: 'xbot-accounts-dev',
  storageBucket: 'xbot-accounts-dev.appspot.com',
  messagingSenderId: '562168795958',
  appId: '1:562168795958:web:91350064cbe23c5d9a9997',
}
  : {
    apiKey: 'AIzaSyAIwY1lw-_1vWGAzY6W8Pceds-hxdmmpsg',
    authDomain: 'xbot-accounts.firebaseapp.com',
    databaseURL: 'https://xbot-accounts.firebaseio.com',
    projectId: 'xbot-accounts',
    storageBucket: 'xbot-accounts.appspot.com',
    messagingSenderId: '494095097208',
    appId: '1:494095097208:web:a3e79a3bb261d44307fc8d',
  };

const app = firebase.initializeApp(config);
app.auth().languageCode = 'vi';

const googleProvider = new firebase.auth.GoogleAuthProvider().setCustomParameters({
  prompt: 'select_account',
});
const microsoftProvider = new firebase.auth.OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({
  prompt: 'select_account',
});
const facebookProvider = new firebase.auth.FacebookAuthProvider();
facebookProvider.setCustomParameters({
  prompt: 'select_account',
});

const getToken = (onSuccess, onError) => {
  app.auth().currentUser.getIdToken(true).then((token) => {
    onSuccess(token);
  }).catch(({ message }) => onError(message));
};

export {
  app,
  googleProvider,
  microsoftProvider,
  facebookProvider,
  getToken,
};
