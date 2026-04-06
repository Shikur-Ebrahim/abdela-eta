import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load service account key
const serviceAccountPath = resolve(process.cwd(), "AbdelaServiceAccountkey.json");
let serviceAccount;
try {
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
} catch (error) {
    console.error("❌ Could not read AbdelaServiceAccountkey.json. Please make sure it exists in the root directory.");
    process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

// Get email from command line arguments, or use a default one if provided
const inputEmail = process.argv[2];
const ADMIN_EMAIL = inputEmail || "shikurebrahim@gmail.com";

if (!inputEmail) {
    console.log(`ℹ️ No email provided as argument. Defaulting to: ${ADMIN_EMAIL}`);
    console.log("Tip: You can specify an email by running: node scripts/create-admin.mjs <user@email.com>");
}

async function setAdmin() {
    try {
        console.log(`\n🔍 Looking up user in Firebase Auth by email: ${ADMIN_EMAIL}...`);
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
            console.log("ℹ️ User document does not exist in 'users' collection. Creating it...");
            adminData.createdAt = admin.firestore.FieldValue.serverTimestamp();
            adminData.displayName = "Admin User";
        } else {
            console.log("ℹ️ User document found in 'users' collection. Updating privileges...");
        }

        await userDocRef.set(adminData, { merge: true });

        console.log("\n🎉 Successfully set as admin in Firestore!");
        console.log("👉 You can now log in at /admin/login and access the Admin Portal.");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ Error setting admin privileges:", error.message);
        if (error.code === "auth/user-not-found") {
            console.error("   Reason: This email is not registered in Firebase Authentication.");
            console.error("   Solution: Please register this user via the app first, or manually create them in the Firebase Console Auth section.");
        }
        process.exit(1);
    }
}

setAdmin();
