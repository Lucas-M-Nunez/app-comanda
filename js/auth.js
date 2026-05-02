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

function showLogin() {
  loginScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");
}

function showApp() {
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
}

function setUserInfo(user, role) {
  currentUser = user;
  currentRole = role;
  userRoleLabel.textContent = `${user.email} • ${role}`;
}

function handleAuthState(user) {
  if (!user) {
    showLogin();
    return;
  }

  getUserProfile(user.uid)
    .then(doc => {
      if (!doc.exists) {
        loginError.textContent = "Usuario sin rol asignado. Configurá su perfil en Firestore.";
        auth.signOut();
        return;
      }

      const profile = doc.data();
      setUserInfo(user, profile.role || "Sin rol");
      showApp();

      const payload = { user, role: profile.role || "Sin rol" };
      if (typeof onRoleReady === "function") {
        onRoleReady(payload.role);
      } else {
        window.pendingAuth = payload;
      }
    })
    .catch(error => {
      loginError.textContent = error.message;
      auth.signOut();
    });
}

auth.onAuthStateChanged(handleAuthState);

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  loginError.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .catch(error => {
      loginError.textContent = error.message;
    });
});

btnLogout.addEventListener("click", () => {
  auth.signOut();
});
