document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    form.appendChild(messageDiv);

    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function() {
        let value = phoneInput.value.replace(/\D/g, '');
        if(value.length > 11){
            value = value.slice(0, 11);
        }
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        phoneInput.value = value;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formData),
            });

            const data = await response.json();
            
            messageDiv.textContent = data.message;
            messageDiv.className = `message ${data.success ? 'success' : 'error'}`;
            messageDiv.style.display = 'block';

            if (data.success) {
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1000);
            }
        } catch (error) {
            console.error('Erro:', error);
            messageDiv.textContent = 'Erro ao cadastrar usuário';
            messageDiv.className = 'message error';
        }
    });
});