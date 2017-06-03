export default class CSSMatrix {
  rows = null;

  constructor() {
    this.reset();
  }

  set(i, j, val) {
    this.rows[i][j] = val;
  }

  get(i, j) {
    return this.rows[i][j];
  }

  transform({ skew, rotation, translation, scale }) {
    this.skew = skew || this.skew;
    this.rotation = rotation || this.rotation;
    this.translation = translation || this.translation;
    this.scale = scale || this.scale;
    return this.update();
  }

  reset() {
    this.skew = [0, 0];
    this.rotation = [0, 0, 0];
    this.translation = [0, 0, 0];
    this.scale = [1, 1, 1];
    this.rows = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  }

  scale(x=1, y=x, z=y) {
    this.scale = [x, y, z];
    this.update();
  }

  skew(x=0, y=0) {
    this.skew = [x, y];
    this.update();
  }

  translate(x=0, y=0, z=0) {
    this.rows[3][0] = x;
    this.rows[3][1] = y;
    this.rows[3][2] = z;
    this.translation = [x, y, z];
  }

  rotate(z=0, x=0, y=0) {
    this.rotation = [x, y, z];
    this.update();
  }

  update() {
    const x = this.scale[0], y = this.scale[1], z = this.scale[2];
    const cx = Math.cos(this.rotation[0]), sx = Math.sin(this.rotation[0]);
    const cy = Math.cos(this.rotation[1]), sy = Math.sin(this.rotation[1]);
    const cz = Math.cos(this.rotation[2]), sz = Math.sin(this.rotation[2]);

    this.rows[0][0] = x * (cy * cz);
    this.rows[0][1] = y * (Math.tan(this.skew[1]) - (cy * sz));
    this.rows[0][2] = z * sy;

    this.rows[1][0] = x * (Math.tan(this.skew[0]) + (sx * sy * cz) + (cx * sz));
    this.rows[1][1] = y * (-sx * sy * sz + cx * cz);
    this.rows[1][2] = z * (-sx * cy);

    this.rows[2][0] = x * (-cx * sy * cz + sx * sz);
    this.rows[2][1] = y * (cx * sy * sz + sx * cz);
    this.rows[2][2] = z * (cx * cy);

    return this;
  }

  toCSS() {
    const inputs = this.rows.reduce((str, row) => {
      if(!str.length) return row.join(',');
      return [str, row.join(',')].join(',');
    }, '');

    return `matrix3d(${inputs})`
  }
}
