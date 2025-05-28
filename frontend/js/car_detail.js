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
    const response = await fetch(
      `http://localhost/car_dealership/backend/cars/get_car.php?id=${carId}`
    );
    const data = await response.json();

    if (!data.success || !data.car) {
      carDetail.innerHTML = `<p class='text-center text-gray-500'>Auto no encontrado.</p>`;
      return;
    }

    const car = data.car;
    carDetail.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <img src="${car.image_url}" alt="${
      car.model
    }" class="w-full rounded-lg shadow"/>
          <div>
            <h2 class="text-2xl font-bold mb-2">${car.brand_name} ${
      car.model
    }</h2>
            <p class="text-gray-600 mb-1">Año: ${car.year}</p>
            <p class="text-gray-600 mb-1">Color: ${car.color}</p>
            <p class="text-gray-600 mb-1">Transmisión: ${car.transmission}</p>
            <p class="text-gray-600 mb-1">Combustible: ${car.fuel_type}</p>
            <p class="text-gray-600 mb-1">Kilometraje: ${car.mileage} km</p>
            <p class="text-blue-600 text-xl font-semibold mt-4">Q${
              car.price
            }</p>
            <p class="mt-4 text-gray-700">${
              car.description || "Sin descripción."
            }</p>
  
            <button id="appointmentBtn" class="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Agendar Cita
            </button>
          </div>
        </div>
  
        <div id="appointmentModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 class="text-xl font-semibold mb-4">Agendar Cita para ${
              car.brand_name
            } ${car.model}</h3>
            <form id="appointmentForm" class="space-y-3">
              <input type="text" id="fullName" placeholder="Nombre completo" class="w-full border px-3 py-2 rounded" required />
              <input type="text" id="phone" placeholder="Teléfono" class="w-full border px-3 py-2 rounded" required />
              <input type="email" id="email" placeholder="Correo electrónico" class="w-full border px-3 py-2 rounded" required />
              <input type="date" id="date" class="w-full border px-3 py-2 rounded" required />
              <input type="time" id="time" class="w-full border px-3 py-2 rounded" required />
              <textarea id="comment" placeholder="Comentario (opcional)" class="w-full border px-3 py-2 rounded"></textarea>
              <div class="flex justify-end gap-4 mt-4">
                <button type="button" id="cancelAppointmentBtn" class="text-gray-500">Cancelar</button>
                <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
  
        <div id="confirmationMessage" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded shadow-lg text-center">
            <h4 class="text-green-700 font-bold text-xl mb-2">¡Cita agendada!</h4>
            <p class="text-gray-700 mb-4">Te hemos enviado un correo de confirmación con los detalles.</p>
            <button id="closeConfirmation" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Cerrar</button>
          </div>
        </div>
      `;

    document.getElementById("appointmentBtn").addEventListener("click", () => {
      document.getElementById("appointmentModal").classList.remove("hidden");
    });

    document
      .getElementById("cancelAppointmentBtn")
      .addEventListener("click", () => {
        document.getElementById("appointmentModal").classList.add("hidden");
      });

    document
      .getElementById("closeConfirmation")
      .addEventListener("click", () => {
        document.getElementById("confirmationMessage").classList.add("hidden");
      });

    document
      .getElementById("appointmentForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
          car_id: car.id,
          full_name: document.getElementById("fullName").value,
          phone: document.getElementById("phone").value,
          email: document.getElementById("email").value,
          date: document.getElementById("date").value,
          time: document.getElementById("time").value,
          comment: document.getElementById("comment").value,
        };

        try {
          const response = await fetch(
            "http://localhost/car_dealership/backend/appointments/create_appointment.php",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );

          const result = await response.json();
          if (result.success) {
            document.getElementById("appointmentModal").classList.add("hidden");
            document
              .getElementById("confirmationMessage")
              .classList.remove("hidden");
          } else {
            alert(result.message || "Error al agendar la cita");
          }
        } catch (error) {
          console.error("Error al enviar cita:", error);
          alert("Error al enviar la solicitud de cita");
        }
      });
  } catch (error) {
    console.error("Error al obtener detalles del auto:", error);
    carDetail.innerHTML = `<p class='text-red-500 text-center'>Error al cargar los detalles del vehículo.</p>`;
  }
});
