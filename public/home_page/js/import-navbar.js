document.addEventListener("DOMContentLoaded", function () {
  fetch("/home_page/navbar.html")
    .then(response => response.text())
    .then(data => {
      const navbarContainer = document.getElementById("navbar-container");
      navbarContainer.innerHTML = data;

      // Event Listener para o botão de logout
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          try {
            const response = await fetch('/logout', {
              method: 'POST',
              credentials: 'include'
            });

            if (response.ok) {
              window.location.href = '/login';
            }
          } catch (error) {
            console.error('Erro ao fazer logout:', error);
          }
        });
      }

      // Event Listener para o botão de excluir usuário
      const deleteUserBtn = document.getElementById('deleteUserBtn');
      const deleteUserModal = document.getElementById('deleteUserModal');
      const confirmDeleteUserBtn = document.getElementById('confirmDeleteUser');
      const cancelDeleteUserBtn = document.getElementById('cancelDeleteUser');
      const closeBtn = document.querySelector('.close');

      if (deleteUserBtn) {
        deleteUserBtn.addEventListener('click', () => {
          deleteUserModal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
          deleteUserModal.style.display = 'none';
        });

        cancelDeleteUserBtn.addEventListener('click', () => {
          deleteUserModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
          if (e.target === deleteUserModal) {
            deleteUserModal.style.display = 'none';
          }
        });

        confirmDeleteUserBtn.addEventListener('click', async () => {
          try {
            const response = await fetch('/delete-user', {
              method: 'DELETE',
              credentials: 'include'
            });

            if (response.ok) {
              alert('Usuário excluído com sucesso.');
              window.location.href = '/login';
            } else {
              alert('Erro ao excluir usuário.');
            }
          } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            alert('Erro ao excluir usuário.');
          }
        });

      // Event Listener para o botão de alterar senha
      const changePasswordBtn = document.getElementById('changePasswordBtn');
      const changePasswordModal = document.getElementById('changePasswordModal');
      const closeChangePasswordModal = document.getElementById('closeChangePasswordModal');
      const confirmChangePassword = document.getElementById('confirmChangePassword');
      const cancelChangePassword = document.getElementById('cancelChangePassword');
      const messageDiv = changePasswordModal.querySelector('.message'); // Seleciona a div de mensagens dentro do modal

      if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
          messageDiv.style.display = 'none'; // Limpa a mensagem ao abrir o modal
          changePasswordModal.style.display = 'block'; // Abre o modal
        });
      }

      if (closeChangePasswordModal) {
        closeChangePasswordModal.addEventListener('click', () => {
          changePasswordModal.style.display = 'none'; // Fecha o modal
        });
      }

      if (cancelChangePassword) {
        cancelChangePassword.addEventListener('click', () => {
          changePasswordModal.style.display = 'none'; // Fecha o modal
        });
      }

      if (confirmChangePassword) {
        confirmChangePassword.addEventListener('click', async () => {
          const oldPassword = document.getElementById('oldPassword').value;
          const newPassword = document.getElementById('newPassword').value;

          // Validações
          if (newPassword === oldPassword) {
            messageDiv.textContent = "A nova senha não pode ser a mesma que a senha antiga.";
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block'; 
            return;
          }

          try {
            const response = await fetch('/change-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ oldPassword, newPassword })
            });

            const result = await response.json();
            if (result.success) {
              messageDiv.textContent = result.message;
              messageDiv.className = 'message success';
              messageDiv.style.display = 'block'; 
              setTimeout(() => {
                changePasswordModal.style.display = 'none'; 
              }, 2000);
            } else {
              messageDiv.textContent = result.message;
              messageDiv.className = 'message error';
              messageDiv.style.display = 'block'; 
            }
          } catch (error) {
            console.error('Erro ao alterar a senha:', error);
            messageDiv.textContent = 'Erro ao alterar a senha. Tente novamente.';
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block'; 
          }
        });
      }
      }
    })
    .catch(error => console.error("Erro ao carregar a nav-bar:", error));
});
