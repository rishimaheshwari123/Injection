import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import dotenv from 'dotenv';

dotenv.config();

let firebaseApp = null;
let messaging = null;

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

  // Check if all required credentials are present
  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Firebase credentials missing or incomplete. Push notification features will be disabled.');
    console.warn(`Missing: ${!projectId ? 'FIREBASE_PROJECT_ID ' : ''}${!clientEmail ? 'FIREBASE_CLIENT_EMAIL ' : ''}${!privateKey ? 'FIREBASE_PRIVATE_KEY' : ''}`);
  } else {
    if (getApps().length === 0) {
      // Only initialize if no app exists yet
      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('🔥 Firebase Admin SDK initialized successfully');
    } else {
      // Use existing app
      firebaseApp = getApp();
      console.log('🔥 Firebase Admin SDK already initialized, using existing instance');
    }
    messaging = getMessaging(firebaseApp);
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  console.error('Stack trace:', error.stack);
  firebaseApp = null;
  messaging = null;
}

export { firebaseApp, messaging };
export default firebaseApp;

