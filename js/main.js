'use strict';
import Swiper from 'https://unpkg.com/swiper/swiper-bundle.esm.browser.min.js';
// ВСЕ КОНСТАНТЫ
const RED_COLOR = '#ff0000';
const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title')
const restaurantRating = document.querySelector('.rating')
const restaurantPrice = document.querySelector('.price')
const restaurantCategory = document.querySelector('.category')
const inputSearch = document.querySelector('.input-search')
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');
let login = localStorage.getItem('userAcc');


const cart = [];

const getData = async function (url) {

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url},
       статус ошибка ${response.status}!`);
  }

  return await response.json();

};

const validName = function (str) {
  const regName = /^[a-zA-Z][a-zA-Z0-9-_\.]{3,20}$/;
  return regName.test(str);
}

//открыто-закрыто
const toggleModal = function () {
  modal.classList.toggle("is-open");
};
const toggleModalAuth = function () {
  modalAuth.classList.toggle('is-open');
  if (modalAuth.classList.contains("is-open")) {
    disableScroll();
  } else {
    enableScroll();
  }
};
//возврат на главную
const returnMain = function () {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
};
//очистка формы! сука не работает нормально
const clearForm = function () {
  loginInput.style.borderColor = '';
  logInForm.reset();
}
//Стили при входе, выйти из аккаунта
function authorized() {

  function logOut() {
    login = null;
    localStorage.removeItem('userAcc');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  }
  console.log('Авторизован');
  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
}
//Проверка на валидность формы, вход в аккаунт
function notAuthorized() {
  console.log('Не авторизован');

  function logIn(event) {
    event.preventDefault();
    if (validName(loginInput.value)) {
      login = loginInput.value;
      localStorage.setItem('userAcc', login);
      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();
    } else {
      loginInput.style.borderColor = RED_COLOR;
      loginInput.value = '';
    }
  }
  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

function checkAuth() {
  if (login) {
    authorized();
  } else {
    notAuthorized();
  }
}

function createCardRestaurant({ image, kitchen, name, price, stars, products, time_of_delivery }) {

  const cardRestaurant = document.createElement('a');
  cardRestaurant.classList.add('card', 'card-restaurant');
  cardRestaurant.products = products;
  cardRestaurant.info = { kitchen, name, price, stars };

  const card = `
						<img src="${image}" alt="${name}" class="card-image"/>
						<div class="card-text">
							<div class="card-heading">
								<h3 class="card-title">${name}</h3>
								<span class="card-tag tag">${time_of_delivery} мин</span>
							</div>
							<div class="card-info">
								<div class="rating">
                ${stars}
								</div>
								<div class="price">От ${price} ₽</div>
								<div class="category"> ${kitchen} </div>
							</div>
						</div>
          `;
  cardRestaurant.insertAdjacentHTML('beforeend', card)
  cardsRestaurants.insertAdjacentElement('beforeend', cardRestaurant);
}


function createCardGood({ description, id, image, name, price }) {



  const card = document.createElement('div');
  card.className = 'card';
  card.insertAdjacentHTML('beforeend', `
						<img src="${image}" alt="${name}" class="card-image"/>
						<div class="card-text">
							<div class="card-heading">
								<h3 class="card-title card-title-reg">${name}</h3>
							</div>
							<div class="card-info">
								<div class="ingredients">${description}</div>
							</div>				
							<div class="card-buttons">
								<button class="button button-primary button-add-cart" id="${id}">
									<span class="button-card-text">В корзину</span>
									<span class="button-cart-svg"></span>
								</button>
								<strong class="card-price card-price-bold">${price} ₽</strong>
							</div>
						</div>							
  `);

  cardsMenu.insertAdjacentElement('beforeend', card);
};

function openGoods(event) {
  const target = event.target;
  if (login) {

    const restaurant = target.closest('.card-restaurant');
    if (restaurant) {
      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      const { name, kitchen, price, stars } = restaurant.info;

      restaurantTitle.textContent = name;
      restaurantRating.textContent = stars;
      restaurantPrice.textContent = `От ${price} ₽`;
      restaurantCategory.textContent = kitchen;
      location.hash = `#${name}`;



      getData(`./db/${restaurant.products}`).then(function (data) {
        data.forEach(createCardGood)
      });
    } else {
      toggleModalAuth();
    }
  }
}
const addToCart = function (event) {

  const target = event.target;

  const buttonAddtoCart = target.closest('.button-add-cart');

  if (buttonAddtoCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = buttonAddtoCart.id;

    const food = cart.find(function (item) {
      return item.id === id;
    })
    if (food) {
      food.count += 1;
    } else {
      cart.push({
        id, title, cost, count: 1
      });
    }
  }
}
function renderCart() {
  modalBody.textContent = '';
  cart.forEach(function ({ id, title, cost, count }) {
    const itemCart = `
        	<div class="food-row">
					    <span class="food-name">${title}</span>
					    <strong class="food-price">${cost}</strong>
					    <div class="food-counter">
						    <button class="counter-button counter-minus" data-id=${id}>-</button>
						    <span class="counter">${count}</span>
						    <button class="counter-button counter-plus" data-id=${id}>+</button>
					   </div>
            </div>
        `;
    modalBody.insertAdjacentHTML('afterbegin', itemCart)
  });
  const totalPrice = cart.reduce(function (result, item) {
    return result + (parseFloat(item.cost) * item.count);
  }, 0);

  modalPrice.textContent = totalPrice + '₽';


}

