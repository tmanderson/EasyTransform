import CSSMatrix from './CSSMatrix';
import { css, on } from './dom';
import parseFrames from './methodParser';
import TransitionFrame from './TransitionFrame';

export default class EasyTransform {
  static instances = [];

  static run() {
    let frames;
    const els = document.querySelectorAll('[data-ezt]:not([data-ezt-enabled])');

    Array.from(els)
      .filter(el => !el._ez)
      .map(el => {
        el._ez = {};

        const opts = {
          target: el,
          repeat: 'eztRepeat' in el.dataset ? el.dataset.eztRepeat : 0,
          duration: 'eztDuration' in el.dataset ? el.dataset.eztDuration : 500,
          alternate: 'eztAlternate' in el.dataset ? el.dataset.eztAlternate : true,
          autoplay: 'eztAutoplay' in el.dataset
        };

        if('eztHover' in el.dataset) {
          frames = parseFrames(el.dataset.eztHover);

          el._ez.hover = new EasyTransform(Object.assign({}, opts, {
            frames
          }));

          on(el, 'mouseover', () => el._ez.hover.start());
          on(el, 'mouseout', () => el._ez.hover.stop());
        }
      });
  }

  _dir = 1;
  _offset = null;
  _frame = 0;

  get frame() { return this.frames[this._frame]; }
  set frame(frame) { this._frame = frame; }

  _repeat = 0;
  _delay = 0;
  _easing = 'linear';
  _duration = 500;

  constructor(opts) {
    const {
      target,
      frames,
      delay = 0,
      repeat = 0,
      alternate = true,
      duration=1000,
      autoplay = false
    } = opts;

    this._frame = 0;

    this.el = target || opts;
    this.playing = false;

    this._delay = delay;
    this._repeat = repeat;
    this._alternate = alternate;
    this._duration = duration;

    this._offset = [
      this.el.offsetWidth/2,
      this.el.offsetHeight/2
    ];

    // first frame is the element as-styled
    // const transform = getComputedStyle(this.el, null).transform;
    Object.keys(EasyTransform.prototype)
      .forEach(prop => {
        if(typeof this[prop] === 'function') {
          this[prop] = this[prop].bind(this);
        }
      });

    this.frames = [];

    on(this.el, 'transitionend');
    EasyTransform.instances.push(this);
    this.matrix = new CSSMatrix();

    if(frames && frames.length) {
      frames.forEach(frame => this.transform(frame));
    }
    if(autoplay) this.start();
  }

  start() {
    if(this.playing) return;
    this.playing = true;
    setTimeout(this.play, 100);
  }

  next() {
    const end = (this._frame + this._dir < 0 || this._frame + this._dir >= this.frames.length);
    clearTimeout(this._timeout);

    if(this.frame.onComplete) this.frame.onComplete();

    this._frame += this._dir;

    if(this._repeat < 0 && end) return;

    if(end && this._alternate) {
      this._dir *= -1;
      if(this._dir > 0) this.matrix.reset();
      this._frame += this._dir; // + 1 * this._dir;
    }
    else if(end) {
      this._dir = 1;
      this._frame = 0;
    }

    this.play();
  }

  stop() {
    this.playing = false;
  }

  play() {
    if(this.playing && this.frame) {
      if(typeof this.frame === 'function') {
        this.frame().then(this.next);
        return this;
      }

      const { duration, easing, delay } = this.frame;

      this.matrix = this.frame.from(this.matrix, this._dir);

      css(this.el, {
        transitionProperty: 'transform',
        transitionDuration: `${duration}${typeof duration !== 'string' ? 'ms' : ''}`,
        transitionDelay: `${delay}${typeof delay !== 'string' ? 'ms' : ''}`,
        transitionTimingFunction: easing,
      });

      this.el.innerText = this._frame;
      this.el.style.transform = this.matrix.toCSS();

      this._timeout = setTimeout(this.next, (parseInt(this.frame.delay, 10) + parseInt(this.frame.duration, 10) + 10));
    }

    return this;
  }

  addFrame(frame) {
    if(typeof frame === 'function') {
      this.frames.push(frame);
      return this;
    }

    const lastFrame = this.frames[this.frames.length-1];

    const frameConfig = Object.assign({}, frame, {
      easing: frame.easing || this._easing,
      duration: frame.duration || this._duration,
      delay: frame.delay || this._delay
    });

    this.frames.push(new TransitionFrame(frameConfig));

    if(lastFrame) lastFrame._id = this.frames.length - 1;
    return this;
  }

  easing(easing) {
    if(!easing) return this;
    this._easing = easing;
    return this;
  }

  duration(duration) {
    if(!duration) return this;
    this._duration = duration;
    return this;
  }

  alternate() {
    this._alternate = !this._alternate;
    return this;
  }

  loop(loop=!this._repeat) {
    this._repeat = loop;
    return this;
  }

  scale(x=1, y=x, z=y, add=true) {
    this.addFrame({
      transform: { scale: [x, y, z] },
      relative: add
    });

    return this;
  }

  skew(x=0, y=0, add=true) {
    this.addFrame({
      transform: { skew: [x, y] },
      relative: add
    });

    return this;
  }

  translate(x=0, y=0, z=0, add=true) {
    if(arguments.length === 0) {
      add = false;
      z = x = y = 0;
    }

    this.addFrame({
      transform: { translation: [z, x, y] },
      relative: add
    });

    return this;
  }

  rotate(z=0, x=0, y=0, add=true) { // assuming z is default with one arg
    if(arguments.length === 0) {
      add = false;
      z = x = y = 0;
    }

    return this.addFrame({
      transform: { rotation: [ x, y, z ] },
      relative: add
    });
  }

  wait(t) {
    return this.addFrame(() => new Promise(resolve => setTimeout(resolve, t)));
  }

  call(fn) {
    this.frames[this.frames.length-1].onComplete = fn;
    return this;
  }

  transform({ rotate=[], translate=[], skew=[], scale=[], duration, easing, wait }) {
    const [ rz=0, rx=0, ry=0 ] = (typeof rotate === 'number' ? [rotate] : rotate);
    const [ skewX=0, skewY=0 ] = skew;
    const [ scaleX=0, scaleY=scaleX, scaleZ=scaleY ] = scale;
    const [ tx=0, ty=0, tz=0 ] = translate;

    let relative = true;

    if(duration) this._duration = duration;
    if(easing) this._easing = easing;

    return this.addFrame({
      duration: duration || this._duration,
      easing: easing || this._easing,
      delay: wait,
      relative,
      transform: {
        skew: [skewX, skewY],
        scale: [scaleX, scaleY, scaleZ, !scale.includes(false)].map((v, i, a) => {
          return i < 3 ? (v || a[i-1] || 0) : v;
        }),
        rotation: [rx, ry, rz],
        translation: [tx, ty, tz]
      }
    });
  }

  getTransform() {
    const { skew, scale, rotation, translation } = this.matrix.transform;
    return { skew, scale, rotation, translation };
  }
}
