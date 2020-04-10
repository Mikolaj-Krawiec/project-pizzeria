/*global rangeSlider*/
import BaseWidget from './BaseWidget.js';
import { settings, select } from '../settings.js';
import { utils } from '../utils.js';

class HourPicker extends BaseWidget{
  constructor(wrapperElement) {
    super(wrapperElement, settings.hours.open);
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    this.dom.output = this.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    this.dom.input.addEventListener('input', event => {
      this.value = event.currentTarget.value;
    });
    this.initPlugin();
  }

  initPlugin() {
    rangeSlider.create(this.dom.input);
  }

  parseValue(value) {
    return utils.numberToHour(value);
  }

  isValid() {
    return true;
  }

  renderValue() {
    this.dom.output.innerHTML = this.value;
  }
}

export default HourPicker;
