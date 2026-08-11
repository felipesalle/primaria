import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const APP_ID = 'lasalle-primaria-deportes';

const firebaseConfig = {
    apiKey: "AIzaSyBHX9ezfBiEZhxIDZTr-OTB5hgKV-zt0G4",
    authDomain: "torneos-lasalle-2.firebaseapp.com",
    projectId: "torneos-lasalle-2",
    storageBucket: "torneos-lasalle-2.firebasestorage.app",
    messagingSenderId: "860168864523",
    appId: "1:860168864523:web:1da5a47fa8ccb20def980e"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
