document.addEventListener("DOMContentLoaded", () => {
  // Función para actualizar el badge del carrito
  const updateCartBadge = () => {
    const cartBadge = document.getElementById("cartBadge");
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );
    cartBadge.textContent = totalQuantity;
  };

  // Llamar a la función al cargar la página
  updateCartBadge();

  // Mostrar/ocultar el dropdown del usuario
  const userIcon = document.getElementById("userIcon");
  const userDropdown = document.getElementById("userDropdown");
  userIcon?.addEventListener("click", () => {
    userDropdown?.classList.toggle("hidden");
  });

  // Redirigir al perfil
  document.getElementById("viewProfileBtn")?.addEventListener("click", () => {
    window.location.href = "profile.html";
  });

  // Cerrar sesión
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("Sesión cerrada");
    window.location.reload();
  });

  // Exponer la función updateCartBadge globalmente para que otros scripts la usen
  window.updateCartBadge = updateCartBadge;
});
