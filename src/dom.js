export default {
  hasAttr(el, ...attrs) {
    return attrs.reduce((passing, attr) => {
      if(!passing) return passing;
      return el.hasAttribute(attr);
    }, true);
  },

  attr(el, name, val) {
    if(!val) return el.getAttribute(name);
    el.setAttribute(name, val);
  },

  on(el, name, listener) {
    el.addEventListener(name, listener);
  },

  off(el, name, listener) {
    el.removeEventListener(name, listener);
  }
}