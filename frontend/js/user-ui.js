document.addEventListener("DOMContentLoaded", () => {
  const userIcon = document.getElementById("userIcon");
  const userDropdown = document.getElementById("userDropdown");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const viewProfileBtn = document.getElementById("viewProfileBtn");

  // Mostrar/ocultar menú
  userIcon.addEventListener("click", () => {
    userDropdown.classList.toggle("hidden");
  });

  // Verificar estado de sesión
  const token = localStorage.getItem("token");
  if (token) {
    loginBtn.classList.add("hidden");
    viewProfileBtn.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    loginBtn.classList.remove("hidden");
    viewProfileBtn.classList.add("hidden");
    logoutBtn.classList.add("hidden");
  }

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    loginBtn.classList.remove("hidden");
    viewProfileBtn.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    userDropdown.classList.add("hidden");

    // Redirigir si estás en profile.html
    if (window.location.pathname.includes("profile.html")) {
      window.location.href = "index.html";
    }
  });

  // Ir a login
  loginBtn.addEventListener("click", () => {
    window.location.href = "login.html";
  });
});
