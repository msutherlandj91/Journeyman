const firebaseConfig = {
  apiKey: "AIzaSyA8NNUo5f4c3y4IAiTY-qzgRwsV5Zc0Kz0",
  authDomain: "journeyman-calc.firebaseapp.com",
  projectId: "journeyman-calc",
  storageBucket: "journeyman-calc.firebasestorage.app",
  messagingSenderId: "685074542143",
  appId: "1:685074542143:web:a6168db28b155ec110928a",
  measurementId: "G-37JDSBDN4T"
};

let _app = null;
let _auth = null;
let _db = null;

async function getApp() {
  if (!_app) {
    const { initializeApp } = await import('firebase/app');
    _app = initializeApp(firebaseConfig);
  }
  return _app;
}

async function getAuthInstance() {
  if (!_auth) {
    const app = await getApp();
    const { getAuth } = await import('firebase/auth');
    _auth = getAuth(app);
  }
  return _auth;
}

async function getDbInstance() {
  if (!_db) {
    const app = await getApp();
    const { getFirestore } = await import('firebase/firestore');
    _db = getFirestore(app);
  }
  return _db;
}

export const signInWithGoogle = async () => {
  const auth = await getAuthInstance();
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  return signInWithPopup(auth, new GoogleAuthProvider());
};

export const signInWithGithub = async () => {
  const auth = await getAuthInstance();
  const { GithubAuthProvider, signInWithPopup } = await import('firebase/auth');
  return signInWithPopup(auth, new GithubAuthProvider());
};

export const logOut = async () => {
  const auth = await getAuthInstance();
  const { signOut } = await import('firebase/auth');
  return signOut(auth);
};

export const onAuthChange = async (callback) => {
  const auth = await getAuthInstance();
  const { onAuthStateChanged } = await import('firebase/auth');
  return onAuthStateChanged(auth, callback);
};

export const saveCalculation = async (userId, calculation) => {
  try {
    const db = await getDbInstance();
    const { collection, doc, setDoc } = await import('firebase/firestore');
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
    const db = await getDbInstance();
    const { collection, query, getDocs, orderBy } = await import('firebase/firestore');
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
    const db = await getDbInstance();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'users', userId, 'calculations', calcId));
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw error;
  }
};
