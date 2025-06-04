const loadUsers = async () => {
  const data = await apiFetch("/users/get_users.php");
  if (data.success) {
    const usersTableBody = document.getElementById("usersTableBody");
    usersTableBody.innerHTML = data.users
      .map(
        (user) => `
          <tr>
            <td>${user.id}</td>
            <td>${user.first_name} ${user.last_name}</td>
            <td>${user.email}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>${
              user.image
                ? `<img src="${
                    user.image
                  }?t=${new Date().getTime()}" alt="User Image" class="w-10 h-10 rounded-full" />`
                : "Sin imagen"
            }</td>
            <td>
              <button class="editUserBtn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" data-id="${
                user.id
              }">Editar</button>
              <button class="deleteUserBtn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" data-id="${
                user.id
              }">Eliminar</button>
            </td>
          </tr>
        `
      )
      .join("");
    attachUserEventListeners();
  }
};

const attachUserEventListeners = () => {
  document.querySelectorAll(".editUserBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;
      const data = await apiFetch(`/users/get_user.php?id=${userId}`);
      if (data.success) {
        const user = data.user;
        document.getElementById("userId").value = user.id;
        document.getElementById("firstName").value = user.first_name;
        document.getElementById("lastName").value = user.last_name;
        document.getElementById("email").value = user.email;
        document.getElementById("username").value = user.username;
        document.getElementById("password").value = "";
        document.getElementById("role").value = user.role;
        document.getElementById("userImage").value = user.image || "";
        document.getElementById("userImageInput").value = ""; // Limpiar el input de archivo
        document.getElementById("userModalTitle").textContent =
          "Editar Usuario";
        document.getElementById("userModal").style.display = "flex";
      }
    });
  });

  document.querySelectorAll(".deleteUserBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.id;
      document.getElementById("deleteConfirmModal").style.display = "flex";
      document.getElementById("confirmDeleteBtn").onclick = async () => {
        const data = await apiFetch("/users/delete_user.php", "POST", {
          id: userId,
        });
        if (data.success) {
          showToast("¡Usuario eliminado con éxito! 💫", "success");
          document.getElementById("deleteConfirmModal").style.display = "none";
          loadUsers();
        }
      };
      document.getElementById("cancelDeleteBtn").onclick = () => {
        document.getElementById("deleteConfirmModal").style.display = "none";
      };
    });
  });
};

const setupUserForm = () => {
  document.getElementById("createUserBtn").addEventListener("click", () => {
    document.getElementById("userForm").reset();
    document.getElementById("userId").value = "";
    document.getElementById("userModalTitle").textContent =
      "Crear Nuevo Usuario";
    document.getElementById("userModal").style.display = "flex";
  });

  document.getElementById("closeUserModalBtn").addEventListener("click", () => {
    document.getElementById("userModal").style.display = "none";
  });

  document.getElementById("userModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("userModal")) {
      document.getElementById("userModal").style.display = "none";
    }
  });

  document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const userId = document.getElementById("userId").value;
    const password = document.getElementById("password").value;

    // Validar que la contraseña sea obligatoria al crear un usuario
    if (!userId && !password) {
      showToast("La contraseña es obligatoria para crear un usuario", "error");
      return;
    }

    const userData = {
      id: userId || undefined, // Asegurarse de incluir el id
      first_name: document.getElementById("firstName").value,
      last_name: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      username: document.getElementById("username").value,
      password: password || undefined, // No enviar password si está vacío al editar
      role: document.getElementById("role").value,
    };

    // Manejar la subida de imagen
    let imagePath = document.getElementById("userImage").value;
    const imageInput = document.getElementById("userImageInput");
    console.log("Files selected:", imageInput.files);
    if (imageInput.files.length > 0) {
      const formData = new FormData();
      formData.append("image", imageInput.files[0]);
      formData.append("folder", "users"); // Especificar la carpeta para usuarios
      console.log("Uploading file:", imageInput.files[0].name);
      const uploadResponse = await apiFetch(
        "/upload_image.php",
        "POST",
        formData,
        true
      );
      console.log("Upload response:", uploadResponse);
      if (uploadResponse.success) {
        imagePath = uploadResponse.image_path;
      } else {
        showToast(
          "Error al subir la imagen: " + uploadResponse.message,
          "error"
        );
        return;
      }
    }
    userData.image = imagePath || undefined;

    console.log("Sending to API:", userData);
    const url = userId ? "/users/update_user.php" : "/users/create_user.php";

    try {
      const data = await apiFetch(url, "POST", userData);
      if (data.success) {
        showToast(
          userId
            ? "Usuario actualizado exitosamente"
            : "Usuario creado exitosamente",
          "success"
        );
        document.getElementById("userModal").style.display = "none";
        loadUsers();

        // Verificar si el usuario editado es el usuario autenticado
        const currentUser = JSON.parse(localStorage.getItem("user"));
        console.log("Current user ID:", currentUser.sub);
        console.log("Edited user ID:", userId);
        if (userId && Number(currentUser.sub) === Number(userId)) {
          console.log("Updating sidebar for authenticated user...");
          await updateUserSidebar(userId); // Actualizar el sidebar
        } else {
          console.log(
            "User ID does not match authenticated user, skipping sidebar update."
          );
        }
      } else {
        showToast("Error: " + data.message, "error");
      }
    } catch (error) {
      showToast("Error al guardar el usuario: " + error.message, "error");
    }
  });
};

// Expose functions globally
window.loadUsers = loadUsers;
window.setupUserForm = setupUserForm;
