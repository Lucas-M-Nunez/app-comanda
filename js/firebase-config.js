// 1. Creá un proyecto en Firebase y copiá estos datos desde la configuración del proyecto.
// 2. Mantené este archivo fuera de control de versiones si necesitás seguridad adicional.

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
