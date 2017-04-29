((() => {
	Math.toRad = d => d*0.0174532925
	Math.toDeg = r => r/0.0174532925
	function History() { return this; };

	//Not sure if history is the correct term for this guy anymore...
	History.prototype = {
		length: 0,
		add(t, m, s) {
			this[this.length] = {type: t, matrix: m, string: s};
			this.length++;
		},
		last(type) {
			var i = this.length;
			while(i--) {
				if(this[i].type === type) {
					return this[i];
				}
			}
			return undefined;
		},
		empty() {
			for(var t in this) {
				delete this[t];
			}
			this.length = 0;
		}
	}

	function easyTransform(el){
		return new easyTransformEl(el);
	}

	function easyTransformEl(el) {
		this.el = el;
	}

	easyTransformEl.prototype = {
		current: [1,0,0,1,0,0],
		hist: new History(),
		saved: {},

		stopTransform() {
			this.el.style.webkitTransform = this.getLiveTransform();
			return this;
		},

		//TODO: Make adding of rotations and other transforms optional.
		rotate(a) {
            var last = this.hist.last('rotate');
            var r = (last ? Math.acos(last.matrix[0]) + Math.toRad(a) : Math.toRad(a));
            var m;

            if(r.toString().split('.')[1].length > 4) r = Math.round(r*10000)/10000

            if(last) {
			 	m = [Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r), 0, 0];
			 } else {
				m = [Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r), 0, 0];
			}

            //Check if rotation already in place...
            if(last) this.removeTransform(last.matrix);
            this.addTransform(m);

            this.hist.add('rotate', m, 'rotate(' + a + 'deg)');
            this.setStyle(this.current);

            return this;
        },

		translate(x, y) {
			var m = [1,0,0,1,x,y];

			this.current[4] = x;
			this.current[5] = y;

			this.hist.add('translate', m.toString(), 'translate(' + x + 'px, ' + y + 'px)');
			this.setStyle(this.current);

			return this;
		},

		scale(x, y) {
			if(!y) y = x;
			var m = [x,0,0,y,0,0];

			this.current[0] = m[0];
			this.current[3] = m[3];

			this.hist.add('scale', m, 'scale(' + m[0] + ', ' + m[3] + ')');
			console.log(this.current);
			this.setStyle(this.current);

			return this;
		},

		skew(x, y) {
			var m = [1,Math.tan(Math.toRad(y)),Math.tan(Math.toRad(x)),1,0,0];
			
			this.current[1] = m[1];
			this.current[2] = m[2];

			this.hist.add('skew', m, 'skew(' + x + 'deg, ' + y + 'deg)');
			this.setStyle(this.current);

			return this;
		},

		transform(t) {
			var t = t.match(/([a-z]+(?=\()|-?[0-9]+(deg|px)?(?=,)? ?)+/ig);
			console.log(t);
			return this;
		},

		reset() {
			this.current = [1,0,0,1,0,0];
			this.hist.empty();
			this.setStyle(this.current);

			return this;
		},

		//Since rotation affects all vectors, need to make check for rotation and deeeeeee-vide!
		getRotation(end) {
			if(end) return this.current;
			return Math.round(Math.toDeg(Math.acos(this.getLiveMatrix()[0])));
		},

		getTranslation(end) {
			if(end) return this.current;
			return [this.getLiveMatrix()[5], this.getLiveMatrix()[6]];
		},

		getScale(end) {
			if(end) return this.current;
			return [this.getLiveMatrix()[0], this.getLiveMatrix()[3]];
		},

		getSkew(end) {
			if(end) return [Math.toDeg(Math.atan(this.current[1])), Math.toDeg(Math.atan(this.current[2]))];
			return [this.getLiveMatrix()[1], this.getLiveMatrix()[2]];
		},

		getTransform(live, asMatrix) {
            if(asMatrix) return this.current;

            var r = this.hist.last('rotate');
            var sk = this.hist.last('skew');
            var sc = this.hist.last('scale');
            var t = this.hist.last('translate');
            var transform = (r ? r.string + ' ' : '') + (sk ? sk.string + ' ' : '') + (sc ? sc.string + ' ' : '') + (t ? t.string : '');

            return transform;
        },

		getLiveMatrix(asArray) {
			return window.getComputedStyle(this.el, null).webkitTransform.match(/-?[\d\.]+(?=,)?/g);
		},

		addTransform(m) {
            //assuming 2d for now...yeah, yeah.
            //Sorts array so we're in order of matrix rows, rather than vectors
            for(var i = 1, len = 3, tmp; i < len; i++) {
				tmp = m[i];
				m[i] = m[i+1];
				m[i+=1] = tmp;
			}

            var c = this.current.concat([]);
            var nm = m.concat([]);
            var n = [];
            var v = 0;

            while(nm.length > 2) {
                var cm = (m[0] == 0 ? nm.shift() + 1 : nm.shift());
                var cc = (c[0] == 0 ? c.shift() + 1 : c.shift());

                //Reminder for 3d...things'll have to change :(
                //v += cm*cc;
                n.push(cm*cc);
                //v = 0;
            }

            this.hist.add('transform', c, 'matrix(' + c.toString() + ')');
            this.current = n.concat(c);
        },

		removeTransform(m) {
            //THIS AIN'T DRY, YO! Fix it.
            //Instead, take the matrix and divide each point to remove...
            for(var i = 1, len = 3, tmp; i < len; i++) {
				tmp = m[i];
				m[i] = m[i+1];
				m[i+=1] = tmp;
			}

            var c = this.current.concat([]);
            var nm = m.concat([]);
            var n = [];

            while(nm.length > 2) {
                var cm = (m[0] == 0 ? nm.shift() + 1 : nm.shift());
                var cc = (c[0] == 0 ? c.shift() + 1 : c.shift());

                n.push(cc/cm);
            }

            this.current = n.concat(c);
        },

		setStyle(m) {
			this.el.style.webkitTransform = 'matrix(' + m.toString() + ')';
		},

		save(name, m) {
			if(!m) {
				this.saved[name] = this.current;
			} else {
				this.save[name] = m;
			}

			return this;
		}
	}

	window.ezt = easyTransform;
}))();