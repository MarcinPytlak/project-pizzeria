import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidget();

  }
  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    console.log(element);
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

  }
  initWidget(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
      console.log(thisBooking.dom.peopleAmount);
    });
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
      console.log(thisBooking.dom.hoursAmount);
    });
  }
}
export default Booking;