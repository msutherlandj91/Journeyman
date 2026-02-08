import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, query, getDocs, orderBy, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8NNUo5f4c3y4IAiTY-qzgRwsV5Zc0Kz0",
  authDomain: "journeyman-calc.firebaseapp.com",
  projectId: "journeyman-calc",
  storageBucket: "journeyman-calc.firebasestorage.app",
  messagingSenderId: "685074542143",
  appId: "1:685074542143:web:a6168db28b155ec110928a",
  measurementId: "G-37JDSBDN4T"
};

// Initialize Firebase only once
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export const signInWithGoogle = () => {
  return signInWithPopup(auth, new GoogleAuthProvider());
};

export const signInWithGithub = () => {
  return signInWithPopup(auth, new GithubAuthProvider());
};

export const logOut = () => {
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const saveCalculation = async (userId, calculation) => {
  try {
    const calcRef = doc(collection(db, 'users', userId, 'calculations'), calculation.id || Date.now().toString());
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
    const calcsRef = collection(db, 'users', userId, 'calculations');
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
    await deleteDoc(doc(db, 'users', userId, 'calculations', calcId));
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw error;
  }
};
