import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';


class Cart {
  constructor(element) {
    this.products = [];
    this.getElements(element);
    this.initActions();
    this.deliveryFee = settings.cart.defaultDeliveryFee;
  }

  getElements(element) {
    this.dom = {};
    this.dom.productList = document.querySelector(select.cart.productList);
    this.dom.wrapper = element;
    this.dom.toggleTrigger = this.dom.wrapper.querySelector(select.cart.toggleTrigger);
    this.dom.form = this.dom.wrapper.querySelector(select.cart.form);
    this.dom.phone = this.dom.wrapper.querySelector(select.cart.phone);
    this.dom.address = this.dom.wrapper.querySelector(select.cart.address);

    this.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
    for(let key of this.renderTotalsKeys){
      this.dom[key] = this.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  update() {
    this.deliveryFee = settings.cart.defaultDeliveryFee;
    if(this.products.length == 0) {
      this.deliveryFee = 0;
    }
    this.totalNumber = 0;
    this.subtotalPrice = 0;
    for(const product of this.products) {
      this.subtotalPrice += product.price;
      this.totalNumber += product.amount;
    }
    this.totalPrice = this.subtotalPrice + this.deliveryFee;
    for(let key of this.renderTotalsKeys) {
      for(let elem of this.dom[key]) {
        elem.innerHTML = this[key];
      }
    }
  }

  initActions() {
    this.dom.toggleTrigger.addEventListener('click',
      () => {
        this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      }
    );
    this.dom.productList.addEventListener('updated' , this.update.bind(this));
    this.dom.productList.addEventListener('remove' , () => {this.remove(event.detail.cartProduct);});
    this.dom.form.addEventListener('submit', ()=> {
      event.preventDefault();
      this.sendOrder();
    });
  }

  sendOrder() {
    if(this.products.length != 0 && this.dom.address.value && this.dom.phone.value) {
      const url = settings.db.url + '/' + settings.db.order;

      const payload = {
        address: this.dom.address.value,
        phone: this.dom.phone.value,
        subtotalPrice: this.subtotalPrice,
        totalPrice: this.totalPrice,
        totalNumber: this.totalNumber,
        deliveryFee: this.deliveryFee,
        products: [],
      };

      for(const product of this.products) {
        payload.products.push(product.getData());
      }

      const option = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, option)
        .then(respond => respond.json())
        .then(parsedRespond => {
          console.log('parsedRespond: ', parsedRespond);
        });
    } else {
      alert('Wrong input');
    }
  }

  remove(cartProduct) {
    const index = this.products.indexOf(cartProduct);
    this.products.splice(index,1);
    console.log(cartProduct.dom.wrapper);
    console.log(this.dom.productList);
    this.dom.productList.removeChild(cartProduct.dom.wrapper);
    this.update();
  }

  add(menuProduct) {
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    this.dom.productList.appendChild(generatedDOM);
    this.products.push(new CartProduct(menuProduct, generatedDOM));
    this.update();
  }

}

export default Cart;
