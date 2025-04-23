import { auth, db } from "./firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

/**
 * Utility for checking user authentication status
 * Works in both client and server components
 */
export const checkUserAuth = async () => {
  try {
    // Check if running in browser
    if (typeof window !== 'undefined') {
      // Client-side
      const user = auth.currentUser;
      return { isAuthenticated: !!user, userId: user?.uid };
    } else {
      // Server-side - in this case without Admin SDK we
      // would need to pass a session token or other auth mechanism
      return { isAuthenticated: false, userId: null };
    }
  } catch (error) {
    console.error("Error checking auth:", error);
    return { isAuthenticated: false, userId: null };
  }
};

/**
 * Safely gets a document for a user if they are authenticated
 * Will return null for server-side execution without proper token validation
 */
export const safeGetUserDocument = async (collectionName: string, docId: string) => {
  const { isAuthenticated, userId } = await checkUserAuth();
  
  if (!isAuthenticated || !userId) {
    return null;
  }
  
  try {
    const docRef = doc(db, "users", userId, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    return null;
  }
};

/**
 * Safely gets all documents in a collection for a user if they are authenticated
 */
export const safeGetUserCollection = async (collectionName: string) => {
  const { isAuthenticated, userId } = await checkUserAuth();
  
  if (!isAuthenticated || !userId) {
    return [];
  }
  
  try {
    const collectionRef = collection(db, "users", userId, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    const results: any[] = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    return [];
  }
}; 