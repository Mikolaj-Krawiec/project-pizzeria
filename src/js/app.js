import {settings, select, classNames, templates} from './settings.js';
import Cart from './components/Cart.js';
import Product from './components/Product.js';

const app = {

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
        console.log('(parsedRespond:' ,(parsedResponse));
        this.data.products = parsedResponse;
        this.initMenu();
      });

    console.log('this.data', JSON.stringify(this.data));
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    this.initData();
    this.initCart();
  },
};

app.init();

