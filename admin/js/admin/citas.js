// admin/js/admin/citas.js

// --- 1) Variables globales para almacenar citas en memoria ---
let cachedAppointments = [];

/**
 * Función para formatear fechas/hora.
 * Ajusta según tus necesidades de presentación.
 */
function formatDateTime(datetimeString) {
  const dt = new Date(datetimeString);
  // Ejemplo: "2025-06-03 14:30:00"
  const date = dt.toISOString().split("T")[0];
  const time = dt.toTimeString().split(" ")[0];
  return { date, time };
}

// --- 2) Cargar todas las citas (solo para admins) ---
const loadAppointments = async () => {
  try {
    console.log(
      "Cargando citas desde backend/appointments/get_appointments.php..."
    );
    const data = await apiFetch("/appointments/get_appointments.php");

    if (!data.success) {
      console.error("Error al cargar citas:", data.message);
      const tbody = document.getElementById("appointmentsTableBody");
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="14" class="text-center text-red-500">
              ${data.message || "Error al cargar citas."}
            </td>
          </tr>`;
      }
      return;
    }

    // Guardamos en memoria para luego buscar por ID
    cachedAppointments = data.appointments || [];

    // Referencia al <tbody> donde mostraremos las filas
    const appointmentsTableBody = document.getElementById(
      "appointmentsTableBody"
    );
    appointmentsTableBody.innerHTML = "";

    if (cachedAppointments.length === 0) {
      appointmentsTableBody.innerHTML = `
        <tr>
          <td colspan="14" class="text-center text-gray-600">
            No hay citas registradas.
          </td>
        </tr>`;
      return;
    }

    // Por cada cita, creamos una fila
    cachedAppointments.forEach((appt) => {
      const { date: createdDate, time: createdTime } = formatDateTime(
        appt.created_at
      );
      const { date, time } = { date: appt.date, time: appt.time };
      const imgHTML = appt.image_url
        ? `<img src="${appt.image_url}" alt="Auto" class="h-10 w-16 object-cover rounded-md">`
        : "–";

      const row = document.createElement("tr");
      row.classList.add("hover:bg-gray-50");

      row.innerHTML = `
        <td class="px-4 py-2 border-b">${appt.id}</td>
        <td class="px-4 py-2 border-b">${appt.brand_name || "–"}</td>
        <td class="px-4 py-2 border-b">${appt.model || "–"}</td>
        <td class="px-4 py-2 border-b">${appt.year || "–"}</td>
        <td class="px-4 py-2 border-b">${imgHTML}</td>
        <td class="px-4 py-2 border-b">${appt.full_name}</td>
        <td class="px-4 py-2 border-b">${appt.phone}</td>
        <td class="px-4 py-2 border-b">${appt.email}</td>
        <td class="px-4 py-2 border-b">${date}</td>
        <td class="px-4 py-2 border-b">${time}</td>
        <td class="px-4 py-2 border-b">${appt.comment || "–"}</td>
        <td class="px-4 py-2 border-b capitalize">${appt.status}</td>
        <td class="px-4 py-2 border-b">${createdDate} ${createdTime}</td>
        <td class="px-4 py-2 border-b">
          <button 
            class="editAppointmentBtn bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            data-id="${appt.id}"
          >
            Editar
          </button>
          <button 
            class="deleteAppointmentBtn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2"
            data-id="${appt.id}"
          >
            Eliminar
          </button>
        </td>
      `;

      appointmentsTableBody.appendChild(row);
    });

    // Finalmente asignamos listeners a los botones recién creados
    attachAppointmentEventListeners();
  } catch (error) {
    console.error("Error en loadAppointments:", error);
    const appointmentsTableBody = document.getElementById(
      "appointmentsTableBody"
    );
    if (appointmentsTableBody) {
      appointmentsTableBody.innerHTML = `
        <tr>
          <td colspan="14" class="text-center text-red-500">
            Error al cargar citas: ${error.message}
          </td>
        </tr>`;
    }
  }
};

// --- 3) Asignar eventos a Editar y Eliminar de cada fila ---
const attachAppointmentEventListeners = () => {
  // Botones “Editar”
  document.querySelectorAll(".editAppointmentBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const apptId = btn.dataset.id;
      openAppointmentModal(apptId);
    });
  });

  // Botones “Eliminar”
  document.querySelectorAll(".deleteAppointmentBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const apptId = btn.dataset.id;
      confirmDeleteAppointment(apptId);
    });
  });
};

// --- 4) Abrir modal “Editar Cita” y rellenar campos ---
function openAppointmentModal(apptId) {
  const modal = document.getElementById("appointmentModal");
  const appointment = cachedAppointments.find(
    (a) => a.id === parseInt(apptId, 10)
  );

  if (!appointment) {
    showToast("Cita no encontrada", "error");
    return;
  }

  // Rellenar campos del formulario
  document.getElementById("appointmentId").value = appointment.id;
  document.getElementById("appointmentBrand").value = appointment.brand_name;
  document.getElementById("appointmentModel").value = appointment.model;
  document.getElementById("appointmentYear").value = appointment.year;
  document.getElementById("appointmentImagePreview").src =
    appointment.image_url || "";
  document.getElementById("appointmentFullName").value = appointment.full_name;
  document.getElementById("appointmentPhone").value = appointment.phone;
  document.getElementById("appointmentEmail").value = appointment.email;
  document.getElementById("appointmentDate").value = appointment.date;
  document.getElementById("appointmentTime").value = appointment.time;
  document.getElementById("appointmentComment").value =
    appointment.comment || "";
  document.getElementById("appointmentStatus").value = appointment.status;
  document.getElementById("appointmentCreatedAt").value = new Date(
    appointment.created_at
  ).toLocaleString();

  // Mostrar el modal
  modal.classList.remove("hidden");
}

// --- 5) Confirmar y eliminar cita ---
function confirmDeleteAppointment(apptId) {
  const modal = document.getElementById("deleteConfirmModal");
  modal.classList.remove("hidden");

  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");

  confirmBtn.onclick = async () => {
    try {
      console.log("Eliminando cita ID:", apptId);
      const response = await apiFetch(
        "/appointments/delete_appointment.php",
        "DELETE",
        { id: apptId }
      );

      if (!response.success) {
        throw new Error(response.message || "Error al eliminar cita");
      }

      showToast("Cita eliminada con éxito", "success");
      modal.classList.add("hidden");
      loadAppointments();
    } catch (error) {
      console.error("Error en confirmDeleteAppointment:", error);
      showToast("Error al eliminar cita: " + error.message, "error");
    }
  };

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
  };
}

// --- 6) Manejar envío del formulario “Editar Cita” ---
async function handleAppointmentFormSubmit(event) {
  event.preventDefault();
  const apptId = document.getElementById("appointmentId").value;
  const status = document.getElementById("appointmentStatus").value;

  try {
    console.log(`Actualizando cita ID: ${apptId}, Estado: ${status}`);
    // Nota: Apunta al archivo PHP correcto
    const response = await apiFetch(
      "/appointments/update_appointment_status.php",
      "PUT",
      {
        id: apptId,
        status: status,
      }
    );

    if (!response.success) {
      throw new Error(response.message || "Error al actualizar cita");
    }

    showToast("Cita actualizada con éxito", "success");
    document.getElementById("appointmentModal").classList.add("hidden");
    loadAppointments();
  } catch (error) {
    console.error("Error en handleAppointmentFormSubmit:", error);
    showToast("Error al actualizar cita: " + error.message, "error");
  }
}

// --- 7) Configurar el formulario al cargar la página ---
function setupAppointmentForm() {
  console.log("Configurando formulario de cita...");
  const form = document.getElementById("appointmentForm");
  const closeBtn = document.getElementById("closeAppointmentModalBtn");

  if (form) {
    form.addEventListener("submit", handleAppointmentFormSubmit);
  } else {
    console.error("Formulario de cita no encontrado");
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("appointmentModal").classList.add("hidden");
    });
  } else {
    console.error("Botón de cerrar modal de cita no encontrado");
  }
}

// --- 8) Exponer funciones globalmente para que main.js pueda llamarlas ---
window.loadAppointments = loadAppointments;
window.setupAppointmentForm = setupAppointmentForm;
