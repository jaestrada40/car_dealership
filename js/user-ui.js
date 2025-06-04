document.addEventListener("DOMContentLoaded", () => {
  console.log("user-ui.js cargado correctamente");

  const authModal = document.getElementById("authModal");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const submitLoginBtn = document.getElementById("submitLoginBtn");
  const submitRegisterBtn = document.getElementById("submitRegisterBtn");

  if (
    !authModal ||
    !loginForm ||
    !registerForm ||
    !closeModalBtn ||
    !submitLoginBtn ||
    !submitRegisterBtn
  ) {
    console.log(
      "Algunos elementos de autenticación no se encontraron; este script puede no ser necesario en esta página."
    );
    return;
  }

  closeModalBtn.addEventListener("click", () => {
    authModal.style.display = "none";
  });

  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) {
      authModal.style.display = "none";
    }
  });

  submitLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const identifier = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!identifier || !password) {
      Toastify({
        text: "Por favor, completa todos los campos",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "#F44336" },
      }).showToast();
      return;
    }

    fetch("http://localhost/car_dealership/backend/auth/login_user.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          authModal.style.display = "none";
          Toastify({
            text: "Inicio de sesión exitoso",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#4CAF50" },
          }).showToast();
          setTimeout(() => window.location.reload(), 1000);
        } else {
          Toastify({
            text: data.message || "Error al iniciar sesión",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#F44336" },
          }).showToast();
        }
      })
      .catch(() => {
        Toastify({
          text: "Error de conexión con el servidor",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: { background: "#F44336" },
        }).showToast();
      });
  });

  submitRegisterBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const firstName = document.getElementById("regFirstName").value;
    const lastName = document.getElementById("regLastName").value;
    const email = document.getElementById("regEmail").value;
    const username = document.getElementById("regUsername").value;
    const password = document.getElementById("regPassword").value;

    if (!firstName || !lastName || !email || !username || !password) {
      Toastify({
        text: "Por favor, completa todos los campos",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "#F44336" },
      }).showToast();
      return;
    }

    fetch("http://localhost/car_dealership/backend/users/create_user.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          authModal.style.display = "none";
          Toastify({
            text: "Registro exitoso",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#4CAF50" },
          }).showToast();
          setTimeout(() => window.location.reload(), 1000);
        } else {
          Toastify({
            text: data.message || "Error al registrarse",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#F44336" },
          }).showToast();
        }
      })
      .catch(() => {
        Toastify({
          text: "Error de conexión con el servidor",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: { background: "#F44336" },
        }).showToast();
      });
  });
});
