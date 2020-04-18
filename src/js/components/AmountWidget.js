import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element, step = 1, minValue = settings.amountWidget.defaultMin, maxValue = settings.amountWidget.defaultMax, defaultValue = settings.amountWidget.defaultValue)  {
    super(element, defaultValue);
    this.maxValue = maxValue;
    this.minValue = minValue;
    this.step = +step;
    this.getElements(element);
    this.initActions();
    this.renderValue();
  }

  getElements(){
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.amount.input);
    this.dom.linkDecrease = this.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    this.dom.linkIncrease = this.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){
    return !isNaN(value) &&
    value >= this.minValue &&
    value <= this.maxValue;
  }

  renderValue() {
    this.dom.input.value = this.value;
  }

  initActions() {
    this.dom.input.addEventListener('change' , () => {
      event.preventDefault();
      this.value = this.dom.input.value;
    });
    this.dom.linkDecrease.addEventListener('click', () => {
      event.preventDefault();
      this.value = this.value - this.step;
    });
    this.dom.linkIncrease.addEventListener('click', ()=> {
      event.preventDefault();
      this.value = this.value + this.step;
    });
  }

}

export default AmountWidget;
