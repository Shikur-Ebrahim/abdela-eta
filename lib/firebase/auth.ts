import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "./config";

export const auth = getAuth(app);
const db = getFirestore(app);

// Check if user has admin privileges by looking up their Firestore document
export const isUserAdmin = async (user: any) => {
    if (!user) return false;
    
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.isAdmin === true) {
                return true;
            }
        }
    } catch (error) {
        console.error("Error fetching user admin status:", error);
    }
    
    return false;
};

export { signInWithEmailAndPassword, signOut, onAuthStateChanged };
