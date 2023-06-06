import firebase from '@react-native-firebase/app';

// Add your Firebase configuration here
const firebaseConfig = {
  apiKey: 'AIzaSyD_qmhuA_SCEKhMZz4YoqbnFuzQBYaGBog ',
  authDomain: '<YOUR_AUTH_DOMAIN>',
  databaseURL: '<YOUR_DATABASE_URL>',
  projectId: '<YOUR_PROJECT_ID>',
  storageBucket: '<YOUR_STORAGE_BUCKET>',
  messagingSenderId: '<YOUR_MESSAGING_SENDER_ID>',
  appId: '<YOUR_APP_ID>',
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
