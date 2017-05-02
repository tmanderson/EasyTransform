# Easy Transform v0.9.0

Easy Transform allows animation-like capabilities on HTML elements
through the power of [CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/transition).

What does "animation-like" mean? Internally, EZT uses transition events to
advance frames from one transform to another. Doing this, certain transitions
can acquire an near-animation (keyframed) appearance.

Both 2D and 3D CSS transforms can be used with EZT.

EZT provides interfaces through JavaScript and HTML `dataset`s.

View the [API documentation below](#api) or checkout the [examples](examples/index.html).

#### HTML Example
```html
<div
  data-ezt-loop
  data-ezt-alternate
  data-ezt-autostart
  data-ezt="
    duration(1s),
    rotate(80) scale(2, 2), // frame 1, duration = 1s
    wait(500),              // frame 2, duration = 500
    duration(100ms),
    rotate(-45)             // frame 3, duration = 100ms
    scale(1),               // frame 4 duration = 100ms
  "
>
</div>
```

#### JS Example
```javascript
  const t = new EZT(document.querySelector('div'));

  t.loop()
    .duration(100)
    .rotate(25)
    .wait(500)
    .duration(500)
    .skew(20)
    .wait(500)
    .duration(1000)
    .transform({
      rotate: 45,
      translate: [50, 50]
    })
    .call(function() { console.log('AT THE END!') })
    .start();
```

## API

### HTML Attributes
#### `data-ezt-loop` (boolean attribute)
Loop the animation sequence

#### `data-ezt-alternate` (boolean attribute)
Alternate the animation (once the end is reached, play back to the beginning)

#### `data-ezt-autostart` (boolean attribute)
Auto play the sequence

#### `data-ezt="transform, transform..."`
Each `transform` within the value is a non-prefixed method invocation.

**NOTE**: Commas (outside of argument lists, of course) delimit animation frames.
The newlines in the example above are just for clarity. Whitespace is ignored.

**example**
```
data-ezt="
  duration(100),            // set the frame duration to 100ms
  rotate(-20) scale(2),     // rotate the element -20 degrees and scale by 2 (over 100ms)
  duration(1000),           // set the frame duration to 1s
  rotate(45) skew(10),      // rotate 45 degrees and skew the x-axis by 10 degrees (over 1s)
  wait(500)                 // wait 500ms
  rotate()                  // rotate back to 0, 0
"
```

### Static methods

#### `EZT.run`
Finds all `data-ezt` elements on the page and creates their `EZT` instances.

### Instance methods

#### `EZT(HTMLElement) => EZTInstance`
Create an EZT instance on the given `HTMLElement`.

#### `loop() => EZTInstance`
Toggle animation looping

#### `alternate() => EZTInstance`
Toggle alternation of the animations direction (only applies to `loop`d animations)

#### `duration(`[CSSDuration](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-duration)`) => EZTInstance`
Set the duration for the following transforms

**example**
```javascript
EZT(document.querySelector('div'))
  .duration(500)
  .scale(2) // this scale will take 500 ms
  .duration(1000)
  .scale(1) // this scale (down) will take 1s
  .duration('2s')
  .translate(100, 100) // this translation will take 2s
```

#### `easing(`[CSSTransitionTimingFunction](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function)`) => EZTInstance`
Set the easing for the following transforms

**example**
```javascript
EZT(document.querySelector('div'))
  .easing('linear')
  .scale(2) // this scale will have linear easing
  .easing('east-out')
  .scale(1) // this scale (down) will have `ease-in` easing
  .easing('ease-in-out')
  .translate(100, 100) // this translation will have `ease-in-out` easing
```

#### `rotate() => EZTInstance`
No arguments will reset the rotation.

#### `rotate(z=0, x=0, y=0, add=true) => EZTInstance`
Rotate the element around a given set of axes (in degrees)

#### `scale(x=1, y=x, z=y) => EZTInstance`
Scale the element. With only one argument, the elements proportions are held.

#### `skew(x=0, y=0) => EZTInstance`
Skew the element.

#### `translate(x=0, y=0, z=0, add=true) => EZTInstance`
Translate (move) the element.

#### `transform({ ...transforms }) => EZTInstance`
To set multiple properties at once, the `transform` method can be used.

**example**
```javascript
EZT(document.querySelector('div'))
  .loop()
  .duration(500)
  .transform({   // Simultaneously rotate and scale over 500ms
    rotate: 45,
    scale: 2
  })
  .duration(1000)
  .transform({   // Simultaneously rotate and scale over 1s
    rotate: -45,
    scale: 0.2
  })
```

#### `EZTInstance.wait(t) => EZTInstance`
Wait `t` milliseconds before advancing to the next transform.

**example**
```javascript
EZT(document.querySelector('div'))
  .loop()
  .duration(1000)
  .transform({   // Simultaneously rotate and scale over 500ms
    rotate: 45,
    scale: 2
  })
  .wait(500)
  .scale(2) // scale 2x after 500ms
```

#### `EZTInstance.call(fn) => EZTInstance`
Call the function `fn`.

**example**
```javascript
EZT(document.querySelector('div'))
  .loop()
  .duration(1000)
  .transform({   // Simultaneously rotate and scale over 500ms
    rotate: 45,
    scale: 2
  })
  .call(() => console.log('DONE!')); // function called after 1s
```

#### `EZTInstance.reset() => EZTInstance`
Reset the instance to its original appearance.

#### `EZTInstance.start() => EZTInstance`
Start the animation sequence.
