document.addEventListener("DOMContentLoaded", () => {
  const carGrid = document.getElementById("carGrid");
  const loading = document.getElementById("loading");
  const noResults = document.getElementById("noResults");

  function renderCars(list) {
    carGrid.innerHTML = "";
    noResults.classList.toggle("hidden", list.length > 0);

    list.forEach((car) => {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300";
      card.innerHTML = `
        <img
          src="${car.image_url || "https://via.placeholder.com/300x200"}"
          alt="${car.model}"
          class="w-full h-56 object-contain rounded-t-xl"
        />
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">${car.model}</h3>
          <p class="text-sm text-gray-600 mb-3">Año: ${car.year} | Color: ${
        car.color || "N/A"
      } | ${car.transmission}</p>
          <p class="text-green-700 font-semibold text-lg mb-4">Q${parseFloat(
            car.price
          ).toLocaleString()}</p>
          <a
            href="http://localhost/car_dealership/car_detail.html?id=${car.id}"
            class="block bg-slate-950 hover:bg-green-700 text-white text-center py-2 rounded-lg font-medium transition duration-300"
          >
            Ver Detalles
          </a>
        </div>
      `;
      carGrid.appendChild(card);
    });
  }

  // Cargar autos desde el backend
  const token = localStorage.getItem("token");
  loading.classList.remove("hidden");

  fetch("http://localhost/car_dealership/backend/cars/get_cars.php", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      loading.classList.add("hidden");
      if (data.success) {
        const cars = data.cars || [];
        renderCars(cars);
      } else {
        carGrid.innerHTML = `<p class='text-center text-red-500'>${
          data.message || "Error al cargar vehículos"
        }</p>`;
      }
    })
    .catch(() => {
      loading.classList.add("hidden");
      carGrid.innerHTML = `<p class='text-center text-red-500'>Error de conexión con el servidor</p>`;
    });
});
