const BASE_URL = "http://localhost/car_dealership/backend";

const apiFetch = async (
  endpoint,
  method = "GET",
  body = null,
  isFileUpload = false
) => {
  const token = localStorage.getItem("token");
  const headers = {};
  if (!isFileUpload) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) {
    if (isFileUpload) {
      options.body = body; // No stringificar si es FormData
    } else {
      // Filtrar campos undefined y stringificar el cuerpo
      const filteredBody = Object.fromEntries(
        Object.entries(body).filter(([_, v]) => v !== undefined)
      );
      options.body = JSON.stringify(filteredBody);
      console.log(`Request body for ${endpoint}:`, options.body);
    }
  }

  try {
    console.log(`Fetching ${BASE_URL}${endpoint}...`);
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    console.log(`Response status for ${endpoint}: ${response.status}`);

    const text = await response.text();
    console.log(`Response text for ${endpoint}:`, text);

    try {
      const data = JSON.parse(text);
      if (!data.success) {
        showToast(data.message || "Error en la solicitud", "error");
      }
      return data;
    } catch (jsonError) {
      console.error(`Failed to parse JSON for ${endpoint}:`, jsonError);
      throw jsonError;
    }
  } catch (error) {
    showToast("Error de conexión con el servidor", "error");
    throw error;
  }
};

const showToast = (message, type = "success") => {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: { background: type === "success" ? "#4CAF50" : "#F44336" },
  }).showToast();
};

const showSection = (sectionId) => {
  if (!document.getElementById(sectionId)) {
    console.warn(`Sección ${sectionId} no encontrada`);
    return;
  }
  document.getElementById(sectionId).classList.remove("hidden");
};

// Expose functions globally
window.apiFetch = apiFetch;
window.showToast = showToast;
window.showSection = showSection;
