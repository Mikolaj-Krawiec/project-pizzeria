/* global flatpickr */
import BaseWidget from './BaseWidget.js';
import { utils } from '../utils.js';
import {select, settings} from '../settings.js';

class DatePicker extends BaseWidget {
  constructor(wrapperElement) {
    super(wrapperElement, utils.dateToStr(new Date()));
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.datePicker.input);
    this.initPlugin();
  }

  initPlugin() {
    this.minDate = new Date(this.value);
    this.maxDate = utils.addDays(this.value ,settings.datePicker.maxDaysInFuture);
    flatpickr(this.dom.input, {
      defaultDate: this.minDate,
      minDate: this.minDate,
      maxDate: this.maxDate,
      'locale': {
        'firstDayOfWeek': 1 // start week on Monday
      },
      'disable': [
        function(date) {
          // return true to disable
          return (date.getDay() === 1);
        }
      ],
      onChange: (selectedDates, dateStr) => {
        this.value = dateStr;
      },
    });
  }

  parseValue(value) {
    return value;
  }

  isValid() {
    return true;
  }

  renderValue() {

  }

  announce() {
    const event = new Event('updated_DateOrHour', {bubbles: true});
    this.dom.wrapper.dispatchEvent(event);
  }

}

export default DatePicker;
