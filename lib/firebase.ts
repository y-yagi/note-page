import firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Set only for E2E tests (see playwright.config.ts)
const authEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;

// Firebase is only used for authentication. Data lives behind the JSON API.
export const initFirebase = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    if (authEmulatorHost && typeof window !== "undefined") {
      firebase.auth().useEmulator(`http://${authEmulatorHost}`);
      // Lets the tests sign in without going through the Google popup
      (window as any).firebase = firebase;
    }
  }
};
