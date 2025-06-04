document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const cartContainer = document.getElementById("cartContainer");
  const cartTotalElement = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const authModal = document.getElementById("authModal");
  const paymentModal = document.getElementById("paymentModal");
  const successModal = document.getElementById("successModal");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const paymentForm = document.getElementById("paymentForm");
  const transferFields = document.getElementById("transferFields");
  const cardFields = document.getElementById("cardFields");
  const closeAuthModal = document.getElementById("closeAuthModal");
  const closePaymentModal = document.getElementById("closePaymentModal");
  const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
  const paymentSpinner = document.getElementById("paymentSpinner");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  // Inicializar Stripe
  const stripe = Stripe(
    "pk_test_51RTvMzD6EgcFJ87xmyhLynYXW9dpKLJFf9MoDNhTb5uhBZoLxgbPvS4svLwwZLhtoVDKZLrQNVRaDffCvqGcGWCH00laYioV7j"
  ); // Reemplaza con tu clave pública de Stripe
  const elements = stripe.elements();

  // Estilo base para los elementos de Stripe
  const style = {
    base: {
      fontSize: "16px",
      color: "#32325d",
      fontFamily: '"Inter", sans-serif',
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  };

  // Crear elementos individuales de Stripe
  const cardNumber = elements.create("cardNumber", { style });
  const cardExpiry = elements.create("cardExpiry", { style });
  const cardCvc = elements.create("cardCvc", { style });

  // Montar los elementos en el DOM
  cardNumber.mount("#card-number-element");
  cardExpiry.mount("#card-expiry-element");
  cardCvc.mount("#card-cvc-element");

  // Manejar errores en tiempo real para cada elemento
  const errorElements = {
    cardNumber: document.getElementById("card-number-errors"),
    cardExpiry: document.getElementById("card-expiry-errors"),
    cardCvc: document.getElementById("card-cvc-errors"),
  };

  cardNumber.on("change", (event) => {
    errorElements.cardNumber.textContent = event.error
      ? event.error.message
      : "";
  });

  cardExpiry.on("change", (event) => {
    errorElements.cardExpiry.textContent = event.error
      ? event.error.message
      : "";
  });

  cardCvc.on("change", (event) => {
    errorElements.cardCvc.textContent = event.error ? event.error.message : "";
  });

  // Control del menú móvil
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Cargar ítems del carrito desde localStorage
  let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

  // Depuración inicial
  console.log("Ítems cargados desde localStorage:", cartItems);

  // Función para renderizar los ítems del carrito
  function renderCart() {
    cartContainer.innerHTML = "";
    if (cartItems.length === 0) {
      cartContainer.innerHTML = `
        <div class="text-center text-gray-500 py-10">
          <p>Tu carrito está vacío.</p>
          <a href="all_parts.html" class="text-green-600 hover:underline">Explora repuestos</a>
        </div>
      `;
      updateTotal();
      return;
    }

    cartItems.forEach((item, index) => {
      const cartItem = document.createElement("div");
      cartItem.className =
        "flex items-center justify-between bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow duration-200";
      cartItem.innerHTML = `
        <div class="flex items-center gap-4">
          <img
            src="${item.image_url || "https://via.placeholder.com/80"}"
            alt="${item.name}"
            class="w-20 h-20 object-contain rounded"
          />
          <div>
            <h3 class="text-lg font-semibold text-gray-800">${item.name}</h3>
            <p class="text-sm text-gray-600">Precio: Q${parseFloat(
              item.price
            ).toLocaleString()}</p>
            <div class="flex items-center gap-2 mt-2">
              <button class="decreaseQty text-gray-500 hover:text-gray-700" data-index="${index}">-</button>
              <span class="text-gray-800">${item.quantity}</span>
              <button class="increaseQty text-gray-500 hover:text-gray-700" data-index="${index}">+</button>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <p class="text-lg font-semibold text-gray-800">Q${(
            item.price * item.quantity
          ).toLocaleString()}</p>
          <button class="removeItem text-red-500 hover:text-red-700" data-index="${index}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      `;
      cartContainer.appendChild(cartItem);
    });

    // Añadir eventos a los botones de aumentar/disminuir/eliminar
    document.querySelectorAll(".increaseQty").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        cartItems[index].quantity += 1;
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        renderCart();
      });
    });

    document.querySelectorAll(".decreaseQty").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        if (cartItems[index].quantity > 1) {
          cartItems[index].quantity -= 1;
        } else {
          cartItems.splice(index, 1);
        }
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        renderCart();
      });
    });

    document.querySelectorAll(".removeItem").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        cartItems.splice(index, 1);
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        localStorage.setItem("cartCount", cartItems.length);
        renderCart();
      });
    });

    updateTotal();
  }

  // Actualizar el total del carrito
  function updateTotal() {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    cartTotalElement.textContent = `Q${total.toLocaleString()}`;
    localStorage.setItem("cartCount", cartItems.length);
  }

  // Mostrar ítems al cargar la página
  renderCart();

  // Manejar el clic en "Procesar Pago"
  checkoutBtn.addEventListener("click", () => {
    const token = localStorage.getItem("token");
    if (!token) {
      authModal.classList.remove("hidden");
    } else if (cartItems.length === 0) {
      Toastify({
        text: "Tu carrito está vacío",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ef4444",
      }).showToast();
    } else {
      paymentModal.classList.remove("hidden");
    }
  });

  // Alternar entre login y registro
  loginTab.addEventListener("click", () => {
    loginTab.classList.add("border-b-2", "border-green-600", "text-gray-700");
    registerTab.classList.remove(
      "border-b-2",
      "border-purple-600",
      "text-gray-700"
    );
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  });

  registerTab.addEventListener("click", () => {
    registerTab.classList.add(
      "border-b-2",
      "border-purple-600",
      "text-gray-700"
    );
    loginTab.classList.remove("border-b-2", "border-green-600", "text-gray-700");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });

  // Cerrar modal de autenticación
  closeAuthModal.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    authModal.classList.add("hidden");
  });

  // Cerrar modal de pago
  closePaymentModal.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    paymentModal.classList.add("hidden");
  });

  // Login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const identifier = document.getElementById("loginIdentifier").value;
    const password = document.getElementById("loginPassword").value;

    fetch("http://localhost/car_dealership/backend/auth/login_user.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          authModal.classList.add("hidden");
          paymentModal.classList.remove("hidden");
          Toastify({
            text: "Inicio de sesión exitoso",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#22c55e",
          }).showToast();
        } else {
          Toastify({
            text: data.message || "Error al iniciar sesión",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#ef4444",
          }).showToast();
        }
      })
      .catch(() => {
        Toastify({
          text: "Error de conexión con el servidor",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#ef4444",
        }).showToast();
      });
  });

  // Registro
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const firstName = document.getElementById("regFirstName").value;
    const lastName = document.getElementById("regLastName").value;
    const email = document.getElementById("regEmail").value;
    const username = document.getElementById("regUsername").value;
    const password = document.getElementById("regPassword").value;

    fetch("http://localhost/car_dealership/backend/users/create_user.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName, email, username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          authModal.classList.add("hidden");
          paymentModal.classList.remove("hidden");
          Toastify({
            text: "Registro exitoso",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#22c55e",
          }).showToast();
        } else {
          Toastify({
            text: data.message || "Error al registrarse",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#ef4444",
          }).showToast();
        }
      })
      .catch(() => {
        Toastify({
          text: "Error de conexión con el servidor",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#ef4444",
        }).showToast();
      });
  });

  // Mostrar campos según el método de pago
  document.querySelectorAll('input[name="payment_method"]').forEach((input) => {
    input.addEventListener("change", () => {
      transferFields.classList.toggle(
        "hidden",
        input.value !== "transferencia"
      );
      cardFields.classList.toggle("hidden", input.value !== "tarjeta");
    });
  });

  // Procesar el pago
  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const address = document.getElementById("address").value;
    const paymentMethod = document.querySelector(
      'input[name="payment_method"]:checked'
    ).value;

    if (!address) {
      Toastify({
        text: "Por favor, ingresa una dirección de envío",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ef4444",
      }).showToast();
      return;
    }

    // Mostrar spinner y deshabilitar botón
    confirmPaymentBtn.disabled = true;
    paymentSpinner.classList.remove("hidden");

    // Preparar datos del pedido
    const order = {
      payment_method: paymentMethod,
      address: address,
      items: cartItems.map((item) => ({
        spare_part_id: item.id,
        quantity: item.quantity,
        price_unit: item.price,
      })),
    };

    // Manejar el pago según el método seleccionado
    if (paymentMethod === "tarjeta") {
      // Crear un token con Stripe usando cardNumber
      const { error, token } = await stripe.createToken(cardNumber);

      if (error) {
        errorElements.cardNumber.textContent = error.message;
        confirmPaymentBtn.disabled = false;
        paymentSpinner.classList.add("hidden");
        return;
      }

      // Añadir el token de Stripe al pedido
      order.stripeToken = token.id;
    }

    // Registrar el pedido
    try {
      const response = await fetch(
        "http://localhost/car_dealership/backend/orders/create_order.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(order),
        }
      );

      const data = await response.json();
      if (data.success) {
        paymentModal.classList.add("hidden");
        const orderSummary = document.getElementById("orderSummary");
        const orderIdElement = document.getElementById("orderId");
        const orderTotalElement = document.getElementById("orderTotal");
        const orderAddressElement = document.getElementById("orderAddress");
        const orderPaymentMethodElement =
          document.getElementById("orderPaymentMethod");
        const orderItemsElement = document.getElementById("orderItems");
        const total = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        orderIdElement.textContent = data.order_id;
        orderTotalElement.textContent = `Q${total.toLocaleString()}`;
        orderAddressElement.textContent = order.address;
        orderPaymentMethodElement.textContent = order.payment_method;
        orderItemsElement.innerHTML = cartItems
          .map(
            (item) =>
              `<li>${item.name} - Cantidad: ${item.quantity} - Q${(
                item.price * item.quantity
              ).toLocaleString()}</li>`
          )
          .join("");
        successModal.classList.remove("hidden");

        // Limpiar el carrito
        cartItems = [];
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        localStorage.setItem("cartCount", "0");
        renderCart();

        Toastify({
          text:
            paymentMethod === "transferencia"
              ? "Pedido registrado. Por favor realiza la transferencia para procesar tu compra."
              : "Pago procesado exitosamente.",
          duration: 5000,
          gravity: "top",
          position: "right",
          backgroundColor: "#22c55e",
        }).showToast();
      } else {
        throw new Error(data.message || "Error al registrar el pedido");
      }
    } catch (error) {
      Toastify({
        text: error.message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ef4444",
      }).showToast();
    } finally {
      confirmPaymentBtn.disabled = false;
      paymentSpinner.classList.add("hidden");
    }
  });
});
