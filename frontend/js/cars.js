const carGrid = document.getElementById("carGrid");
const searchInput = document.getElementById("searchInput");
const transmissionFilter = document.getElementById("transmissionFilter");
const loading = document.getElementById("loading");
const noResults = document.getElementById("noResults");
let cars = [];

function renderCars(list) {
  carGrid.innerHTML = "";
  noResults.classList.toggle("hidden", list.length > 0);

  list.forEach((car) => {
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition";
    card.innerHTML = `
      <img src="${
        car.image_url || "https://via.placeholder.com/300x200"
      }" alt="${car.model}" class="w-full h-48 object-contain rounded-md mb-4">
      <h3 class="text-lg font-semibold mb-1">${car.model}</h3>
      <p class="text-sm text-gray-600 mb-2">Año: ${car.year} | Color: ${
      car.color || "N/A"
    } | ${car.transmission}</p>
      <p class="text-blue-600 font-bold text-lg mb-2">Q${parseFloat(
        car.price
      ).toLocaleString()}</p>
      <a href="#" class="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Ver Detalles</a>
    `;
    carGrid.appendChild(card);
  });
}

function filterCars() {
  const searchText = searchInput.value.toLowerCase();
  const transmission = transmissionFilter.value.toLowerCase();

  const filtered = cars.filter((car) => {
    const matchSearch =
      car.model.toLowerCase().includes(searchText) ||
      (car.brand_name && car.brand_name.toLowerCase().includes(searchText));
    const matchTransmission = transmission
      ? car.transmission.toLowerCase() === transmission
      : true;
    return matchSearch && matchTransmission;
  });

  renderCars(filtered);
}

searchInput.addEventListener("input", filterCars);
transmissionFilter.addEventListener("change", filterCars);

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
      cars = data.cars || [];
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
