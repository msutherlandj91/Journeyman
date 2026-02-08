import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8NNUo5f4c3y4IAiTY-qzgRwsV5Zc0Kz0",
  authDomain: "journeyman-calc.firebaseapp.com",
  projectId: "journeyman-calc",
  storageBucket: "journeyman-calc.firebasestorage.app",
  messagingSenderId: "685074542143",
  appId: "1:685074542143:web:a6168db28b155ec110928a",
  measurementId: "G-37JDSBDN4T"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.firestore();

export const signInWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
};

export const signInWithGithub = () => {
  const provider = new firebase.auth.GithubAuthProvider();
  return auth.signInWithPopup(provider);
};

export const logOut = () => {
  return auth.signOut();
};

export const onAuthChange = (callback) => {
  return auth.onAuthStateChanged(callback);
};

export const saveCalculation = async (userId, calculation) => {
  try {
    const calcRef = db
      .collection('users')
      .doc(userId)
      .collection('calculations')
      .doc(calculation.id || Date.now().toString());
    await calcRef.set({
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
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('calculations')
      .orderBy('timestamp', 'desc')
      .get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching calculations:', error);
    return [];
  }
};

export const deleteCalculation = async (userId, calcId) => {
  try {
    await db
      .collection('users')
      .doc(userId)
      .collection('calculations')
      .doc(calcId)
      .delete();
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw error;
  }
};
