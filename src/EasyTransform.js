import dom from './dom';
import parseFrames from './methodParser';
import TransformFrame from './TransformFrame';

export default class EasyTransform {
  static instances = [];

  static run() {
    const els = document.querySelectorAll('[data-ezt]:not([data-ezt-enabled])');

    Array.from(els)
      .filter(el => !el._ezt).map(el => {
        const frames = parseFrames(el.dataset.ezt);

        el._ezt = new EasyTransform({
          target: el,
          repeat: el.dataset.eztRepeat,
          duration: el.dataset.eztDuration,
          alternate: 'eztAlternate' in el.dataset,
          autoplay: 'eztAutoplay' in el.dataset,
          frames,
        });
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

    this.el = target;
    this.playing = autoplay;

    this._delay = delay;
    this._repeat = repeat;
    this._alternate = alternate;
    this._duration = duration;

    this._offset = [
      target.offsetWidth/2,
      target.offsetHeight/2
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

    this.el.addEventListener('transitionend', this.next);
    EasyTransform.instances.push(this);

    if(frames && frames.length) {
      if(frames.length) frames.forEach(this.addFrame);
    }

    this.transform = TransformFrame.zero();
    if(this.playing) this.start();
  }

  start() {
    this.playing = true;
    setTimeout(this.play, 100);
  }

  next() {
    clearTimeout(this._timeout);

    if(this.frame.onComplete) this.frame.onComplete();

    this._frame += this._dir;
    const end = (this._frame < 0 || this._frame >= this.frames.length);

    if(this._repeat < 0 && end) return;

    if(end && this._alternate) {
      this._dir *= -1;
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
      this.transform = this.frame.transition(this.el, this.transform);
      this.el.innerText = this._frame;
      this._timeout = setTimeout(this.next, (this.frame.delay + this.frame.duration) + 10);
    }

    return this;
  }

  addFrame(frame) {
    let lastFrame = this.frames[this.frames.length - 1];
    this.frames.push(new TransformFrame(frame));
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

  scale(x=1, y=x, z=y) {
    this.addFrame({ transform: { scale: [x, y, z] } });
    return this;
  }

  skew(x=0, y=0) {
    this.addFrame({ transform: { skew: [x, y] } });

    return this;
  }

  translate(x=0, y=0, z=0, add=true) {
    if(arguments.length === 0) {
      add = false;
      z = x = y = 0;
    }

    this.addFrame({ transform: { translate: [z, x, y] }, relative: add });

    return this;
  }

  rotate(z=0, x=0, y=0, add=true) { // assuming z is default with one arg
    if(arguments.length === 0) {
      add = false;
      z = x = y = 0;
    }

    return this.addFrame({
      transform: {
        rotate: [ z, x, y ]
      },
      relative: add
    });
  }

  wait(t) {
    this.frames[this.frames.length-1].delay = t;
    // return this.addFrame(() => new Promise(resolve => setTimeout(resolve, t)));
    return this;
  }

  call(fn) {
    this.frames[this.frames.length-1].onComplete = fn;
    return this;
  }

  transform(transform) {
    return this.addFrame({
      transform: Object.keys(transform)
        .reduce((out, prop) => Object.assign(out, { [prop]: [].concat(transform[prop]) }), {})
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
