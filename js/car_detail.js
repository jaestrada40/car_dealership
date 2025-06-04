// js/car_detail.js

document.addEventListener("DOMContentLoaded", async () => {
  const carDetail = document.getElementById("carDetail");
  const params = new URLSearchParams(window.location.search);
  const carId = params.get("id");

  if (!carId) {
    carDetail.innerHTML =
      "<p class='text-red-500 text-center'>ID de auto no especificado.</p>";
    return;
  }

  try {
    // 1) Obtener detalles del vehículo
    const response = await fetch(
      `http://localhost/car_dealership/backend/cars/get_car.php?id=${carId}`
    );
    const data = await response.json();

    if (!data.success || !data.car) {
      carDetail.innerHTML =
        "<p class='text-center text-gray-500'>Auto no encontrado.</p>";
      return;
    }

    const car = data.car;
    carDetail.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <img
          src="${car.image_url}"
          alt="${car.model}"
          class="w-full rounded-lg shadow"
        />
        <div>
          <h2 class="text-2xl font-bold mb-2">
            ${car.brand_name} ${car.model}
          </h2>
          <p class="text-gray-600 mb-1">Año: ${car.year}</p>
          <p class="text-gray-600 mb-1">Color: ${car.color}</p>
          <p class="text-gray-600 mb-1">Transmisión: ${car.transmission}</p>
          <p class="text-gray-600 mb-1">Combustible: ${car.fuel_type}</p>
          <p class="text-gray-600 mb-1">Kilometraje: ${car.mileage} km</p>
          <p class="text-green-600 text-xl font-semibold mt-4">
            Q${parseFloat(car.price).toLocaleString()}
          </p>
          <p class="mt-4 text-gray-700">
            ${car.description || "Sin descripción."}
          </p>

          <button
            id="appointmentBtn"
            class="mt-6 w-full bg-slate-950 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition duration-300"
          >
            Agendar Cita
          </button>
        </div>
      </div>

      <!-- Modal de cita -->
      <div
        id="appointmentModal"
        class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 max-w-lg w-full">
          <h3 class="text-xl font-semibold mb-4">
            Agendar Cita para ${car.brand_name} ${car.model}
          </h3>
          <form id="appointmentForm" class="space-y-3">
            <input
              type="text"
              id="fullName"
              placeholder="Nombre completo"
              class="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              id="phone"
              placeholder="Teléfono"
              class="w-full border px-3 py-2 rounded"
              required
            />
            <!-- Cambiamos el id a "apptEmail" para no chocar con el modal de login -->
            <input
              type="email"
              id="apptEmail"
              placeholder="Correo electrónico"
              class="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="date"
              id="date"
              class="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="time"
              id="time"
              class="w-full border px-3 py-2 rounded"
              required
            />
            <textarea
              id="comment"
              placeholder="Comentario (opcional)"
              class="w-full border px-3 py-2 rounded"
            ></textarea>
            <div class="flex justify-end gap-4 mt-4">
              <button
                type="button"
                id="cancelAppointmentBtn"
                class="text-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Mensaje de confirmación -->
      <div
        id="confirmationMessage"
        class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white p-6 rounded shadow-lg text-center">
          <h4 class="text-green-700 font-bold text-xl mb-2">
            ¡Cita agendada!
          </h4>
          <p class="text-gray-700 mb-4">
            Te hemos enviado un correo de confirmación con los detalles.
          </p>
          <button
            id="closeConfirmation"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    `;

    // 1) Mostrar modal de cita
    document.getElementById("appointmentBtn").addEventListener("click", () => {
      document.getElementById("appointmentModal").classList.remove("hidden");
    });

    // 2) Cancelar cita (cerrar modal)
    document
      .getElementById("cancelAppointmentBtn")
      .addEventListener("click", () => {
        document.getElementById("appointmentModal").classList.add("hidden");
      });

    // 3) Cerrar mensaje de confirmación
    document
      .getElementById("closeConfirmation")
      .addEventListener("click", () => {
        document.getElementById("confirmationMessage").classList.add("hidden");
      });

    // 4) Enviar formulario de cita
    document
      .getElementById("appointmentForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        // Payload para enviar al backend
        const payload = {
          car_id: car.id,
          full_name: document.getElementById("fullName").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          email: document.getElementById("apptEmail").value.trim(),
          date: document.getElementById("date").value,
          time: document.getElementById("time").value,
          comment: document.getElementById("comment").value.trim(),
        };

        // Si hay token, lo añadimos al header; si no, no lo ponemos
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        try {
          const response = await fetch(
            "http://localhost/car_dealership/backend/appointments/create_appointment.php",
            {
              method: "POST",
              headers: headers,
              body: JSON.stringify(payload),
            }
          );

          if (response.status === 401) {
            Toastify({
              text: "Token inválido/expirado. Inicia sesión de nuevo.",
              duration: 3000,
              gravity: "top",
              position: "right",
              style: { background: "#F44336" },
            }).showToast();
            return;
          }

          const result = await response.json();
          if (result.success) {
            document.getElementById("appointmentModal").classList.add("hidden");
            document
              .getElementById("confirmationMessage")
              .classList.remove("hidden");
          } else {
            Toastify({
              text: result.message || "Error al agendar la cita.",
              duration: 3000,
              gravity: "top",
              position: "right",
              style: { background: "#F44336" },
            }).showToast();
          }
        } catch (error) {
          console.error("Error al enviar cita:", error);
          Toastify({
            text: "Error de conexión. Intenta nuevamente más tarde.",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#F44336" },
          }).showToast();
        }
      });
  } catch (error) {
    console.error("Error al obtener detalles del auto:", error);
    carDetail.innerHTML =
      "<p class='text-red-500 text-center'>Error al cargar los detalles del vehículo.</p>";
  }
});
