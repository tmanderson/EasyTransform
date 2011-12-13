(function() {
	Math.toRad = function(d) {return d*0.0174532925;}
	Math.toDeg = function(r) {return r/0.0174532925;}
	function History() { return this; };

	History.prototype = {
		length: 0,
		add: function(t, m, s) {
			this[this.length] = {type: t, matrix: m, string: s};
			this.length++;
		},
		last: function(type) {
			var i = this.length;
			while(i--) {
				if(this[i].type === type) {
					return this[i];
				}
			}
			return false;
		}
	}

	function easyTransform(el){
		return new easyTransformEl(el);
	}

	//ezt(el).setRotation(20deg).setTranslation(20, 20).setScale(2);

	//Add ability to save specific transforms
	//	ideally it would be singleton style

	function easyTransformEl(el) {
		this.el = el;
	}

	easyTransformEl.prototype = {
		current: [1,0,0,1,0,0],
		hist: new History(),

		stopTransform: function() {
			this.el.style.webkitTransform = this.getLiveTransform();
			return this;
		},

		rotate: function(a) {
			var last = this.hist.last('rotate'),
				r = Math.toRad(a),
				m;

			if(r.toString().split('.')[1].length > 4) r = Math.round(r*10000)/10000
			
			if(last) {
			 	m = [Math.cos(r + last.matrix[0]),Math.sin(r + last.matrix[1]),-Math.sin(r + Math.abs(last.matrix[2])),Math.cos(r + last.matrix[3]), 0, 0];
			 } else {
				m = [Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r), 0, 0];
			}
			
			console.log(m)
			//Check if rotation already in place...
			this.addTransform(m);

			this.hist.add('rotate', m, 'rotate(' + a + 'deg)');
			this.setStyle(this.current);

			return this;
		},

		translate: function(x, y) {
			var m = [1,0,0,1,x,y];

			this.current[4] = x;
			this.current[5] = y;

			this.hist.add('translate', m.toString(), 'translate(' + x + 'px, ' + y + 'px)');
			this.setStyle(this.current);

			return this;
		},

		scale: function(x, y) {
			var m = [x,0,0,y,0,0];

			this.current[0] = m[0];
			this.current[3] = m[3];

			this.hist.add('scale', m, 'scale(' + m[0] + ', ' + m[3] + ')');
			this.setStyle(this.current);

			return this;
		},

		skew: function(x, y) {
			var m = [1,Math.tan(Math.toRad(y)),Math.tan(Math.toRad(x)),1,0,0];
			
			this.current[1] = m[1];
			this.current[2] = m[2];

			this.hist.add('skew', m, 'skew(' + x + 'deg, ' + y + 'deg)');
			this.setStyle(this.current);

			return this;
		},

		transform: function(t) {
			var t = t.match(/[a-z]+\((-?[0-9]+(deg|px)?,? ?)+\)/ig);
			
			return this;
		},

		getRotation: function(live) {
			
		},

		getTranslation: function(live) {
			
		},

		getScale: function(live) {
			
		},

		getSkew: function(live) {
			
		},

		getTransform: function(live) {
			
		},

		getLiveTransform: function(asArray) {
			//This is going to get tricky with multiple transforms...
			//We can possible check the style string for hints on how to
			//break up the current matrix accordingly...?
			//or, keep track of each transformation made to the el
			if(asMatrix) {
				return window.getComputedStyle(this.el, null).webkitTransform.match(/\d/g);
			} else {
				window.getComputedStyle(this.el, null).webkitTransform;
			}
		},

		addTransform: function(m) {
			//assuming 2d for now...
			//Sorts array so we're in order of matrix rows, rather than vectors
			for(var i = 1, len = 3, tmp; i < len; i++) {
				tmp = m[i];
				m[i] = m[i+1];
				m[i+=1] = tmp;
			}
			
			var c = this.current.concat([]),
				nm = m.concat([]),
				n = [],
				v = 0;

			while(nm.length > 2) {
				var cm = (m[0] == 0 ? nm.shift() + 1 : nm.shift()),
					cc = (c[0] == 0 ? c.shift() + 1 : c.shift());
				
				v += cm*cc;
				n.push(v);
				v = 0;
			}

			this.hist.add('transform', c, 'matrix(' + c.toString() + ')');
			this.current = n.concat(c);
			console.log(this.current);
		},

		setStyle: function(m) {
			this.el.style.webkitTransform = 'matrix(' + m.toString() + ')';
		}
	}

	window.ezt = easyTransform;
})();