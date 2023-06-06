import {FirebaseApp, initializeApp} from 'firebase/app';
import {Auth, getAuth} from 'firebase/auth';
import {Firestore, getFirestore} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyCzT4SQJ_5iHE_9KP09NH3SxPTPWNSJ-1c',
    authDomain: 'flashcards-48b2e.firebaseapp.com',
    projectId: 'flashcards-48b2e',
    storageBucket: 'flashcards-48b2e.appspot.com',
    messagingSenderId: '525279059351',
    appId: '1:525279059351:web:731864676dcec226e4b8d2'
};

let app: FirebaseApp;
export let auth: Auth;
export let db: Firestore;

export function initFirebase() {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}