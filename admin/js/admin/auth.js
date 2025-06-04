const checkAuth = async () => {
  console.log("Inside checkAuth");
  const token = localStorage.getItem("token");
  const userDataString = localStorage.getItem("user");
  let userData = null;

  try {
    userData = userDataString ? JSON.parse(userDataString) : null;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    showToast(
      "Error de autenticación. Por favor, inicia sesión nuevamente.",
      "error"
    );
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 3000);
    return null;
  }

  const userRole = userData ? userData.role : null;

  if (!token || userRole !== "admin") {
    showToast(
      "Acceso denegado. Solo administradores pueden acceder a esta página.",
      "error"
    );
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 3000);
    return null;
  }

  // Cargar datos del usuario autenticado
  await updateUserSidebar(userData.sub);
  return userData;
};

const updateUserSidebar = async (userId) => {
  console.log(`Updating sidebar for user ID: ${userId}`);
  try {
    const response = await apiFetch(`/users/get_user.php?id=${userId}`);
    if (response.success) {
      const user = response.user;
      console.log("User data fetched:", user);
      const userImage = document.getElementById("userImage");
      const userName = document.getElementById("userName");
      if (userImage && userName) {
        const imageUrl = user.image
          ? `${user.image}?t=${new Date().getTime()}`
          : "../uploads/user.png";
        userImage.src = ""; // Limpiar la fuente actual
        userImage.src = imageUrl; // Forzar recarga
        userName.textContent = `${user.first_name} ${user.last_name}`;
        console.log(
          "Sidebar updated - Image:",
          userImage.src,
          "Name:",
          userName.textContent
        );
      } else {
        console.error("Sidebar elements not found");
      }
    } else {
      throw new Error(response.message || "Error al cargar datos del usuario");
    }
  } catch (error) {
    console.error("Error updating user sidebar:", error);
    showToast("Error al actualizar datos del usuario en el sidebar", "error");
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showToast("Sesión cerrada", "success");
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1000);
};

// Expose functions globally
window.checkAuth = checkAuth;
window.updateUserSidebar = updateUserSidebar;
window.logout = logout;
