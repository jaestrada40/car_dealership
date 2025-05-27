const cartContainer = document.getElementById("cartContainer");
const totalContainer = document.getElementById("totalContainer");
const checkoutBtn = document.getElementById("checkoutBtn");

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartContainer.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML =
      '<p class="text-center text-gray-500">Tu carrito está vacío.</p>';
    totalContainer.textContent = "";
    checkoutBtn.classList.add("hidden");
    return;
  }

  checkoutBtn.classList.remove("hidden");

  cart.forEach((item, index) => {
    const itemTotal = item.quantity * parseFloat(item.price);
    total += itemTotal;

    const div = document.createElement("div");
    div.className =
      "bg-white p-6 rounded shadow flex items-center gap-6 w-full";

    div.innerHTML = `
      <img src="${item.image_url}" alt="${
      item.name
    }" class="w-32 h-32 object-contain rounded border" />
      <div class="flex-1">
        <h3 class="text-xl font-semibold">${item.name}</h3>
        <p class="text-gray-600 text-sm">${item.description || ""}</p>
        <p class="text-blue-600 font-bold mt-1">Q${parseFloat(
          item.price
        ).toFixed(2)}</p>
        <div class="mt-3 flex items-center gap-2">
          <button onclick="updateQuantity(${index}, -1)" class="px-2 bg-gray-300 rounded">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${index}, 1)" class="px-2 bg-gray-300 rounded">+</button>
          <button onclick="removeItem(${index})" class="ml-4 text-red-500 underline">Eliminar</button>
        </div>
      </div>
    `;

    cartContainer.appendChild(div);
  });

  totalContainer.textContent = `Total: Q${total.toFixed(2)}`;
}

function updateQuantity(index, change) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

checkoutBtn.addEventListener("click", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión o registrarte para continuar con el pago.");
    window.location.href = "login.html";
    return;
  }
  window.location.href = "checkout.html";
});

renderCart();
