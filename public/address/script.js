document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado e analisado');
    // Elementos do DOM
    const modal = document.getElementById('addressModal');
    const newAddressBtn = document.getElementById('newAddressBtn');
    const closeBtn = document.querySelector('.close');
    const addressForm = document.getElementById('addressForm');
    const cancelBtn = document.getElementById('cancelBtn');

    // Estados brasileiros
    const estados = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
        'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
        'SP', 'SE', 'TO'
    ];

    // Preenche o select de estados
    const stateSelect = document.querySelector('select[name="state"]');
    estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado;
        option.textContent = estado;
        stateSelect.appendChild(option);
    });

    // Event Listeners
    newAddressBtn.addEventListener('click', () => {
        addressForm.reset();
        document.getElementById('modalTitle').textContent = 'Cadastrar Novo Endereço';
        addressForm.querySelector('input[name="id"]').value = '';
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Máscara para CEP
    const postalCodeInput = document.querySelector('input[name="postal_code"]');
    postalCodeInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        this.value = value;
    });

    // Submit do formulário
    addressForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Conversão do número do endereço para inteiro
        const number = parseInt(formData.get('number'), 10);
        if (isNaN(number)) {
            alert('O número do endereço deve ser um número inteiro.');
            return; // Interrompe o envio se o número não for válido
        }
        formData.set('number', number); // Atualiza o FormData com o número convertido

        const addressId = formData.get('id'); // Obtém o ID do endereço

        try {
            let response;
            if (addressId) {
                // Se o ID estiver presente, atualiza o endereço
                response = await fetch(`/address/${addressId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(Object.fromEntries(formData)),
                });
            } else {
                // Se não houver ID, cria um novo endereço
                response = await fetch('/address', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(Object.fromEntries(formData)),
                });
            }

            const data = await response.json();
            
            if (data.success) {
                modal.style.display = "none";
                addressForm.reset();
                loadAddresses();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cadastrar ou atualizar endereço');
        }
    });

    
// Função para carregar endereços
async function loadAddresses() {
    console.log('Função loadAddresses chamada');
    try {
        const response = await fetch('/addresses', {
            credentials: 'include'
        });
        console.log('Status da resposta:', response.status); // Log do status da resposta

        if (!response.ok) {
            // Captura e exibe o texto da resposta de erro
            const errorText = await response.text();
            throw new Error(`Erro na resposta: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data); // Log dos dados recebidos
        
        const addressesList = document.getElementById('addresses-list');
        addressesList.innerHTML = '';

        if (data.addresses && Array.isArray(data.addresses)) {
            data.addresses.forEach(address => {
                const addressCard = document.createElement('div');
                addressCard.className = 'address-card';
                addressCard.innerHTML = `
                    <div class="address-actions">
                        <button class="btn-secondary" onclick="editAddress(${address.id})">Editar</button>
                        <button class="btn-danger" onclick="showDeleteConfirmation(${address.id})">Excluir</button>
                    </div>
                    <h3>${address.recipient_name}</h3>
                    <p>${address.street}, ${address.number} ${address.complement ? '- ' + address.complement : ''}</p>
                    <p>${address.neighborhood}</p>
                    <p>${address.city} - ${address.state}</p>
                    <p>CEP: ${address.postal_code}</p>
                `;
                addressesList.appendChild(addressCard);
            });
        } else {
            console.warn('Nenhum endereço encontrado ou formato inválido:', data);
        }
    } catch (error) {
        console.error('Erro ao carregar endereços:', error);
        alert('Erro ao carregar endereços: ' + error.message);
    }
}

// Carregar endereços iniciais
loadAddresses();

// Função para editar endereço
window.editAddress = async function(id) {
    try {
        const response = await fetch(`/address/${id}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const form = document.getElementById('addressForm');
            const address = data.address;
            
            form.querySelector('input[name="id"]').value = address.id;
            form.querySelector('input[name="recipient_name"]').value = address.recipient_name;
            form.querySelector('input[name="street"]').value = address.street;
            form.querySelector('input[name="number"]').value = address.number;
            form.querySelector('input[name="complement"]').value = address.complement || '';
            form.querySelector('input[name="neighborhood"]').value = address.neighborhood;
            form.querySelector('input[name="city"]').value = address.city;
            form.querySelector('select[name="state"]').value = address.state;
            form.querySelector('input[name="postal_code"]').value = address.postal_code;
            
            document.getElementById('modalTitle').textContent = 'Editar Endereço';
            document.getElementById('addressModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao carregar endereço:', error);
    }
}

// Função para mostrar confirmação de exclusão
window.showDeleteConfirmation = function(id) {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.style.display = 'block';
    
    document.getElementById('confirmDelete').onclick = async () => {
        await deleteAddress(id);
        deleteModal.style.display = 'none';
    };
    
    document.getElementById('cancelDelete').onclick = () => {
        deleteModal.style.display = 'none';
    };
}

// Função para deletar endereço
window.deleteAddress = async function (id) {
    try {
        const response = await fetch(`/address/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadAddresses();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Erro ao excluir endereço:', error);
        alert('Erro ao excluir endereço');
    }
}

});