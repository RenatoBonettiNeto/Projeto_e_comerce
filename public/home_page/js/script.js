
const catalogoContainer = document.querySelector('.catalogo');

async function getProduto() {
    try {
        const response = await fetch('https://fakestoreapi.com/products/');
        const products = await response.json();

        catalogoContainer.innerHTML = '';

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add('catalogo-item');

            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.title}" class="product-image">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">R$ ${product.price.toFixed(2)}</p>
                <a href="/product/index.html?id=${product.id}" class="product-link">Ver detalhes</a>
            `;
            catalogoContainer.appendChild(productElement);
        });
    } catch (error) {
        console.error('Erro ao buscar os produtos:', error);
        catalogoContainer.innerHTML = '<p>Erro ao carregar produtos.</p>';
    }
}

getProduto();
