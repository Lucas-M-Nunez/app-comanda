import { auth } from "./firebase-config.js"; // Importa la instancia de autenticación de Firebase desde el archivo de configuración para manejar la autenticación de usuarios en la aplicación.
import { getUserProfile } from "./firebase-service.js"; // Importa la función getUserProfile desde el servicio de Firebase para obtener el perfil del usuario autenticado, lo que permite determinar su rol y configurar la interfaz de la aplicación en consecuencia.

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
// signInWithEmailAndPassword(auth, email, password);

const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnLogout = document.getElementById("btn-logout");
const userRoleLabel = document.getElementById("user-role");

window.currentUser = null;
window.currentRole = null;

function showLogin() { // Mostrar la pantalla de inicio de sesión y ocultar la pantalla principal de la aplicación, lo que permite al usuario iniciar sesión para acceder a las funcionalidades de la aplicación. Esta función se llama cuando el usuario no está autenticado o cuando cierra sesión, asegurando que solo los usuarios autenticados puedan acceder a la aplicación.
  loginScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");
}

function showApp() { // Mostrar la pantalla principal de la aplicación y ocultar la pantalla de inicio de sesión, lo que permite al usuario acceder a las funcionalidades de la aplicación después de iniciar sesión correctamente. Esta función se llama cuando el usuario está autenticado y se ha obtenido su perfil para configurar la interfaz según su rol, asegurando que solo los usuarios autenticados puedan acceder a la aplicación.
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
}

function setUserInfo(user, role) { // Establecer la información del usuario autenticado en variables globales y actualizar la etiqueta de rol de usuario en la interfaz. Esta función se llama después de obtener el perfil del usuario autenticado para almacenar su información y mostrar su correo electrónico y rol en la interfaz, lo que permite personalizar la experiencia de la aplicación según el usuario que ha iniciado sesión.
  currentUser = user;
  currentRole = role;
  userRoleLabel.textContent = `${user.email} • ${role}`;
}

function handleAuthState(user) { // Manejar el estado de autenticación del usuario. Si el usuario no está autenticado, se muestra la pantalla de inicio de sesión. Si el usuario está autenticado, se obtiene su perfil para configurar la interfaz según su rol. Esta función se llama automáticamente cada vez que cambia el estado de autenticación del usuario (por ejemplo, al iniciar sesión o cerrar sesión), lo que permite actualizar la interfaz de la aplicación en consecuencia y garantizar que solo los usuarios autenticados puedan acceder a las funcionalidades de la aplicación.
    console.log("USER:", user);

  if (!user) {
    showLogin();
    return;
  }

    console.log("UID:", user.uid);

  getUserProfile(user.uid) // Obtener el perfil del usuario autenticado por su UID para determinar su rol y configurar la interfaz de la aplicación en consecuencia. Si el perfil no existe o no tiene un rol asignado, se muestra un mensaje de error y se cierra la sesión del usuario, lo que garantiza que solo los usuarios con un perfil válido y un rol asignado puedan acceder a la aplicación.
    .then((doc) => {
      if (!doc.exists()) {
        loginError.textContent =
          "Usuario sin rol asignado. Configurá su perfil en Firestore.";
        signOut(auth);
        return;
      }

      const profile = doc.data();
      setUserInfo(user, profile.role || "Sin rol"); // Establecer la información del usuario autenticado en variables globales y actualizar la etiqueta de rol de usuario en la interfaz. Si el perfil del usuario no tiene un rol asignado, se muestra "Sin rol" como valor predeterminado, lo que permite manejar casos en los que el perfil del usuario no esté completamente configurado sin causar errores en la aplicación. Esto es esencial para personalizar la experiencia de la aplicación según el rol del usuario y garantizar que la interfaz se configure correctamente incluso si el perfil del usuario no está completamente configurado.
      showApp();

      const payload = { user, role: profile.role || "Sin rol" }; // Crear un objeto de carga útil con la información del usuario autenticado y su rol para pasar a la función onRoleReady, lo que permite configurar la interfaz de la aplicación según el rol del usuario tan pronto como se cargue la página. Si el rol del usuario no está disponible en el perfil, se muestra "Sin rol" como valor predeterminado, lo que permite manejar casos en los que el perfil del usuario no esté completamente configurado sin causar errores en la aplicación. Esto es esencial para garantizar que la interfaz se configure correctamente según el rol del usuario una vez que se haya determinado su rol después de iniciar sesión.
      if (typeof onRoleReady === "function") {
        onRoleReady(payload.role);
      } else {
        window.pendingAuth = payload;
      }
    })
    .catch((error) => {
      loginError.textContent = error.message;
      signOut(auth);
    });
}

onAuthStateChanged(auth, handleAuthState); //esta función se llama automáticamente cada vez que cambia el estado de autenticación del usuario (por ejemplo, al iniciar sesión o cerrar sesión), lo que permite actualizar la interfaz de la aplicación en consecuencia y garantizar que solo los usuarios autenticados puedan acceder a las funcionalidades de la aplicación.

loginForm.addEventListener("submit", (event) => { //esta función se ejecuta cuando el usuario envía el formulario de inicio de sesión. Al enviar el formulario, se evita la acción predeterminada del formulario, se limpia cualquier mensaje de error anterior y se obtiene el correo electrónico y la contraseña ingresados por el usuario. Luego, se llama a la función signInWithEmailAndPassword para intentar iniciar sesión con las credenciales proporcionadas. Si ocurre un error durante el inicio de sesión (por ejemplo, credenciales incorrectas), se muestra el mensaje de error correspondiente en la interfaz, lo que permite al usuario entender qué salió mal y corregirlo para intentar iniciar sesión nuevamente.
  event.preventDefault();
  loginError.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  signInWithEmailAndPassword(auth, email, password).catch((error) => {
    loginError.textContent = error.message;
  });
});

btnLogout.addEventListener("click", () => { //esta función se ejecuta cuando el usuario hace clic en el botón de cerrar sesión. Al hacer clic, se llama a la función signOut para cerrar la sesión del usuario autenticado, lo que actualiza el estado de autenticación y muestra la pantalla de inicio de sesión nuevamente, garantizando que solo los usuarios autenticados puedan acceder a las funcionalidades de la aplicación.
  signOut(auth);
});