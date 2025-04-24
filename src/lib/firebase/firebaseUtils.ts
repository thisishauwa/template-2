import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Auth functions
export const logoutUser = () => {
  if (!auth) {
    console.warn("Cannot logout: Firebase auth is not initialized");
    return Promise.resolve();
  }
  return signOut(auth);
};

export const signInWithGoogle = async () => {
  if (!auth) {
    console.warn("Cannot sign in with Google: Firebase auth is not initialized");
    throw new Error("Firebase auth is not initialized");
  }

  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = async (collectionName: string, data: any) => {
  if (!db) {
    console.warn("Cannot add document: Firebase Firestore is not initialized");
    throw new Error("Firebase Firestore is not initialized");
  }
  return addDoc(collection(db, collectionName), data);
};

export const getDocuments = async (collectionName: string) => {
  if (!db) {
    console.warn("Cannot get documents: Firebase Firestore is not initialized");
    return [];
  }
  
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  if (!db) {
    console.warn("Cannot update document: Firebase Firestore is not initialized");
    return Promise.resolve();
  }
  return updateDoc(doc(db, collectionName, id), data);
};

export const deleteDocument = async (collectionName: string, id: string) => {
  if (!db) {
    console.warn("Cannot delete document: Firebase Firestore is not initialized");
    return Promise.resolve();
  }
  return deleteDoc(doc(db, collectionName, id));
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  if (!storage) {
    console.warn("Cannot upload file: Firebase Storage is not initialized");
    throw new Error("Firebase Storage is not initialized");
  }
  
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
