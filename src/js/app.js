import {settings, select, classNames, templates} from './settings.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Product from './components/Product.js';
import Home from './components/Home.js';

const app = {

  initPages: function() {
    this.pages = document.querySelector(select.containerOf.pages).children;
    this.navLinks = document.querySelectorAll(select.nav.links);
    this.buttons = document.querySelectorAll('.menu-buttons a');

    this.allLinks =[...this.navLinks, ...this.buttons];

    const idFromHash = window.location.hash.replace('#/','');

    // let pageMatchingHash = '#home';
    let pageMatchingHash = this.pages[0].id;
    console.log('pages',this.pages);


    for(let page of this.pages) {
      if(page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    this.activatePage(pageMatchingHash);

    for(let link of this.allLinks){
      link.addEventListener('click', event => {
        event.preventDefault();
        const id = event.currentTarget.getAttribute('href').replace('#','');
        this.activatePage(id);

        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId) {
    for(let page of this.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    for(let link of this.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );

      document.querySelector('.main-nav')
        .classList.toggle('none', pageId == 'home');
      document.querySelector('#cart')
        .classList.toggle('none', pageId == 'home');
    }
  },

  initCart: function() {
    const cartElem = document.querySelector(select.containerOf.cart);
    this.cart = new Cart(cartElem);

    this.productsList = document.querySelector(select.containerOf.menu);
    this.productsList.addEventListener('add-to-cart', () => {
      console.log('cliked');
      this.cart.add(event.detail.product);
    });
  },

  initMenu: function() {
    for(let productData in this.data.products) {
      new Product(this.data.products[productData].id, this.data.products[productData]);
    }
  },

  initData: function() {
    this.data = {products: ''};
    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then((rawResponse) => {
        return rawResponse.json();
      })
      .then((parsedResponse) => {
        this.data.products = parsedResponse;
        console.log('parsedRespond: ', parsedResponse);
        this.initMenu();
      });

    console.log('this.data', JSON.stringify(this.data));
  },

  initBooking() {
    const bookingContainer = document.querySelector(select.containerOf.booking);
    new Booking(bookingContainer);
  },

  initHome() {
    const homeContainer = document.querySelector(select.containerOf.home);
    new Home(homeContainer);
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    this.initHome();
    this.initPages();
    this.initData();
    this.initCart();
    this.initBooking();

  },
};

app.init();

