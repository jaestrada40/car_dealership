// admin/js/admin/cotizaciones.js

// --- 1) Variables globales para almacenar cotizaciones en memoria ---
let cachedQuotes = [];

// --- 2) Cargar todas las cotizaciones (solo para admins) ---
const loadQuotes = async () => {
  try {
    console.log(
      "Cargando cotizaciones desde backend/quotes/get_all_quotes_admin.php..."
    );
    const data = await apiFetch("/quotes/get_all_quotes_admin.php");

    if (!data.success) {
      console.error("Error al cargar cotizaciones:", data.message);
      const tbody = document.getElementById("quotesTableBody");
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" class="text-center text-red-500">
              ${data.message || "Error al cargar cotizaciones."}
            </td>
          </tr>`;
      }
      return;
    }

    cachedQuotes = data.quotes || [];
    const quotesTableBody = document.getElementById("quotesTableBody");
    quotesTableBody.innerHTML = "";

    if (cachedQuotes.length === 0) {
      quotesTableBody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center text-gray-600">
            No hay cotizaciones registradas.
          </td>
        </tr>`;
      return;
    }

    cachedQuotes.forEach((quote) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-4 py-2 border-b">${quote.id}</td>
        <td class="px-4 py-2 border-b">${quote.spare_part_name || "–"}</td>
        <td class="px-4 py-2 border-b">${quote.full_name}</td>
        <td class="px-4 py-2 border-b">${quote.phone}</td>
        <td class="px-4 py-2 border-b">${quote.email}</td>
        <td class="px-4 py-2 border-b">${quote.quantity}</td>
        <td class="px-4 py-2 border-b">${quote.comment || "–"}</td>
        <td class="px-4 py-2 border-b capitalize">${quote.status}</td>
        <td class="px-4 py-2 border-b">${new Date(
          quote.created_at
        ).toLocaleString()}</td>
        <td class="px-4 py-2 border-b">
          <button 
            class="editQuoteBtn bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            data-id="${quote.id}"
          >
            Editar
          </button>
          <button 
            class="deleteQuoteBtn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2"
            data-id="${quote.id}"
          >
            Eliminar
          </button>
        </td>
      `;
      quotesTableBody.appendChild(row);
    });

    attachQuoteEventListeners();
  } catch (error) {
    console.error("Error en loadQuotes:", error);
    const quotesTableBody = document.getElementById("quotesTableBody");
    if (quotesTableBody) {
      quotesTableBody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center text-red-500">
            Error al cargar cotizaciones: ${error.message}
          </td>
        </tr>`;
    }
  }
};

// --- 3) Asignar eventos a Editar y Eliminar en cada fila ---
const attachQuoteEventListeners = () => {
  document.querySelectorAll(".editQuoteBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const quoteId = btn.dataset.id;
      openQuoteModal(quoteId);
    });
  });

  document.querySelectorAll(".deleteQuoteBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const quoteId = btn.dataset.id;
      confirmDeleteQuote(quoteId);
    });
  });
};

// --- 4) Cargar listado de repuestos en el select del modal ---
async function loadSparePartsDropdown() {
  try {
    console.log("Cargando repuestos desde /spare_parts/get_spare_parts.php...");
    const response = await apiFetch("/spare_parts/get_spare_parts.php");
    if (!response.success)
      throw new Error(response.message || "Error al cargar repuestos");

    const spareParts = response.spare_parts || [];
    const select = document.getElementById("quoteSparePartId");
    select.innerHTML = `<option value="">Seleccione un repuesto</option>`;

    spareParts.forEach((part) => {
      const option = document.createElement("option");
      option.value = part.id;
      option.textContent = part.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error en loadSparePartsDropdown:", error);
    // Aquí usamos showToast que ya existe en utils.js
    showToast("Error al cargar repuestos: " + error.message, "error");
  }
}

// --- 5) Abrir modal “Editar Cotización” y rellenar campos ---
function openQuoteModal(quoteId) {
  const modal = document.getElementById("quoteModal");
  // 5.1) Cargar repuestos en el dropdown
  loadSparePartsDropdown();

  // 5.2) Buscar en caché
  const quote = cachedQuotes.find((q) => q.id === parseInt(quoteId));
  if (!quote) {
    showToast("Cotización no encontrada", "error");
    return;
  }

  // 5.3) Rellenar campos del formulario
  document.getElementById("quoteId").value = quote.id;
  document.getElementById("quoteSparePartId").value = quote.spare_part_id;
  document.getElementById("quoteFullName").value = quote.full_name;
  document.getElementById("quotePhone").value = quote.phone;
  document.getElementById("quoteEmail").value = quote.email;
  document.getElementById("quoteQuantity").value = quote.quantity;
  document.getElementById("quoteComment").value = quote.comment || "";
  document.getElementById("quoteStatus").value = quote.status;
  document.getElementById("quoteCreatedAt").value = new Date(
    quote.created_at
  ).toLocaleString();

  // 5.4) Mostrar el modal
  modal.classList.remove("hidden");
}

// --- 6) Confirmar y eliminar cotización ---
function confirmDeleteQuote(quoteId) {
  const modal = document.getElementById("deleteConfirmModal");
  modal.classList.remove("hidden");

  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");

  confirmBtn.onclick = async () => {
    try {
      console.log("Eliminando cotización ID:", quoteId);
      const response = await apiFetch(
        `/quotes/delete_quote.php?id=${quoteId}`,
        "DELETE"
      );
      if (!response.success)
        throw new Error(response.message || "Error al eliminar cotización");

      showToast("Cotización eliminada con éxito", "success");
      modal.classList.add("hidden");
      loadQuotes();
    } catch (error) {
      console.error("Error en confirmDeleteQuote:", error);
      showToast("Error al eliminar cotización: " + error.message, "error");
    }
  };

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
  };
}

// --- 7) Manejar envío del formulario “Editar Cotización” ---
async function handleQuoteFormSubmit(event) {
  event.preventDefault();
  const quoteId = document.getElementById("quoteId").value;
  const status = document.getElementById("quoteStatus").value;

  try {
    console.log(`Actualizando cotización ID: ${quoteId}, Estado: ${status}`);
    const response = await apiFetch("/quotes/update_quote.php", "PUT", {
      id: quoteId,
      status: status,
    });

    if (!response.success)
      throw new Error(response.message || "Error al actualizar cotización");

    showToast("Cotización actualizada con éxito", "success");
    document.getElementById("quoteModal").classList.add("hidden");
    loadQuotes();
  } catch (error) {
    console.error("Error en handleQuoteFormSubmit:", error);
    showToast("Error al actualizar cotización: " + error.message, "error");
  }
}

// --- 8) Configurar el formulario al cargar la página ---
function setupQuoteForm() {
  console.log("Configurando formulario de cotización...");
  const form = document.getElementById("quoteForm");
  const closeBtn = document.getElementById("closeQuoteModalBtn");

  if (form) {
    form.addEventListener("submit", handleQuoteFormSubmit);
  } else {
    console.error("Formulario de cotización no encontrado");
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("quoteModal").classList.add("hidden");
    });
  } else {
    console.error("Botón de cerrar modal de cotización no encontrado");
  }
}

// --- 9) Exponer funciones globalmente para que main.js pueda llamarlas ---
window.loadQuotes = loadQuotes;
window.setupQuoteForm = setupQuoteForm;
