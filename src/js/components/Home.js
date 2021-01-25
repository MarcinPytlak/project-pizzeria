/* global dataSource Flickity  */
import { templates, select} from '../settings.js';
import utils from '../utils.js'; 
class Home{
  constructor(element){
    const thisHome = this;
    thisHome.render(element);
    thisHome.initActions();

  }
  render(element){
    const thisHome = this;
    this.data = dataSource.home;
    const generatedHTML = templates.homepageWidget();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    thisHome.dom.homeContainer = thisHome.dom.wrapper.querySelector(select.containerOf.homepage);

 
    for(let elem in this.data){
      let elemId = this.data[elem];
      const generatedHTML = templates.homeWidget(elemId);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.home);
      menuContainer.appendChild(generatedDOM);
    }
  }
  initActions(){
    const thisHome = this;
    thisHome.dom.carouselContainer = thisHome.dom.wrapper.querySelector(select.containerOf.carousel);
    thisHome.dom.buttons = thisHome.dom.wrapper.querySelectorAll('.object');
    thisHome.dom.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.dom.navLinks = document.querySelectorAll(select.nav.links);
    // eslint-disable-next-line no-unused-vars
    let flkty = new Flickity( thisHome.dom.carouselContainer, {
    
      cellAlign: 'left',
      contain: true,
      wrapAround: true,
      autoPlay: 3000,
    });
    [...thisHome.dom.buttons].forEach(elem => {
      elem.addEventListener('click', function(){
        if(elem.classList.contains('order')){
          thisHome.dom.pages[0].classList.remove('active');
          thisHome.dom.pages[1].classList.add('active');
          thisHome.dom.navLinks[0].classList.remove('active');
          thisHome.dom.navLinks[1].classList.add('active');
          window.location.hash = '#/order';
        } 
        if(elem.classList.contains('reserve')){
          thisHome.dom.pages[0].classList.remove('active');
          thisHome.dom.pages[2].classList.add('active');
          thisHome.dom.navLinks[0].classList.remove('active');
          thisHome.dom.navLinks[2].classList.add('active');
          window.location.hash = '#/booking';

        }
      });
    });
  }
}
export default Home;