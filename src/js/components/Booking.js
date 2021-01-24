import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js'; 
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking{
  constructor(element){
    const thisBooking = this;
    console.log(element);
    thisBooking.tableSelected = [];
    thisBooking.filtersValue = [];
    thisBooking.render(element);
    thisBooking.initWidget();
    thisBooking.getData();

  }
  getData(){
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.pickedDate.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.pickedDate.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,

      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,

      ],
    };
    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'), 
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };
   
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrentResponse, eventsRepeatResponse]){
        
        thisBooking.parseData(bookings, eventsCurrentResponse, eventsRepeatResponse);
      });

  }
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = thisBooking.pickedDate.minDate;
    const maxDate = thisBooking.pickedDate.maxDate;
    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }
  
  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
   
 
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.pickedDate.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.pickedHour.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }
   
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      }else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    [...thisBooking.dom.tables].forEach(table => {
      if(table.classList.contains('selected')){
        table.classList.remove('selected');
      }
    });
  }

  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    console.log(thisBooking.dom.wrapper);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.pickedDate = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.pickedHour = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.totalTables = thisBooking.dom.wrapper.querySelector(select.booking.allTables);
    thisBooking.dom.orderConfirmation = thisBooking.dom.wrapper.querySelector(select.booking.orderConfirmation);
    thisBooking.dom.date = thisBooking.dom.wrapper.querySelector(select.booking.date);
    thisBooking.dom.duration = thisBooking.dom.wrapper.querySelector(select.booking.duration);
    thisBooking.dom.people = thisBooking.dom.wrapper.querySelector(select.booking.people);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
  }
  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    const bookingData = {
      date: thisBooking.pickedDate.value,
      hour: thisBooking.pickedHour.value,
      table: parseInt(thisBooking.tableSelected[0], 10),
      duration: parseInt(thisBooking.dom.duration.value, 10),
      people: parseInt(thisBooking.dom.people.value, 10),
      starters: thisBooking.filtersValue,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
    
    console.log(bookingData);

    const options ={
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponde){
        console.log('parsedResponse', parsedResponde);
        thisBooking.makeBooked(bookingData.date, bookingData.hour, bookingData.duration, bookingData.table);
        thisBooking.updateDOM();
      });
  }
  initWidget(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.pickedDate = new DatePicker(thisBooking.dom.pickedDate);
    thisBooking.pickedHour = new HourPicker(thisBooking.dom.pickedHour);
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
      console.log(thisBooking.dom.peopleAmount);
    });
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
      console.log(thisBooking.dom.hoursAmount);
    });
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
    thisBooking.dom.totalTables.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });
    thisBooking.dom.orderConfirmation.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });
    
    [...thisBooking.dom.starters].forEach(elem =>{
      elem.addEventListener('click', function(){
             
        if(elem.classList.contains('choosen') && thisBooking.filtersValue.includes(elem.value)){
          let removedValue = thisBooking.filtersValue.indexOf(elem.value);
          elem.classList.remove('choosen');
          thisBooking.filtersValue.splice(removedValue, 1);
        } else {
          elem.classList.add('choosen');
          thisBooking.filtersValue.push(elem.value);
        }
        
      });
    });
      
  }
  initTables(tables){
    const thisBooking = this;
    thisBooking.allTables = tables.path[1];
    thisBooking.tables = tables.path[0];
    thisBooking.divs = thisBooking.dom.totalTables.querySelectorAll('div');
    if(thisBooking.tables.classList.contains('table')){
      if(thisBooking.tables.classList.contains('booked')){
        alert('ten stolik jest zajęty');
      }else{
        let tableId = thisBooking.tables.getAttribute('data-table');
        let removedValue = thisBooking.tableSelected.indexOf(tableId);
        //thisBooking.tableSelected.push(tableId);
        if(thisBooking.tables.classList.contains('selected')){
          thisBooking.tables.classList.remove('selected');
          thisBooking.tableSelected.splice(removedValue, 1);
        } else {
          [...thisBooking.dom.tables].forEach( item => {
            if (item.classList.contains('selected')) {
              item.classList.remove('selected');
              thisBooking.tableSelected.splice(removedValue, 1);
            }
          });
          thisBooking.tables.classList.add('selected');
          thisBooking.tableSelected.push(tableId);
        }
      }
    }
  }
}
export default Booking;