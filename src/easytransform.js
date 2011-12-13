(function() {
	function easyTransform(el){
		return new easyTransformEl(el);
	}

	//ezt(el).setRotation(20deg).setTranslation(20, 20).setScale(2);

	function easyTransformEl(el) {
		this.el = el;
	}

	easyTransformEl.prototype = {
		current: undefined,
		lastRotation: {m: [1,0,0,1,0,0], s: 'rotate(0deg)'},
		lastTranslation: {m: [1,0,0,1,0,0], s: 'translate(0,0)'},
		lastScale: {m: [1,0,0,1,0,0], s: 'scale(1,1)'},
		lastSkew: {m: [1,0,0,1,0,0], s: 'skew(0deg)'},

		stopTransform: function() {
			this.el.style.webkitTransform = this.getLiveTransform();
			return this;
		},

		setRotation: function(a) {
			var m = [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0];

			if(this.current) {
				this.addTransform(m);
			} else {
				this.current = m;
				this.el.style.webkitTransform = 'matrix(' + m.toString() + ')';
			}

			return this;
		},

		setTranslation: function(x, y) {
			var m = [1, 0, 0, 1, x, y];
			console.log(this.current);
			if(this.current) {
				this.addTransform(m);
			} else {
				this.current = m;
				this.el.style.webkitTransform = 'matrix(' + m.toString() + ')';
			}

			return this;
		},

		setScale: function(s) {
			var m = [s, 0, 0, s, 0, 0];

			if(this.current) {
				this.addTransform(m);
			} else {
				this.current = m;
				this.el.style.webkitTransform = 'matrix(' + m.toString() + ')';
			}

			return this;
		},

		setSkew: function(x, y) {
			if(!y) y = x;
			var m = [1, Math.tan(y), Math.tan(x), 1, 0, 0];

			if(this.current) {
				this.addTransform(m);
			} else {
				this.current = m;
				this.el.style.webkitTransform = 'matrix(' + m.toString() + ')';
			}

			return this;
		},

		setTransform: function(t) {
			var t = t.match(/[a-z]+\((-?[0-9]+(deg|px)?,? ?)+\)/ig);
			
			return this;
		},

		getFinishRotation: function() {
			
		},

		getFinishTranslation: function() {
			
		},

		getFinishScale: function() {
			
		},

		getFinishTransform: function() {
			
		},

		getLiveRotation: function() {
			
		},

		getLiveTranslation: function() {
			
		},

		getLiveScale: function() {
			
		},

		getLiveSkew: function() {
			
		},

		getLiveTransform: function(asArray) {
			//This is going to get tricky with multiple transforms...
			//We can possible check the style string for hints on how to
			//break up the current matrix accordingly...?
			//or, keep track of each transformation made to the el
			if(asArray) {
				return window.getComputedStyle(this.el, null).webkitTransform.match(/\d/g);
			} else {
				window.getComputedStyle(this.el, null).webkitTransform;
			}
		},

		//Too late to simplify the matrix.
		addTransform: function(m) {
			//assuming 2d for now...
			var c = [],     //0 2 2 3
				n = [],     //0 2 1 3
				v;
			
			for(var i = 0; i < m.length; i++) {
				for(var j = i; j < m.length; j++) {
					v += m[i]*this.current[j];
				}
				console.log(v)
				c.push(v);
				v=0;
			}

			this.el.style.webkitTransform = 'matrix(' + c.toString() + ')';
			this.current = c;
		}
	}

	window.ezt = easyTransform;
})();