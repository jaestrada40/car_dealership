document.addEventListener("DOMContentLoaded", () => {
  // Actualizar el badge del carrito
  const cartBadge = document.getElementById("cartBadge");
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );
  cartBadge.textContent = totalQuantity;

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

  // Cerrar sesión (ejemplo simple)
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("Sesión cerrada");
    window.location.reload();
  });
});
