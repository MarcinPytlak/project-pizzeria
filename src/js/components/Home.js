/* global dataSource */
import { templates, select} from '../settings.js';
import utils from '../utils.js'; 
class Home{
  constructor(element){
    const thisHome = this;
    thisHome.render(element);

  }
  render(element){
    const thisHome = this;
    this.data = dataSource.home;
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.homeContainer = thisHome.dom.wrapper.querySelector(select.containerOf.homepage);

    const generatedHTML = templates.homepageWidget();
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.homepage);
    menuContainer.appendChild(generatedDOM);
    for(let elem in this.data){
      let elemId = this.data[elem];
      const generatedHTML = templates.homeWidget(elemId);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.home);
      menuContainer.appendChild(generatedDOM);
    }

    
  }
}
export default Home;