document.addEventListener("DOMContentLoaded", () => {
  const partsGrid = document.getElementById("partsGrid");
  const searchInput = document.getElementById("searchInput");
  const quoteModal = document.getElementById("quoteModal");
  const closeQuoteModalBtn = document.getElementById("closeQuoteModalBtn");
  const quoteForm = document.getElementById("quoteForm");
  const sparePartIdField = document.getElementById("sparePartIdField");
  const fullNameField = document.getElementById("fullName");
  const phoneField = document.getElementById("phone");
  const emailField = document.getElementById("emailField");
  const quantityField = document.getElementById("quantity");
  const commentField = document.getElementById("commentField");

  if (!partsGrid) {
    console.error("Elemento #partsGrid no encontrado en el DOM.");
    return;
  }

  let allParts = [];

  // 1) Cargar todos los repuestos desde el backend
  async function loadParts() {
    try {
      const res = await fetch(
        "http://localhost/car_dealership/backend/spare_parts/get_spare_parts.php"
      );
      const data = await res.json();

      if (!data.success || !Array.isArray(data.spare_parts)) {
        throw new Error("Respuesta inválida del servidor");
      }

      allParts = data.spare_parts;
      renderParts(allParts);
    } catch (error) {
      console.error("Error al cargar repuestos:", error);
      partsGrid.innerHTML = `<p class="text-red-500 col-span-full text-center">Error al cargar los repuestos.</p>`;
    }
  }

  // 2) Generar las tarjetas con botón “Cotizar”
  function renderParts(parts) {
    partsGrid.innerHTML = "";

    if (parts.length === 0) {
      partsGrid.innerHTML = `<p class="text-gray-500 col-span-full text-center">No hay repuestos que coincidan.</p>`;
      return;
    }

    parts.forEach((part) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded shadow p-4 hover:shadow-lg transition";
      card.innerHTML = `
        <img src="${part.image_url}" alt="${
        part.name
      }" class="w-full h-40 object-contain mb-4 rounded" />
        <h3 class="text-lg font-semibold mb-1">${part.name}</h3>
        <p class="text-sm text-gray-500 mb-2">${part.category}</p>
        <p class="text-green-600 font-bold mb-2">Q${parseFloat(
          part.price
        ).toFixed(2)}</p>
        <button
          class="add-to-quote w-full bg-slate-950 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition duration-300"
          data-id="${part.id}"
        >
          Cotizar
        </button>
      `;
      partsGrid.appendChild(card);
    });

    // 3) Añadir evento de “click” a cada botón .add-to-quote
    document.querySelectorAll(".add-to-quote").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        // Guardar el spare_part_id en el campo oculto y mostrar el modal
        sparePartIdField.value = id;
        quoteModal.classList.remove("hidden");
      });
    });
  }

  // 4) Filtrar repuestos por búsqueda
  function applySearch() {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allParts.filter(
      (part) =>
        part.name.toLowerCase().includes(keyword) ||
        (part.category && part.category.toLowerCase().includes(keyword))
    );
    renderParts(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }

  // 5) Cerrar modal de cotización
  if (closeQuoteModalBtn) {
    closeQuoteModalBtn.addEventListener("click", () => {
      quoteModal.classList.add("hidden");
      quoteForm.reset();
    });
  }

  // 6) Enviar formulario de cotización (solo aquí, para evitar doble listener)
  if (quoteForm) {
    quoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Validar campos obligatorios
      if (
        !fullNameField.value.trim() ||
        !phoneField.value.trim() ||
        !emailField.value.trim() ||
        !quantityField.value.trim()
      ) {
        Toastify({
          text: "Por favor completa todos los campos obligatorios.",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: { background: "#F44336" },
        }).showToast();
        return;
      }

      // Construir payload
      const payload = {
        spare_part_id: parseInt(sparePartIdField.value, 10),
        full_name: fullNameField.value.trim(),
        phone: phoneField.value.trim(),
        email: emailField.value.trim(),
        quantity: parseInt(quantityField.value, 10),
        comment: commentField.value.trim(),
      };

      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          "http://localhost/car_dealership/backend/quotes/create_quote.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();

        if (data.success) {
          Toastify({
            text: "Cotización enviada correctamente.",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#4CAF50" },
          }).showToast();
          quoteModal.classList.add("hidden");
          quoteForm.reset();
        } else {
          throw new Error(data.message || "Error al crear cotización");
        }
      } catch (error) {
        console.error("Error al enviar cotización:", error);
        Toastify({
          text: "No se pudo enviar la cotización. Intenta de nuevo.",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: { background: "#F44336" },
        }).showToast();
      }
    });
  }

  // Iniciar el proceso
  loadParts();
});
