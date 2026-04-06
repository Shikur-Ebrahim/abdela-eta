import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_EMAIL = process.argv[2];

async function run() {
    console.log(`Looking for user with email: ${ADMIN_EMAIL}`);
    try {
        const q = query(collection(db, "users"), where("email", "==", ADMIN_EMAIL));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.log("User document not found in Firestore.");
            process.exit(1);
        }

        querySnapshot.forEach(async (docSnap) => {
            console.log(`Found user! ID: ${docSnap.id}`);
            await updateDoc(doc(db, "users", docSnap.id), {
                isAdmin: true,
                role: "admin",
                updatedAt: new Date()
            });
            console.log("✅ Successfully updated to admin!");
        });
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
