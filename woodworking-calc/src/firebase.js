import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, query, getDocs, deleteDoc, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8NNUo5f4c3y4IAiTY-qzgRwsV5Zc0Kz0",
  authDomain: "journeyman-calc.firebaseapp.com",
  projectId: "journeyman-calc",
  storageBucket: "journeyman-calc.firebasestorage.app",
  messagingSenderId: "685074542143",
  appId: "1:685074542143:web:a6168db28b155ec110928a",
  measurementId: "G-37JDSBDN4T"
};

const app = initializeApp(firebaseConfig);

let auth;
let db;

function getAuthInstance() {
  if (!auth) auth = getAuth(app);
  return auth;
}

function getDbInstance() {
  if (!db) db = getFirestore(app);
  return db;
}

export const signInWithGoogle = () => {
  return signInWithPopup(getAuthInstance(), new GoogleAuthProvider());
};

export const signInWithGithub = () => {
  return signInWithPopup(getAuthInstance(), new GithubAuthProvider());
};

export const logOut = () => {
  return signOut(getAuthInstance());
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(getAuthInstance(), callback);
};

export const saveCalculation = async (userId, calculation) => {
  try {
    const calcDb = getDbInstance();
    const calcRef = doc(collection(calcDb, 'users', userId, 'calculations'), calculation.id || Date.now().toString());
    await setDoc(calcRef, {
      ...calculation,
      timestamp: calculation.timestamp || Date.now(),
    });
    return calcRef.id;
  } catch (error) {
    console.error('Error saving calculation:', error);
    throw error;
  }
};

export const getCalculations = async (userId) => {
  try {
    const calcDb = getDbInstance();
    const calcsRef = collection(calcDb, 'users', userId, 'calculations');
    const q = query(calcsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching calculations:', error);
    return [];
  }
};

export const deleteCalculation = async (userId, calcId) => {
  try {
    const calcDb = getDbInstance();
    await deleteDoc(doc(calcDb, 'users', userId, 'calculations', calcId));
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw error;
  }
};