const changeCount = function (event) {
  const target = event.target;
  if (target.classList.contains('counter-button')) {
    const food = cart.find(function (item) {
      return item.id === target.dataset.id;
    });
    if (target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    }
    if (target.classList.contains('counter-plus')) {
      food.count++;
    }
    renderCart();
  }

}

const init = function () {
  getData('./db/partners.json').then(function (data) {
    data.forEach(createCardRestaurant)
  });

  cartButton.addEventListener("click", function () {
    renderCart();
    toggleModal();
  });

  buttonClearCart.addEventListener('click', function () {
    cart.length = 0;
    renderCart();
  })

  modalBody.addEventListener('click', changeCount)

  cardsMenu.addEventListener('click', addToCart);

  close.addEventListener("click", toggleModal);

  cardsRestaurants.addEventListener('click', openGoods);

  logo.addEventListener('click', returnMain);

  checkAuth();
  inputSearch.addEventListener('keypress', function (event) {
    if (event.charCode == 13) {
      const value = event.target.value.trim();

      if (!value) {
        event.target.style.backGroundColor = RED_COLOR;
        event.target.value = '';
        setTimeout(function () {
          event.target.style.backGroundColor = '';
        }, 1500)
        return;
      }

      getData('./db/partners.json')
        .then(function (data) {
          return data.map(function (partner) {
            return partner.products;
          });
        })
        .then(function (linksProduct) {
          cardsMenu.textContent = '';

          linksProduct.forEach(function (link) {
            getData(`./db/${link}`)
              .then(function (data) {

                const resultSearch = data.filter(function (item) {
                  const name = item.name.toLowerCase();
                  return name.includes(value.toLowerCase());
                })

                containerPromo.classList.add('hide');
                restaurants.classList.add('hide');
                menu.classList.remove('hide');

                restaurantTitle.textContent = 'Результат поиска';
                restaurantRating.textContent = '';
                restaurantPrice.textContent = '';
                restaurantCategory.textContent = '';

                resultSearch.forEach(createCardGood);
              })
          })
        })
    }
  })

  new Swiper('.swiper-container', {
    loop: false,
    sliderPerview: 1,
    autoplay: true,
    effect: 'coverflow',
    scrollbar: {
      el: '.swiper-scrollbar',
      draggable: true,
      grabCursor: true,
    }

  });
}
init();