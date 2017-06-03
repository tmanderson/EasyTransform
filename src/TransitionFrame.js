import CSSMatrix from './CSSMatrix';

const ZERO = () => ({
  scale: [0, 0, 0],
  skew: [0, 0],
  rotation: [0, 0, 0],
  translation: [0, 0, 0]
});

export default class TransitionFrame {
  constructor({ easing, duration, delay, relative, transform }) {
    this.delay = delay;
    this.easing = easing;
    this.duration = duration;
    this.relative = relative;
    this.transform = Object.assign(ZERO(), transform);

    Object.assign(this.transform, {
      rotation: this.transform.rotation.map(v => (Math.PI * v)/180)
    });
  }

  from(matrix, dir=1) {
    const { rotation, skew, scale, translation } = matrix;
    const s = this.relative ? 1 : 0;

    matrix.transform({
      rotation: rotation.map((v, i) => s * v + dir * this.transform.rotation[i]),
      translation: translation.map((v, i) => s * v + dir * this.transform.translation[i]),
      skew: skew.map((v, i) => s * v + dir * this.transform.skew[i]),
      scale: scale.map((v, i) => s * v + dir * this.transform.scale[i])
    });

    return matrix;
  }
}
