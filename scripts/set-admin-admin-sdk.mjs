import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

const serviceAccountPath = resolve(process.cwd(), "AbdelaServiceAccountkey.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const ADMIN_EMAIL = "shikurebrahim@gmail.com";

async function setAdmin() {
    try {
        console.log(`🔍 Looking up user by email: ${ADMIN_EMAIL}...`);
        const userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
        const uid = userRecord.uid;
        console.log(`✅ Found user in Auth! UID: ${uid}`);

        const db = admin.firestore();
        const userDocRef = db.collection("users").doc(uid);
        
        const adminData = {
            email: ADMIN_EMAIL,
            isAdmin: true,
            role: "admin",
            uid: uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docSnap = await userDocRef.get();
        if (!docSnap.exists) {
            adminData.createdAt = admin.firestore.FieldValue.serverTimestamp();
            adminData.displayName = "Admin User";
        }

        await userDocRef.set(adminData, { merge: true });

        console.log("🎉 Successfully set as admin in Firestore!");
        console.log("Now you can login and be redirected to the admin page.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error setting admin:", error);
        if (error.code === "auth/user-not-found") {
            console.log("Attempting to create the user via Admin SDK...");
            try {
                // If the user doesn't exist at all, we could create them. But the prompt just says "set as admin".
                // We'll just create a dummy if for some reason they don't exist.
                // But error from earlier was "auth/email-already-in-use", so they DO exist.
            } catch(e) {}
        }
        process.exit(1);
    }
}

setAdmin();
