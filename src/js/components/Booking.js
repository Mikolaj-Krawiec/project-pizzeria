import {templates, select, settings, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import { utils } from '../utils.js';

class Booking {
  constructor(container) {
    this.render(container);
    this.initWidget();
    this.getData();
  }

  getData() {
    console.log('getData');

    this.date = this.datePicker.value;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(this.datePicker.minDate);
    const endDateparam = settings.db.dateEndParamKey + '=' + utils.dateToStr(this.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateparam,
      ],
      eventCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateparam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateparam,
      ],
    };

    const urls = {
      booking:      settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventCurrent: settings.db.url + '/' + settings.db.event   + '?' + params.eventCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event   + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(allResponse => {
        const bookingsResponse = allResponse[0];
        const eventCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];
        return Promise.all([
          bookingsResponse.json(),
          eventCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then( allResponse => {
        const [bookings, eventCurrent, eventsRepeat] = allResponse;
        this.parseData(bookings, eventCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventCurrent, eventsRepeat) {
    this.booked = {};
    for(let item of bookings) {
      console.log('date:',item.date);
      console.log('hour:',item.hour);
      console.log('duration:',item.duration);
      console.log('table:',item.table);

      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventCurrent) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = this.datePicker.minDate;
    const maxDate = this.datePicker.maxDate;

    for(let item of eventsRepeat) {
      if(item.repeat === 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          this.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    this.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    if(this.booked[date] === undefined) {
      this.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if(this.booked[date][hourBlock] === undefined) {
        this.booked[date][hourBlock] = [];
      }
      this.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    this.selectedTable = undefined;

    this.hour = utils.hourToNumber(this.hourPicker.value);
    this.date = this.datePicker.value;

    let allAvailable = false;

    if(this.booked[this.date] === undefined || this.booked[this.date][this.hour] === undefined){
      allAvailable = true;
    }

    for(let table of this.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if(!allAvailable && this.booked[this.date][this.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }

  tableClickedHandler() {
    const table = event.currentTarget;

    if(this.selectedTable !== undefined) {
      for(let t of this.dom.tables) {
        if(t.getAttribute(settings.booking.tableIdAttribute) == this.selectedTable) {
          t.classList.remove(classNames.booking.tableBooked);
        }
      }
      if(this.selectedTable === table.getAttribute(settings.booking.tableIdAttribute)) {
        this.selectedTable = undefined;
        return;
      }
      this.selectedTable = undefined;
    }

    if(!table.classList.contains(classNames.booking.tableBooked)) {
      table.classList.add(classNames.booking.tableBooked);
      this.selectedTable =  +table.getAttribute(settings.booking.tableIdAttribute);
    }
  }

  formSubmitClickHandler() {
    event.preventDefault();

    if(this.selectedTable && this.dom.address.value && this.dom.phone.value) {

      const url = settings.db.url + '/' + settings.db.booking;

      const starterArray = [];

      console.log('this.dom.starters:',this.dom.starters);
      for(const starter of this.dom.starters) {
        if(starter.checked) {
          starterArray.push(starter.value);
        }
      }

      const payload = {
        date: this.datePicker.value,
        hour: this.hourPicker.value,
        table: this.selectedTable,
        duration: this.hoursAmount.value,
        ppl: this.peopleAmount.value,
        address: this.dom.address.value,
        phone: this.dom.phone.value,
        starters: starterArray,
      };

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
          this.getData();
          this.selectedTable = undefined;
        });
    } else {
      alert('Wrong input');
    }
  }

  render(container) {
    const generatedHTML = templates.bookingWidget();

    this.dom = {};

    this.dom.wrapper = container;
    this.dom.wrapper.innerHTML = generatedHTML;

    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);

    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);

    this.dom.formSubmit = this.dom.wrapper.querySelector(select.booking.formSubmit);
    this.dom.phone = this.dom.wrapper.querySelector(select.booking.phone);
    this.dom.address = this.dom.wrapper.querySelector(select.booking.address);
    this.dom.starters = this.dom.wrapper.querySelectorAll(select.booking.starter);
  }

  initWidget() {
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);

    this.datePicker = new DatePicker(this.dom.datePicker);
    this.hourPicker = new HourPicker(this.dom.hourPicker);

    this.dom.wrapper.addEventListener('updated_DateOrHour', this.updateDOM.bind(this));
    this.dom.tables.forEach(element => {
      element.addEventListener('click', this.tableClickedHandler.bind(this));
    });
    this.dom.formSubmit.addEventListener('click', this.formSubmitClickHandler.bind(this));
  }
}

export default Booking;
