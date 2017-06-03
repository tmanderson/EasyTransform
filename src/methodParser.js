// TODO: This is only used for the HTML `data-ezt` value parsing. Which
// also should be moved into its own module.
let last = Array.prototype.last;
Array.prototype.last = function() {
  if(last) return last.apply(this);
  return this[this.length-1];
};

const newFrame = () => ({
  skew: [''],
  scale: [''],
  translate: [''],
  rotate: [''],
  duration: [''],
  easing: [''],
  wait: [''],
});

export default string => string.split('')
  .reduce(({ arg, active, frames }, char, i, arr) => {
    switch(char) {
      case '\n':       // ignore all whitespace  |
      case '\r':       // ignore all whitespace  |
      case '\r\n':     // ignore all whitespace \ /
      case ' ': break; // ignore all whitespace  ˅
      case ',': // Adding another argument if there's an active frame
        if(frames.last()[active] && frames.last()[active][arg]) {
          frames.last()[active][arg] = parseFloat(frames.last()[active][arg])
          arg += 1;
        }
        else frames.push(newFrame());
      break;
      case '(': // start accumulating args for this transform
      break;
      case ')': // stop accumulating args for this transform
        Object.keys(frames.last())
          .forEach(k => {
            const last = frames.last()[k];
            frames.last()[k] = /^(d|e|w)/.test(k)
              ? last[0]
              : last.map(v => v ? parseFloat(v) : 0)
          });
        active = '';
        arg = 0;
      break;
      default: // if `active` is in the current frame, accumulate arg value
        if(frames.last()[active]) frames.last()[active][arg] += char;
        else active += char;
    }

    return i === arr.length - 1 ? frames : { arg, active, frames };
  }, { arg: 0, active: '', frames: [ newFrame() ] });
