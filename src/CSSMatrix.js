export default class CSSMatrix {
  this.rows = null;

  constructor() {
    this.reset();
  }

  reset() {
    this.rows = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  }

  scale(x=0, y=0, z=0) {
    this.rows[0][0] *= x;
    this.rows[1][1] *= y;
    this.rows[2][2] *= z;
  }

  skew(x=0, y=0) {
    this.rows[0][1] = (this.rows[0][1] || 1) * Math.tan(y);
    this.rows[1][0] = (this.rows[1][0] || 1) * Math.tan(x);
  }

  translate(x=0, y=0, z=0) {
    this.rows[3][0] = x;
    this.rows[3][1] = y;
    this.rows[3][2] = z;
  }

  rotate(z=0, x=0, y=0) {
    const cx = Math.cos(x), sx = Math.sin(x);
    const cy = Math.cos(y), sy = Math.sin(y);
    const cz = Math.cos(z), sz = Math.sin(z);

    this.rows[0][0] = cy * cz;
    this.rows[0][1] = -cy * sz;
    this.rows[0][2] = sy;

    this.rows[1][0] = sx * sy * cz + cx * sz;
    this.rows[1][1] = -sx * sy* sz + cx * cz;
    this.rows[1][2] = -sx * cy;

    this.rows[2][0] = -cx * sy * cz + sx * sz;
    this.rows[2][1] = cx * sy * sz + sx * cz;
    this.rows[2][2] = cx * cy;
  }

  toCSS() {
    const inputs = this.rows.reduce((str, row) => {
      if(!str.length) return row.join(',');
      return [str, row.join(',')].join(',');
    }, '');

    return `matrix3d(${inputs})`
  }
}
