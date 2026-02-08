// Lazy-load Firebase modules only when needed
let firebasePromise = null;
let authPromise = null;
let firestorePromise = null;

const firebaseConfig = {
  apiKey: "AIzaSyA8NNUo5f4c3y4IAiTY-qzgRwsV5Zc0Kz0",
  authDomain: "journeyman-calc.firebaseapp.com",
  projectId: "journeyman-calc",
  storageBucket: "journeyman-calc.firebasestorage.app",
  messagingSenderId: "685074542143",
  appId: "1:685074542143:web:a6168db28b155ec110928a",
  measurementId: "G-37JDSBDN4T"
};

async function getFirebaseApp() {
  if (!firebasePromise) {
    firebasePromise = import('firebase/app').then(({ initializeApp }) => {
      return initializeApp(firebaseConfig);
    });
  }
  return firebasePromise;
}

async function getAuthModule() {
  if (!authPromise) {
    authPromise = Promise.all([
      getFirebaseApp(),
      import('firebase/auth')
    ]).then(([app, auth]) => {
      return { app, auth: auth.getAuth(app), ...auth };
    });
  }
  return authPromise;
}

async function getFirestoreModule() {
  if (!firestorePromise) {
    firestorePromise = Promise.all([
      getFirebaseApp(),
      import('firebase/firestore')
    ]).then(([app, firestore]) => {
      return { app, db: firestore.getFirestore(app), ...firestore };
    });
  }
  return firestorePromise;
}

export const signInWithGoogle = async () => {
  const { auth, GoogleAuthProvider, signInWithPopup } = await getAuthModule();
  return signInWithPopup(auth, new GoogleAuthProvider());
};

export const signInWithGithub = async () => {
  const { auth, GithubAuthProvider, signInWithPopup } = await getAuthModule();
  return signInWithPopup(auth, new GithubAuthProvider());
};

export const logOut = async () => {
  const { auth, signOut } = await getAuthModule();
  return signOut(auth);
};

export const onAuthChange = async (callback) => {
  const { auth, onAuthStateChanged } = await getAuthModule();
  return onAuthStateChanged(auth, callback);
};

export const saveCalculation = async (userId, calculation) => {
  try {
    const { db, collection, doc, setDoc } = await getFirestoreModule();
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
    const { db, collection, query, getDocs, orderBy } = await getFirestoreModule();
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
    const { db, doc, deleteDoc } = await getFirestoreModule();
    await deleteDoc(doc(db, 'users', userId, 'calculations', calcId));
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw error;
  }
};
