/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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
      this.price = dataSource.products[this.id].price;
      for( let param in dataSource.products[this.id].params) {
        for(let option in dataSource.products[this.id].params[param].options) {
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
            if(!this.params[param]) {
              this.params[param] = {
                label: dataSource.products[this.id].params[param].label,
                options: {},
              };
            }
            this.params[param].options[option] = dataSource.products[this.id].params[param].options[option].label;
            // Adding price of checked option to price
            if(formData[param].includes(option) && !dataSource.products[this.id].params[param].options[option].default) {
              this.price += dataSource.products[this.id].params[param].options[option].price;
            } else if(!formData[param].includes(option) && dataSource.products[this.id].params[param].options[option].default) {
              this.price -= dataSource.products[this.id].params[param].options[option].price;
            }
          } else if(dataSource.products[this.id].params[param].options[option].default) {
            this.price -= dataSource.products[this.id].params[param].options[option].price;
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
      app.cart.add(this);
    }

  }

  class AmountWidget {
    constructor(element) {
      this.value = settings.amountWidget.defaultValue;
      this.getElements(element);
      this.setValue(this.input.value);
      this.initActions();
    }

    getElements(element){
      this.element = element;
      this.input = this.element.querySelector(select.widgets.amount.input);
      this.linkDecrease = this.element.querySelector(select.widgets.amount.linkDecrease);
      this.linkIncrease = this.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const newValue = parseInt(value);
      if(newValue != this.value &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax)
      {
        this.value = newValue;
        this.announce();
      }
      this.input.value = this.value;
    }

    initActions() {
      this.input.addEventListener('change' , () => {
        event.preventDefault();
        this.setValue(this.input.value);
      });
      this.linkDecrease.addEventListener('click', () => {
        event.preventDefault();
        this.setValue(this.value - 1);
      });
      this.linkIncrease.addEventListener('click', ()=> {
        event.preventDefault();
        this.setValue(this.value + 1);
      });
    }

    announce() {
      const event = new Event('updated', {bubbles: true});
      this.element.dispatchEvent(event);
    }

  }

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

  const app = {

    initCart: function() {
      const cartElem = document.querySelector(select.containerOf.cart);
      this.cart = new Cart(cartElem);
    },

    initMenu: function() {
      for(let productData in this.data.products) {
        new Product(productData, this.data.products[productData]);
      }
    },

    initData: function() {
      this.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      this.initData();
      this.initMenu();
      this.initCart();
    },
  };

  app.init();
}
