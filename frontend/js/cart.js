document.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.getElementById("cartContainer");
  const totalContainer = document.getElementById("totalContainer");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const authModal = document.getElementById("authModal");
  const paymentModal = document.getElementById("paymentModal");
  const successModal = document.getElementById("successModal");
  const successContent = document.getElementById("successContent");

  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const paymentForm = document.getElementById("paymentForm");
  const cardFields = document.getElementById("cardFields");

  const cartBadge = document.getElementById("cartBadge");
  const userIcon = document.getElementById("userIcon");
  const userDropdown = document.getElementById("userDropdown");
  const viewProfileBtn = document.getElementById("viewProfileBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const renderCart = () => {
    cartContainer && (cartContainer.innerHTML = "");
    let total = 0;

    if (cart.length === 0) {
      if (cartContainer)
        cartContainer.innerHTML = `<p class="text-center text-gray-500">Tu carrito está vacío.</p>`;
      if (totalContainer) totalContainer.textContent = "";
    } else {
      cart.forEach((item, index) => {
        const price = parseFloat(item.price) || 0;
        total += price * item.quantity;

        if (cartContainer) {
          const div = document.createElement("div");
          div.className =
            "bg-white p-4 rounded shadow flex items-center justify-between";
          div.innerHTML = `
            <div class="flex items-center gap-4">
              <img src="${
                item.image_url || "https://via.placeholder.com/150"
              }" alt="${
            item.name
          }" class="w-32 h-32 object-contain rounded border" />
              <div>
                <h3 class="font-semibold">${item.name}</h3>
                <p class="text-sm text-gray-600">${item.description || ""}</p>
                <p class="text-blue-600 font-bold">Q${price.toFixed(2)}</p>
                <div class="flex items-center gap-2 mt-2">
                  <button class="bg-gray-200 px-2 rounded" onclick="updateQty(${index}, -1)">-</button>
                  <span>${item.quantity}</span>
                  <button class="bg-gray-200 px-2 rounded" onclick="updateQty(${index}, 1)">+</button>
                  <button class="text-red-600 ml-4" onclick="removeItem(${index})">Eliminar</button>
                </div>
              </div>
            </div>
          `;
          cartContainer.appendChild(div);
        }
      });
      if (totalContainer)
        totalContainer.textContent = `Total: Q${total.toFixed(2)}`;
    }
    if (cartBadge)
      cartBadge.textContent = cart.reduce((acc, i) => acc + i.quantity, 0);
  };

  window.updateQty = (index, delta) => {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  };

  window.removeItem = (index) => {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  };

  checkoutBtn?.addEventListener("click", () => {
    const token = localStorage.getItem("token");
    if (!token) authModal?.classList.remove("hidden");
    else paymentModal?.classList.remove("hidden");
  });

  loginTab?.addEventListener("click", () => {
    loginForm?.classList.remove("hidden");
    registerForm?.classList.add("hidden");
    loginTab.classList.add("border-blue-600", "font-bold");
    registerTab.classList.remove("border-blue-600", "font-bold");
  });

  registerTab?.addEventListener("click", () => {
    registerForm?.classList.remove("hidden");
    loginForm?.classList.add("hidden");
    registerTab.classList.add("border-blue-600", "font-bold");
    loginTab.classList.remove("border-blue-600", "font-bold");
  });

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = document.getElementById("loginIdentifier").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch(
      "http://localhost/car_dealership/backend/auth/login_user.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      }
    );

    const result = await response.json();
    if (result.success) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user || {}));
      authModal?.classList.add("hidden");
      location.reload();
    } else {
      alert(result.message || "Credenciales inválidas");
    }
  });

  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      first_name: document.getElementById("regFirstName").value,
      last_name: document.getElementById("regLastName").value,
      email: document.getElementById("regEmail").value,
      username: document.getElementById("regUsername").value,
      password: document.getElementById("regPassword").value,
      role: "client",
    };

    const token = localStorage.getItem("token") || "";

    const response = await fetch(
      "http://localhost/car_dealership/backend/users/create_user.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();
    if (result.success) {
      alert("Registro exitoso. Ahora inicia sesión para continuar.");
      registerTab.click();
    } else {
      alert(result.message || "Error al registrar");
    }
  });

  userIcon?.addEventListener("click", () => {
    const isOpen = userDropdown.classList.contains("hidden");
    userDropdown.classList.toggle("hidden", !isOpen);
  });

  viewProfileBtn?.addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      window.location.href = "profile.html";
    }
  });

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    location.reload();
  });

  document.querySelectorAll("input[name='payment_method']").forEach((input) => {
    input.addEventListener("change", (e) => {
      if (e.target.value === "tarjeta") cardFields.classList.remove("hidden");
      else cardFields.classList.add("hidden");
    });
  });

  renderCart();
});
