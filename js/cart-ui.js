document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1) Función para actualizar el badge del carrito
  // ==========================================
  const updateCartBadge = () => {
    const cartBadge = document.getElementById("cartBadge");
    if (cartBadge) {
      const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
      );
      cartBadge.textContent = totalQuantity;
    }
  };

  // Llamar a la función al cargar la página
  updateCartBadge();

  // Exponerla globalmente para que otros scripts (por ejemplo, parts.js) la usen
  window.updateCartBadge = updateCartBadge;

  // ==========================================
  // 2) Ajustar visibilidad inicial de botones de usuario
  // ==========================================
  // Nota: La asignación de eventos para el dropdown de usuario
  //       (clic en userIcon, etc.) se realiza en el bloque inline de index.html,
  //       por lo que aquí solo corregimos la visibilidad (display) de cada botón.

  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const viewProfileBtn = document.getElementById("viewProfileBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const token = localStorage.getItem("token");
  if (token) {
    // Si hay token, ocultamos Iniciar Sesión y Registrarse
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";

    // Mostramos Ir a Perfil / Cerrar Sesión
    if (viewProfileBtn) viewProfileBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "block";

    // Ajustar texto/href de viewProfileBtn según rol
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.role === "admin") {
      viewProfileBtn.textContent = "Ir al área de Admin";
      viewProfileBtn.href = "http://localhost/car_dealership/admin/index.html";
    } else {
      viewProfileBtn.textContent = "Ir a Perfil";
      viewProfileBtn.href = "profile.html";
    }
  } else {
    // Si no hay token, mostramos Iniciar Sesión y Registrarse
    if (loginBtn) loginBtn.style.display = "block";
    if (registerBtn) registerBtn.style.display = "block";

    // Ocultamos Ir a Perfil / Cerrar Sesión
    if (viewProfileBtn) viewProfileBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});
