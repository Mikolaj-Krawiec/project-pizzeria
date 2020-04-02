/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
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
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
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
      for(const products of app.data.products ) {
        if(products.id == this.id) {
          this.price = products.price;
          for( let param in products.params) {
            if(formData[param]) {
              this.params[param] = {
                label: products.params[param].label,
                options: {},
              };
            }
            for(let option in products.params[param].options) {
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
                  this.params[param].options[option] = products.params[param].options[option].label;
                }
                // Adding price of checked option to price
                if(formData[param].includes(option) && !products.params[param].options[option].default) {
                  this.price += products.params[param].options[option].price;
                } else if(!formData[param].includes(option) && products.params[param].options[option].default) {
                  this.price -= products.params[param].options[option].price;
                }
              } else if(products.params[param].options[option].default) {
                this.price -= products.params[param].options[option].price;
              }
            }
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

  const app = {

    initCart: function() {
      const cartElem = document.querySelector(select.containerOf.cart);
      this.cart = new Cart(cartElem);
    },

    initMenu: function() {
      for(let productData in this.data.products) {
        //new Product(productData, this.data.products[productData]);
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
}
