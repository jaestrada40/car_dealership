document.addEventListener("DOMContentLoaded", () => {
  const quoteForm = document.getElementById("quoteForm");
  const quoteModal = document.getElementById("quoteModal");

  quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1) Leer valores del formulario
    const sparePartId = parseInt(
      document.getElementById("sparePartIdField").value,
      10
    );
    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("emailField").value.trim();
    const quantity = parseInt(document.getElementById("quantity").value, 10);
    const comment = document.getElementById("commentField").value.trim();

    // 2) Validar campos obligatorios
    if (!sparePartId || !fullName || !phone || !email || !quantity) {
      Toastify({
        text: "Por favor completa todos los campos obligatorios.",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#dc2626", // rojo
        className: "font-roboto text-sm",
        stopOnFocus: true,
      }).showToast();
      return;
    }

    // 3) Construir payload JSON
    const payload = {
      spare_part_id: sparePartId,
      full_name: fullName,
      phone: phone,
      email: email,
      quantity: quantity,
      comment: comment,
    };

    // 4) Leer token del localStorage (si existe)
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
          text: "Cotización enviada con éxito. ID: " + data.quote_id,
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#16a34a", // verde
          className: "font-roboto text-sm",
          stopOnFocus: true,
        }).showToast();
        // Limpiar campos y cerrar modal
        quoteForm.reset();
        quoteModal.classList.add("hidden");
      } else {
        throw new Error(
          data.message || "Error desconocido al crear la cotización"
        );
      }
    } catch (err) {
      console.error("Error enviando cotización:", err);
      Toastify({
        text: "Error al enviar cotización: " + err.message,
        duration: 4000,
        gravity: "top",
        position: "right",
        backgroundColor: "#dc2626",
        className: "font-roboto text-sm",
        stopOnFocus: true,
      }).showToast();
    }
  });
});
