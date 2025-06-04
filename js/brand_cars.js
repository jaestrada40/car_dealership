// js/brand_cars.js

document.addEventListener("DOMContentLoaded", async () => {
  const carGrid = document.getElementById("brandCarGrid");
  const brandTitle = document.getElementById("brandTitle");

  const urlParams = new URLSearchParams(window.location.search);
  const brandId = urlParams.get("brand_id");
  const brandName = urlParams.get("brand_name") || "Marca";

  if (!brandId) {
    carGrid.innerHTML =
      "<p class='text-center text-gray-500'>Marca no especificada.</p>";
    return;
  }

  brandTitle.textContent = `Autos de ${decodeURIComponent(brandName)}`;

  try {
    const res = await fetch(
      `http://localhost/car_dealership/backend/cars/get_cars_by_brand.php?id=${brandId}`
    );
    const data = await res.json();

    if (!data.success || !Array.isArray(data.cars) || data.cars.length === 0) {
      carGrid.innerHTML =
        "<p class='text-center text-gray-500'>No hay autos disponibles para esta marca.</p>";
      return;
    }

    data.cars.forEach((car) => {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition";
      card.innerHTML = `
        <img src="${car.image}" alt="${car.model}" class="w-full h-48 object-cover"/>
        <div class="p-4">
          <h3 class="text-lg font-bold">${car.brand} ${car.model}</h3>
          <p class="text-sm text-gray-500">${car.year} - ${car.transmission}</p>
          <p class="mt-2 text-blue-600 font-semibold">Q${car.price}</p>
          <a href="car_detail.html?id=${car.id}" class="block mt-2 text-sm text-blue-500 hover:underline">Ver más</a>
        </div>
      `;
      carGrid.appendChild(card);
    });
  } catch (error) {
    console.error("Error al cargar los autos:", error);
    carGrid.innerHTML =
      "<p class='text-center text-red-500'>Error al cargar autos.</p>";
  }
});
