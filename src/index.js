import CSSMatrix from './CSSMatrix';

export default class EasyTransform {
  constructor(el) {
    this.playing = false;

    this._mat = new CSSMatrix();
    this._dir = 1;
    this._loop = false;

    this.frame = 0;
    this.el = el;
    this.rotation = [0, 0, 0];
    this.frames = [];

    this.el.style.transition = 'transform 500ms ' + TIMING_FUNCTIONS.BOUNCE_OUT;
    this.el.addEventListener('transitionend', this.next.bind(this));
  }

  start() {
    this.playing = true;
    setTimeout(this.play.bind(this), 100);
  }

  next() {
    this.frame += this._dir;

    if(this._loop && this.frame >= this.frames.length) {
      if(this._alternate) {
        this._dir *= -1;
        this.frame += this._dir * 2;
      }
      else {
        this.frame = 0;
        this.mat = new CSSMatrix();
      }
    }

    this.play();
  }

  stop() {
    this.playing = false;
  }

  play() {
    if(this.playing && this.frame < this.frames.length) {
      if(this._dir < 0) {
        // TODO: Need to invert operations called;

      }

      let frame = this.frames[this.frame]();

      if(frame instanceof Promise) frame.then(this.next.bind(this));
      this.el.style.transform = this._mat.toCSS();
    }

    return this;
  }

  addFrame(frame) {
    this.frames.push(frame);
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
    return this.addFrame(() => new Promise(resolve => setTimeout(resolve, t)));
  }

  scale(x, y, z) {
    return this.addFrame(this._mat.scale.bind(this._mat, x, y, z));
  }

  skew(x, y) {
    return this.addFrame(this._mat.skew.bind(this._mat, x, y));
  }

  translate(x, y, z) {
    return this.addFrame(this._mat.translate.bind(this._mat, x, y, z));
  }

  rotate(z=0, x=0, y=0, add=false) { // assuming z is default with one arg
    return this.addFrame(() => {
      if(add) {
        x += this.rotation[0];
        y += this.rotation[1];
        z += this.rotation[2];
      }

      this._mat.rotate((z * Math.PI)/180, (x * Math.PI)/180, (y * Math.PI)/180);
      this.rotation = [ x, y, z ];
    });
  }

  transform(transform) {
    const transforms = Object.keys(transform)
      .map(prop => {
        return this._mat[prop].bind(this._mat, ...[].concat(transform[prop]))
      });

    return this.addFrame(() => transforms.forEach(transform => transform()));
  }
}

const t = new EasyTransform(document.querySelector('div'));

t.alternate()
  .loop()
  .rotate(25)
  .wait(1000)
  .transform({
    rotate: 45,
    translate: [100, 100]
  })
  .start();
