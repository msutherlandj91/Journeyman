import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8NNUo5f4c3y4IAiTY-qzgRwsV5Zc0Kz0",
  authDomain: "journeyman-calc.firebaseapp.com",
  projectId: "journeyman-calc",
  storageBucket: "journeyman-calc.firebasestorage.app",
  messagingSenderId: "685074542143",
  appId: "1:685074542143:web:a6168db28b155ec110928a",
  measurementId: "G-37JDSBDN4T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

/**
 * Sign in with Google
 */
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

/**
 * Sign in with GitHub
 */
export const signInWithGithub = () => {
  return signInWithPopup(auth, githubProvider);
};

/**
 * Sign out current user
 */
export const logOut = () => {
  return signOut(auth);
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Save calculation to Firestore
 */
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

/**
 * Get all calculations for current user
 */
export const getCalculations = async (userId) => {
  try {
    const calcsRef = collection(db, 'users', userId, 'calculations');
    const q = query(calcsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching calculations:', error);
    return [];
  }
};

/**
 * Delete a calculation
 */
export const deleteCalculation = async (userId, calcId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'calculations', calcId));
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw error;
  }
};

/**
 * Sync local history to cloud
 */
export const syncHistoryToCloud = async (userId, localHistory) => {
  try {
    for (const entry of localHistory) {
      await saveCalculation(userId, entry);
    }
  } catch (error) {
    console.error('Error syncing history:', error);
    throw error;
  }
};
