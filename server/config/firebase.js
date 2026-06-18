import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let firebaseApp = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // If it's enclosed in quotes, strip them
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    // Replace literal escaped \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }, 'injection-fcm'); // Using a unique name to avoid default app duplicate initialization issues
    console.log('🔥 Firebase Admin SDK initialized successfully');
  } else {
    console.warn('⚠️ Firebase credentials missing or incomplete. Push notification features will fall back to log/console output.');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
}

export default firebaseApp;
