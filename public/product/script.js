const params = new URLSearchParams(window.location.search);
const id = params.get('id');

getProduto();

async function getProduto() {
    const produto = await (await fetch('https://fakestoreapi.com/products/' + id)).json();
    document.getElementById('product-title').innerText = produto.title;
    document.getElementById('product-img').src = produto.image;
    var price = produto.price;
    var fullprice = price+((price/100)*10);
    document.getElementById('product-full-price').innerText = "R$" + fullprice.toFixed(2);
    document.getElementById('product-price').innerText = "R$" + price.toFixed(2);
    document.getElementById('product-installments').innerText = "em 10x R$ " + (price / 10) + " sem juros";
    var rate = produto.rating.rate;
    stars(rate);
}

function alterFavorite() {
    var dom = document.getElementById('heart');
    if (dom.classList.contains('bi-heart')) {
        dom.classList.remove('bi-heart')
        dom.classList.add('bi-heart-fill')
    } else {
        dom.classList.remove('bi-heart-fill')
        dom.classList.add('bi-heart')
    }
}

function halfStar(star) {
    star.classList.remove('bi-star')
    star.classList.add('bi-star-half')
}

function fullStar(star) {
    star.classList.remove('bi-star-half')
    star.classList.add('bi-star-fill')
}

function stars(rate) {
    if (rate >= 0.3) {
        var star = document.getElementById('star1');
        halfStar(star);
        if (rate >= 0.8) {
            fullStar(star);
            if (rate >= 1.3) {
                star = document.getElementById('star2');
                halfStar(star);
                if (rate >= 1.8) {
                    fullStar(star);
                    if (rate >= 2.3) {
                        star = document.getElementById('star3');
                        halfStar(star);
                        if (rate >= 2.8) {
                            fullStar(star);
                            if (rate >= 3.3) {
                                star = document.getElementById('star4');
                                halfStar(star);
                                if (rate >= 3.8) {
                                    fullStar(star)
                                    if (rate >= 4.3) {
                                        star = document.getElementById('star4');
                                        halfStar(star);
                                        if (rate >= 4.8) {
                                            fullStar(star)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

var data = new Date();
var dia = data.getDay();
var dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
var nomedia = dias[dia];
if (dia == 0 || dia == 6) {
    document.getElementById('product-deliver-time').innerText = "Chegará no próximo " + nomedia;
} else {
    document.getElementById('product-deliver-time').innerText = "Chegará na próxima " + nomedia;
}







