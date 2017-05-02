import CSSMatrix from './CSSMatrix';

let last = Array.prototype.last;
Array.prototype.last = function() {
  if(last) return last.apply(this);
  return this[this.length-1];
};

export default class EasyTransform {
  static instances = [];

  static run() {
    const els = document.querySelectorAll('[data-ezt]:not([data-ezt-enabled])');
    Array.from(els).map(el => el._ezt = new EasyTransform(el));
  }

  _mat = null;
  _dir = 1;
  _loop = false;
  _offset = null;
  _delay = 0;
  _easing = 'linear';
  _duration = '500ms';

  constructor(el) {
    this.playing = false;

    this.el = el;

    this._mat = new CSSMatrix();
    this._offset = [el.offsetWidth/2, el.offsetHeight/2];
    this._delay = el.hasAttribute('data-ezt-delay') && el.hasAttribute('data-ezt-delay');
    this._loop = el.hasAttribute('data-ezt-loop');
    this._alternate = el.hasAttribute('data-ezt-alternate');

    this.easing(el.getAttribute('data-ezt-duration'));
    this.duration(el.getAttribute('data-ezt-easing'));

    this.frame = 0;
    // first frame is the element as-styled
    this.frames = [ () => this.reset(true) ];

    this.reset();

    this.play = this.play.bind(this);
    this.next = this.next.bind(this);
    this.reset = this.reset.bind(this);

    this.el.addEventListener('transitionend', this.next);
    EasyTransform.instances.push(this);

    if(el.dataset.ezt && el.dataset.ezt.length) {
      // parse `data-ezt` argument for any defined frames
      const frames = el.dataset.ezt.split('')
        .reduce(({ active, frames }, char, i, arr) => {
          switch(char) {
            case '\n':
            case '\r':
            case '\r\n':
            case ' ': break;
            case ',': // Adding another argument if there's an active frame
              if(frames.last()[active]) frames.last()[active].push('');
              else frames.push({});
            break;
            case '(': // start accumulating args for this transform
              Object.assign(frames.last(), { [active]: [''] });
            break;
            case ')': // stop accumulating args for this transform
              active = '';
            break;
            default: // if `active` is in the current frame, accumulate arg value
              if(frames.last()[active]) {
                frames.last()[active][frames.last()[active].length - 1] += char;
              }
              else {
                active += char;
              }
          }

          return i === arr.length - 1 ? frames : { active, frames };
        }, { active: '', frames: [ {} ] });

      if(frames.length) frames.forEach(frame => this.transform(frame));
      if(el.hasAttribute('data-ezt-autoplay')) this.start();
    }
  }

  start() {
    this.playing = true;
    setTimeout(this.play, 100);
  }

  next() {
    this.frame += this._dir;
    const end = (this.frame < 0 || this.frame >= this.frames.length);

    if(!this._loop && end) return;

    if(end && this._alternate) {
      this._dir *= -1;
      this.frame += this._dir;
    }
    else if(end) {
      return this.reset(true);
    }

    this.play();
  }

  stop() {
    this.playing = false;
  }

  play() {
    if(this.playing && this.frame >= 0 && this.frame < this.frames.length) {
      const current = this._mat.toCSS();
      const frame = this.frames[this.frame].call(this);

      if(frame instanceof Promise) {
        return frame.then(() => {
          if(current === this._mat.toCSS()) return this.next();
          this.el.style.transform = this._mat.toCSS();
        });
      }
      else if(current !== this._mat.toCSS()) {
        this.el.style.transform = this._mat.toCSS();
      }
      else {
        this.next();
      }
    }

    return this;
  }

  addFrame(frame) {
    this.frames.push(frame);
    return this;
  }

  easing(easing) {
    if(!easing) return this;
    this._easing = easing;
    this.el.style.transition = `transform ${this._duration} ${this._easing}`;
    return this;
  }

  duration(duration) {
    if(!duration) return this;

    this._duration = typeof duration === 'number' ?
      duration = `${duration}ms` :
      duration;

    this.el.style.transition = `transform ${this._duration} ${this._easing}`;
    return this;
  }

  alternate() {
    this._alternate = !this._alternate;
    return this;
  }

  loop() {
    this._loop = !this._loop;
    return this;
  }

  wait(t) {
    return this.addFrame(() => {
      return new Promise(resolve => setTimeout(resolve, t))
    });
  }

  scale(x=1, y, z) {
    return this.transform({ scale: [ x, y, z ] });
  }

  skew(x=0, y=0) {
    return this.transform({ skew: [x, y] });
  }

  translate(x=0, y=0, z=0, add=true) {
    if(arguments.length === 0) {
      add = false;
      z = x = y = 0;
    }

    return this.transform({ translate: [x, y, z, add] });
  }

  rotate(z=0, x=0, y=0, add=true) { // assuming z is default with one arg
    if(arguments.length === 0) {
      add = false;
      z = x = y = 0;
    }

    return this.transform({ rotate: [ z, x, y, add ] });
  }

  call(fn) {
    this.addFrame(() => new Promise((resolve, reject) => {
      try {
        return resolve(fn.call(this))
      }
      catch(e) { return reject(e) };
    }));

    return this;
  }

  reset(apply=false) {
    const self = this;

    this.frame = 0;
    this._skew = [0, 0];
    this._rotation = [0, 0, 0]; // z, x, y
    this._translation = [0, 0, 0];

    this._mat.reset();
    if(apply) this.el.style.transform = this._mat.toCSS();
  }

  transform(transforms) {
    if(!Object.keys(transforms).length) return this;

    return this.addFrame(() => {
      Object.keys(transforms).forEach(prop => {
        const transform = [].concat(transforms[prop]);

        switch(prop) {
          case "rotate":
            let [ z=0, x=0, y=0, add=true ] = transform;
            this._rotation = [ z, x, y ].map((a, i) => (add ? this._rotation[i] : 0) + a  * this._dir);
            this._mat.rotate(...this._rotation.map(a => (a*Math.PI)/180));
          break;
          case "translate":
            this._translation = transform.slice(0, 3).map((v, i, translation) => {
              if(translation[3]) return this._translation[i] + this._offset[i] + v * this._dir;
              return this._offset[i] + v * this._dir
            });
            this._mat.translate(...this._translation);
          break;
          case "skew":
            this._skew = transform;
            this._mat.skew(...transform.map(v => (v*Math.PI)/180 * this._dir));
          default:
            this._mat[prop] ?
              this._mat[prop](...transform) :
              this[prop](...transform);
        }
      });
    });
  }

  getTransform() {
    return {
      origin: this._offset,
      translation: this._translation,
      rotation: this._rotation,
      skew: this._skew
    };
  }
}
