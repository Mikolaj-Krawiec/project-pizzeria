import {settings, select} from '../settings.js';

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

export default AmountWidget;
