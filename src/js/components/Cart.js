import {select, settings, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProducts.js';
class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    //thisCart.add();
    thisCart.getElements(element);
    thisCart.initActions();
  }
  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      // console.log('event.detail.cartProduct');
      thisCart.remove(event.detail.cartProduct);

    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sentOrder();
    });
  }
  sentOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    const payload = {
      adress : thisCart.dom.address.value,
      phone : thisCart.dom.phone.value,
      price: thisCart.totalPrice,
      subtotal: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      delivery: thisCart.deliveryFee,
      products : [],
    };
    for(let prod of thisCart.products){
      payload.products.push(prod.getData());
    }
    const options ={
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponde){
        console.log('parsedResponse', parsedResponde);
      });
  }
  remove(product){
    const thisCart = this;
    const indexOfProduct = thisCart.products.indexOf(product);
    const removeValue = thisCart.products.splice(indexOfProduct, 1);
    product.dom.wrapper.remove();
    thisCart.update();
    console.log(removeValue);

  }
  add(menuProduct){
    const thisCart = this;
      
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      
    // const menu = thisCart.dom.productList.querySelector(thisCart.dom.productList);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      

    thisCart.update();
  }
  update(){
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    for(let productId of thisCart.products){
      thisCart.totalNumber += productId.amount;
      thisCart.subtotalPrice += productId.price;
    }
    thisCart.totalPrice;
    if(Object.entries(thisCart.products).length ===0){
      thisCart.totalPrice = 0;
      thisCart.dom.deliveryFee.innerHTML = 0;
    }else{
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    }
      
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    for(let elementTotalPrice of thisCart.dom.totalPrice){
      elementTotalPrice.innerHTML = thisCart.totalPrice;
    }
     
  }
}
export default Cart;