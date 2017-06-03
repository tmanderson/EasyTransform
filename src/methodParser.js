// TODO: This is only used for the HTML `data-ezt` value parsing. Which
// also should be moved into its own module.
let last = Array.prototype.last;
Array.prototype.last = function() {
  if(last) return last.apply(this);
  return this[this.length-1];
};

const newFrame = () => ({
  skew: [0, 0],
  scale: [1, 1, 1],
  translate: [0, 0, 0],
  rotate: [0, 0, 0]
});

export default string => string.split('')
  .reduce(({ active, frames }, char, i, arr) => {
    switch(char) {
      case '\n':       // ignore all whitespace  |
      case '\r':       // ignore all whitespace  |
      case '\r\n':     // ignore all whitespace \ /
      case ' ': break; // ignore all whitespace  ˅
      case ',': // Adding another argument if there's an active frame
        if(frames.last()[active]) {
          frames.last()[active] = [parseFloat(frames.last()[active]) || frames.last()[active]];
          frames.last()[active].push('');
        }
        else frames.push(newFrame());
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
  }, { active: '', frames: [ newFrame() ] });
