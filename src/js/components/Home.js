import {templates} from '../settings.js';

class Home {
  constructor(container) {
    this.render(container);
  }

  render(container) {
    const generatedHTML = templates.homePage();

    this.dom = {};

    this.dom.wrapper = container;
    this.dom.wrapper.innerHTML = generatedHTML;
  }

}

export default Home;
