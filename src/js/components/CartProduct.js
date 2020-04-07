import AmountWidget from './AmountWidget.js';
import {select} from '../settings.js';

class CartProduct {
  constructor(menuProduct , element) {
    this.id = menuProduct.id;
    this.name = menuProduct.name;
    this.price = menuProduct.price;
    this.priceSingle = menuProduct.priceSingle;
    this.amount = menuProduct.amount;
    this.options = JSON.parse(JSON.stringify(menuProduct.params));
    this.getElements(element);
    this.initAmountWidget();
    this.initActions();
  }

  getData() {
    return {
      id: this.id,
      amount: this.amount,
      price: this.price,
      priceSingle: this.priceSingle,
      params: this.options,
    };
  }

  getElements(element) {
    this.dom = {};

    this.dom.wrapper = element;
    this.dom.amountWidget = this.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    this.dom.price = this.dom.wrapper.querySelector(select.cartProduct.price);
    this.dom.edit = this.dom.wrapper.querySelector(select.cartProduct.edit);
    this.dom.remove = this.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  initAmountWidget() {
    this.amountWidget = new AmountWidget(this.dom.amountWidget);
    this.dom.amountWidget.addEventListener('updated',
      () => {
        this.amount = this.amountWidget.value;
        this.price = this.priceSingle * this.amount;
        this.dom.price.innerHTML = this.price;
      });
  }

  remove() {
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: this,
      },
    });

    this.dom.wrapper.dispatchEvent(event);
  }

  initActions() {
    this.dom.edit.addEventListener('click',() => {
      event.preventDefault();
    });
    this.dom.remove.addEventListener('click', ()=> {
      event.preventDefault();
      this.remove();
      console.log('removing');
    });
  }
}

export default CartProduct;
