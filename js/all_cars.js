// js/all_cars.js

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("allCarsGrid");
  const pagination = document.getElementById("pagination");

  const modelInput = document.getElementById("modelFilter");
  const yearFilter = document.getElementById("yearFilter");
  const transmissionFilter = document.getElementById("transmissionFilter");
  const fuelFilter = document.getElementById("fuelFilter");
  const priceFilter = document.getElementById("priceFilter");

  let allCars = [];
  const itemsPerPage = 6;
  let currentPage = 1;

  async function fetchCars() {
    try {
      const url = new URL(
        "http://localhost/car_dealership/backend/cars/get_cars.php"
      );
      if (modelInput.value) url.searchParams.append("model", modelInput.value);
      if (yearFilter.value) url.searchParams.append("year", yearFilter.value);
      if (transmissionFilter.value)
        url.searchParams.append("transmission", transmissionFilter.value);
      if (fuelFilter.value)
        url.searchParams.append("fuel_type", fuelFilter.value);
      if (priceFilter.value)
        url.searchParams.append("max_price", priceFilter.value);

      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) throw new Error("No se pudieron obtener los autos");

      allCars = data.cars;
      currentPage = 1;
      renderCars();
    } catch (error) {
      console.error(error);
      grid.innerHTML = `<p class='text-center text-red-500'>Error al cargar autos.</p>`;
    }
  }

  function renderCars() {
    grid.innerHTML = "";
    pagination.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const carsToShow = allCars.slice(start, end);

    if (carsToShow.length === 0) {
      grid.innerHTML = `<p class='text-center text-gray-500'>No se encontraron resultados.</p>`;
      return;
    }

    carsToShow.forEach((car) => {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition";
      card.innerHTML = `
          <img src="${car.image_url}" alt="${car.model}" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h3 class="text-lg font-bold">${car.brand_name} ${car.model}</h3>
            <p class="text-sm text-gray-500">${car.year} - ${car.transmission}</p>
            <p class="mt-1 text-sm text-gray-500">${car.fuel_type} - Q${car.price}</p>
            <a href="car_detail.html?id=${car.id}" class="text-green-600 hover:underline text-sm block mt-2">Ver más</a>
          </div>
        `;
      grid.appendChild(card);
    });

    const totalPages = Math.ceil(allCars.length / itemsPerPage);
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = `mx-1 px-3 py-1 rounded ${
        i === currentPage ? "bg-green-600 text-white" : "bg-gray-200"
      }`;
      btn.addEventListener("click", () => {
        currentPage = i;
        renderCars();
      });
      pagination.appendChild(btn);
    }
  }

  // Escuchar cambios de filtros
  [modelInput, yearFilter, transmissionFilter, fuelFilter, priceFilter].forEach(
    (input) => {
      input.addEventListener("input", fetchCars);
    }
  );

  fetchCars();
});
