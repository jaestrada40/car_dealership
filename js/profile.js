document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm");
  const ordersList = document.getElementById("ordersList");
  const changePasswordForm = document.getElementById("changePasswordForm");
  const pagination = document.getElementById("pagination");
  const profileLogoutBtn = document.getElementById("profileLogoutBtn");

  // Verificar sesión
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No hay token, redirigiendo a index.html");
    window.location.href = "index.html";
    return;
  }

  // Obtener userId desde localStorage
  let userId;
  try {
    const userData = JSON.parse(
      localStorage.getItem("userData") || localStorage.getItem("user") || "{}"
    );
    userId = userData.id;
    console.log("userId obtenido:", userId);
    if (!userId) {
      console.warn("No se encontró userId en localStorage");
      Toastify({
        text: "No se pudo obtener el ID del usuario",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ef4444",
      }).showToast();
    }
  } catch (error) {
    console.error("Error al parsear userData de localStorage:", error);
    Toastify({
      text: "Error al obtener datos del usuario",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "#ef4444",
    }).showToast();
  }

  // Cargar información del usuario
  async function loadUserProfile() {
    try {
      const response = await fetch(
        "http://localhost/car_dealership/backend/users/get_user.php",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log("Respuesta de get_user.php:", data);
      if (data.success) {
        const user = data.user;
        if (!userId && user.id) {
          userId = user.id;
          localStorage.setItem("userData", JSON.stringify(user));
        }
        document.getElementById("firstName").value = user.first_name || "";
        document.getElementById("lastName").value = user.last_name || "";
        document.getElementById("email").value = user.email || "";
        document.getElementById("username").value = user.username || "";
      } else {
        Toastify({
          text: data.message || "Error al cargar el perfil",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#ef4444",
        }).showToast();
      }
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
      Toastify({
        text: "Error de conexión al cargar el perfil",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ef4444",
      }).showToast();
    }
  }

  // Cargar historial de pedidos con paginación
  let currentPage = 1;
  const itemsPerPage = 10;
  let allOrders = [];

  async function loadOrders(page = 1) {
    currentPage = page;
    try {
      if (allOrders.length === 0) {
        const response = await fetch(
          "http://localhost/car_dealership/backend/orders/get_my_orders.php",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log("Respuesta de get_my_orders.php:", data);
        if (data.success && data.orders.length > 0) {
          allOrders = data.orders;
        } else {
          allOrders = [];
          ordersList.innerHTML = "<p>No hay pedidos registrados.</p>";
          pagination.innerHTML = "";
          return;
        }
      }

      const totalItems = allOrders.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedOrders = allOrders.slice(start, end);

      ordersList.innerHTML = paginatedOrders
        .map(
          (order) => `
            <div class="border-b py-4">
              <p class="font-semibold">Orden #${order.id}</p>
              <p>Total: Q${parseFloat(order.total || 0).toLocaleString()}</p>
              <p>Fecha: ${new Date(
                order.created_at || Date.now()
              ).toLocaleDateString()}</p>
              <p>Estado: ${order.status || "Sin estado"}</p>
              <p>Dirección: ${order.address || "Sin dirección"}</p>
              <p>Método de Pago: ${order.payment_method || "Sin método"}</p>
              <p class="mt-2">Productos:</p>
              <ul class="list-disc list-inside text-gray-600">
                ${order.items
                  .map(
                    (item) =>
                      `<li>${item.spare_name || "Sin nombre"} - Cantidad: ${
                        item.quantity || 0
                      } - Q${parseFloat(
                        (item.price_unit || 0) * (item.quantity || 0)
                      ).toLocaleString()}</li>`
                  )
                  .join("")}
              </ul>
            </div>
          `
        )
        .join("");

      pagination.innerHTML = `
        <button id="prevPage" class="px-3 py-1 bg-gray-300 rounded ${
          page === 1 ? "opacity-50 cursor-not-allowed" : ""
        }" ${page === 1 ? "disabled" : ""}>Anterior</button>
        <span class="px-3">Página ${page} de ${totalPages}</span>
        <button id="nextPage" class="px-3 py-1 bg-gray-300 rounded ${
          page === totalPages ? "opacity-50 cursor-not-allowed" : ""
        }" ${page === totalPages ? "disabled" : ""}>Siguiente</button>
      `;

      document.getElementById("prevPage").addEventListener("click", () => {
        if (page > 1) loadOrders(page - 1);
      });
      document.getElementById("nextPage").addEventListener("click", () => {
        if (page < totalPages) loadOrders(page + 1);
      });
    } catch (error) {
      console.error("Error al cargar los pedidos:", error);
      ordersList.innerHTML = "<p>Error al cargar los pedidos.</p>";
      pagination.innerHTML = "";
    }
  }

  // Manejar edición de perfil
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!userId) {
      Toastify({
        text: "No se pudo determinar el ID del usuario",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ef4444",
      }).showToast();
      return;
    }

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;

    try {
      const response = await fetch(
        "http://localhost/car_dealership/backend/users/update_user.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: userId,
            first_name: firstName,
            last_name: lastName,
            email: email,
          }),
        }
      );

      const rawResponse = await response.text();
      console.log("Respuesta cruda de update_user.php:", rawResponse);

      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (jsonError) {
        console.error("Error al parsear JSON:", jsonError);
        throw new Error("La respuesta del servidor no es JSON válido");
      }

      console.log("Respuesta parseada de update_user.php:", data);
      if (data.success) {
        const updatedUserData = {
          id: userId,
          first_name: firstName,
          last_name: lastName,
          email: email,
          username: document.getElementById("username").value,
        };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        Toastify({
          text: "Perfil actualizado exitosamente",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#22c55e",
        }).showToast();
        loadUserProfile();
      } else {
        Toastify({
          text: data.message || "Error al actualizar el perfil",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#ef4444",
        }).showToast();
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      Toastify({
        text: "Error de conexión o respuesta inválida",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ef4444",
      }).showToast();
    }
  });

  // Manejar cambio de contraseña
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      Toastify({
        text: "Las contraseñas no coinciden",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ef4444",
      }).showToast();
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/car_dealership/backend/users/update_password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ new_password: newPassword }),
        }
      );
      const rawResponse = await response.text();
      console.log("Respuesta cruda de update_password.php:", rawResponse);

      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (jsonError) {
        console.error("Error al parsear JSON:", jsonError);
        throw new Error("La respuesta del servidor no es JSON válido");
      }

      console.log("Respuesta parseada de update_password.php:", data);
      if (data.success) {
        Toastify({
          text: "Contraseña actualizada exitosamente",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#22c55e",
        }).showToast();
        changePasswordForm.reset();
      } else {
        Toastify({
          text: data.message || "Error al actualizar la contraseña",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#ef4444",
        }).showToast();
      }
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
      Toastify({
        text: "Error de conexión o respuesta inválida",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ef4444",
      }).showToast();
    }
  });

  // Manejar cierre de sesión desde el botón en el perfil
  profileLogoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.location.href = "index.html";
  });

  // Toggle visibilidad de contraseñas
  const togglePassword = (toggleId, inputId) => {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    toggle.addEventListener("click", () => {
      const type =
        input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);
      toggle.innerHTML =
        type === "password"
          ? `<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`
          : `<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>`;
    });
  };

  togglePassword("toggleNewPassword", "newPassword");
  togglePassword("toggleConfirmPassword", "confirmPassword");

  // Cargar datos al iniciar
  console.log("Iniciando carga de datos...");
  loadUserProfile();
  loadOrders();
});
