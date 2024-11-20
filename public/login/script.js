document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const form = document.querySelector('form');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    form.appendChild(messageDiv);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formData),
            });

            const data = await response.json();
            
            messageDiv.textContent = data.message;
            messageDiv.className = `message ${data.success ? 'success' : 'error'}`;

            if (data.success) {
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1000);
            }
        } catch (error) {
            console.error('Erro:', error);
            messageDiv.textContent = 'Erro ao conectar com o servidor';
            messageDiv.className = 'message error';
        }
    });
});