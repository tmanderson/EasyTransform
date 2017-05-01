export default class Animation {
  constructor(...frames) {
    this.id = EasyTransform.stylesheet.cssRules.length;

    const inc = 100/frames.length;

    const css = `
      @keyframes ${anim}-${id} {
        ${frames.map((frame, i) => {
          return `
          ${i * inc}% {
            ${Object.keys(frame).map(k => {
              return `${k}: ${frame[k]};`;
            })}
          }`})
        })
      }`;

    EasyTransform.stylesheet.insertRule(css, 0);
  }

  run(el) {

  }
}
