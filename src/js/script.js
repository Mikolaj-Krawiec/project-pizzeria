/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      //console.log('new Product:', this);
    }

    renderInMenu(){
      const generatedHTML = templates.menuProduct(this.data);
      this.element = utils.createDOMFromHTML(generatedHTML);
      //console.log(this.element);
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
      });
    }

    processOrder() {
      const formData = utils.serializeFormToObject(this.form);
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
            // END Adding active class to image
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
      this.price *= this.amountWidget.value;
      this.element.querySelector('.price').innerHTML = this.price;
      console.log(this.price);
    }

    initAmountWidget() {
      this.amountWidget = new AmountWidget(this.amountWidgetElem);
      this.amountWidgetElem.addEventListener('updated', () => this.processOrder());
    }

  }

  class AmountWidget {
    constructor(element) {
      this.value = settings.amountWidget.defaultValue;
      this.getElements(element);
      this.setValue(this.input.value);
      this.initActions();
      console.log('AmountWidget:', this);
      console.log(element);
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
      console.log('announce');
      const event = new Event('updated');
      this.element.dispatchEvent(event);
    }

  }

  const app = {

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
    },
  };

  app.init();
}
