var metaballsUI = {

	init : function(){
		this.speedlabel = document.getElementById("speed-label");
		this.speedslider = document.getElementById("speed-range");
		this.handleSpeedRangeInput(this.speedslider);

		this.directionlabel = document.getElementById("direction-label");
		this.directionslider = document.getElementById("direction-range");
		this.directionindicatorc = document.getElementById("direction-indicator");
		this.directionindicatorctx = this.directionindicatorc.getContext("2d");
		this.handleDirectionRangeInput(this.directionslider);

		this.radiuslabel = document.getElementById("radius-label");
		this.radiusslider = document.getElementById("radius-range");
		this.handleRadiusRangeInput(this.radiusslider);

		this.blobbinesslabel = document.getElementById("blobbiness-label");
		this.blobbinessslider = document.getElementById("blobbiness-range");
		this.handleBlobbinessRangeInput(this.blobbinessslider);
	},
	handleSpeedRangeInput : function(e){
		this.speedlabel.innerHTML = e.value;
		metaball.nextmbspeed = parseInt(e.value,10);
	},
	handleBlobbinessRangeInput : function(e){
		this.blobbinesslabel.innerHTML = e.value;
		metaball.nextmbblobbiness = parseInt(e.value,10);
	},
	handleDirectionRangeInput : function(e){
		this.directionlabel.innerHTML = e.value;
		metaball.nextmbdirection = this.setDirectionIndicator(parseInt(e.value,10));
	},
	handleRadiusRangeInput : function(e){
		this.radiuslabel.innerHTML = e.value;
		metaball.nextmbradius = parseInt(e.value,10);
	},
	handleSpeedRandomizeClick : function(){
		let randomval = Math.round(this.speedslider.min + Math.random()*(this.speedslider.max -this.speedslider.min));
		this.speedslider.value = randomval;
		//this.speedlabel.innerHTML = randomval.toString();
		this.handleSpeedRangeInput(this.speedslider);
	},
	
	
	handleDirectionRandomizeClick : function(){
		let randomval = Math.round(this.directionslider.min + Math.random()*(this.directionslider.max -this.directionslider.min));
		this.directionslider.value = randomval;
		this.handleDirectionRangeInput(this.directionslider);
	},

	
	handleRadiusRandomizeClick : function(){
		let randomval = Math.round(this.radiusslider.min + Math.random()*(this.radiusslider.max -this.radiusslider.min));
		this.radiusslider.value = randomval;
		//this.speedlabel.innerHTML = randomval.toString();
		this.handleRadiusRangeInput(this.radiusslider);
	},

	
	handleBlobbinessRandomizeClick : function(){
		let randomval = Math.round(this.blobbinessslider.min + Math.random()*(this.blobbinessslider.max -this.blobbinessslider.min));
		this.blobbinessslider.value = randomval;
		//this.speedlabel.innerHTML = randomval.toString();
		this.handleBlobbinessRangeInput(this.blobbinessslider);
	},
	setDirectionIndicator(angle){
		let cwidth = this.directionindicatorc.width;
		let cheight = this.directionindicatorc.height;
		
		let vec = new Vector2(0,-cheight/2);
		vec = vec.rotate((angle/365)*(Math.PI*2));

		let centerpos = new Vector2(cwidth/2,cheight/2);
		let endpos = centerpos.add(vec);

		let arrowhead = vec.multiplyByScalar(-0.4);
		let arrowheadangle = (25/365)*(Math.PI*2);
		let arrowpos1 = endpos.add(arrowhead.rotate(arrowheadangle));
		let arrowpos2 = endpos.add(arrowhead.rotate(-arrowheadangle));

		this.directionindicatorctx.clearRect(0,0,cwidth,cheight);

		this.directionindicatorctx.beginPath();
		this.directionindicatorctx.arc(centerpos.x,centerpos.y,cwidth/2,0,2*Math.PI);
		this.directionindicatorctx.moveTo(centerpos.x,centerpos.y);
		this.directionindicatorctx.lineTo(endpos.x,endpos.y);
		this.directionindicatorctx.lineTo(arrowpos1.x,arrowpos1.y);
		this.directionindicatorctx.moveTo(endpos.x,endpos.y);
		this.directionindicatorctx.lineTo(arrowpos2.x,arrowpos2.y);
		this.directionindicatorctx.stroke();

		return vec.getNormal();
	},
	clearScreen : function(){
		metaball.metaballs = [];
	}
}