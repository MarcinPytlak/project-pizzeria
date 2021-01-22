import { templates} from '../settings.js';
//import utils from '../utils.js'; 
class Home{
  constructor(element){
    const thisHome = this;
    thisHome.render(element);
    console.log(element);
  }
  render(element){
    const thisHome = this;
    const generatedHTML = templates.homepageWidget();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }
}
export default Home;