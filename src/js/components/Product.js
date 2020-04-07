import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    this.id = id;
    this.data = data;

    this.renderInMenu();
    this.getElements();
    this.initAccordion();
    this.initOrderForm();
    this.initAmountWidget();
    this.processOrder();
  }

  renderInMenu() {
    const generatedHTML = templates.menuProduct(this.data);
    this.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(this.element);
  }

  getElements(){
    const thisProduct = this;

    this.imageWrapper = this.element.querySelector(select.menuProduct.imageWrapper);
    this.amountWidgetElem = this.element.querySelector(select.menuProduct.amountWidget);

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
  }

  initAccordion(){
    this.accordionTrigger.addEventListener('click', () => {
      event.preventDefault();
      this.element.classList.toggle(classNames.menuProduct.wrapperActive);
      const allProducts = document.querySelectorAll(select.all.menuProducts);
      for (const product of allProducts) {
        if(product != this.element) {
          product.classList.remove(classNames.menuProduct.wrapperActive);
        }
      }
    });
  }

  initOrderForm() {
    this.form.addEventListener('submit', () => {
      event.preventDefault();
      this.processOrder();
    });

    for(let input of this.formInputs) {
      input.addEventListener('change', () => {
        this.processOrder();
      });
    }

    this.cartButton.addEventListener('click', event => {
      event.preventDefault();
      this.processOrder();
      this.addToCart();
    });
  }

  processOrder() {
    const formData = utils.serializeFormToObject(this.form);
    this.params = {};
    this.price = this.data.price;
    for( let param in this.data.params) {
      if(formData[param]) {
        this.params[param] = {
          label: this.data.params[param].label,
          options: {},
        };
      }
      for(let option in this.data.params[param].options) {
        // Add active class to image
        const img = this.imageWrapper.querySelector(`.${param}-${option}`);
        if(img){
          img.classList.remove(classNames.menuProduct.imageVisible);
        }
        if(formData[param]){
          if(formData[param].includes(option) && img) {
            img.classList.add(classNames.menuProduct.imageVisible);
          }
          // Add option to this.parms
          if(formData[param].includes(option)) {
            this.params[param].options[option] = this.data.params[param].options[option].label;
          }
          // Adding price of checked option to price
          if(formData[param].includes(option) && !this.data.params[param].options[option].default) {
            this.price += this.data.params[param].options[option].price;
          } else if(!formData[param].includes(option) && this.data.params[param].options[option].default) {
            this.price -= this.data.params[param].options[option].price;
          }
        } else if(this.data.params[param].options[option].default) {
          this.price -= this.data.params[param].options[option].price;
        }
      }
    }
    this.priceSingle = this.price;
    this.price = this.priceSingle * this.amountWidget.value;
    this.element.querySelector('.price').innerHTML = this.price;
  }

  initAmountWidget() {
    this.amountWidget = new AmountWidget(this.amountWidgetElem);
    this.amountWidgetElem.addEventListener('updated', () => this.processOrder());
  }

  addToCart() {
    this.name = this.data.name;
    this.amount = this.amountWidget.value;
    //app.cart.add(this);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: this,
      },
    });

    this.element.dispatchEvent(event);
  }

}

export default Product;
