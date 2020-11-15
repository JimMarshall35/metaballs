var metaball = {
	c : null,
	cmarginL : 0,
	cmarginT : 0, 
	ctx : null,
	MetaballThreshold : 20,
	gridspace : 5,
	MSquareSize : 3,
	metaballs : [],
	lines : [],
	points : [],
	last : null,
	repulsionscale : 300,
	attractionscale : 300,

	nextmbdirection : new Vector2(0,-1),
	nextmbblobbiness : 100,
	nextmbradius : 30,
	nextmbspeed : 25,


	resize : function(){
		metaball.cmarginL = window.innerWidth/4;
		metaball.cmarginT = window.innerHeight/4;
		metaball.c.width = window.innerWidth/2;
		metaball.c.height = window.innerHeight/2;
		//this.c.style.position = "fixed";
		metaball.c.style.border = "thin solid black";
		metaball.c.style.marginLeft = metaball.cmarginL.toString() + "px";
		metaball.c.style.marginTop = metaball.cmarginT.toString() + "px";
	},
	init : function(){
		this.c = document.createElement("CANVAS");
		this.resize();
		this.ctx = this.c.getContext("2d");
		document.body.insertBefore(this.c,document.body.firstChild);
		window.addEventListener("click", this.handleclick);
		window.addEventListener("touchstart", this.handleclick);
		window.addEventListener("resize", this.resize);
	},
	spawnMetaball : function(x,y,dir,rad,speed,blob){
		this.metaballs.push({x:x, 
								 y: y, 
								 direction : dir,
								 radius : rad,
								 speed : speed,
								 blobbiness : blob});
		metaball.last = new Date().getTime();
	},
	handleclick : function(e){
		let x,y;
		if(e.touches){
			x = e.touches[e.touches.length-1].clientX - metaball.cmarginL;
			y = e.touches[e.touches.length-1].clientY - metaball.cmarginT;
		}
		else{
			x = e.clientX - metaball.cmarginL;
			y = e.clientY - metaball.cmarginT;
		}
		let vector = new Vector2(0,1);
		let rotated = vector.rotate(Math.random()*(2*Math.PI));
		let sarr = [-1,1];
		let dir = new Vector2(metaball.nextmbdirection.x, metaball.nextmbdirection.y);
		if(e.clientX >metaball.cmarginL && e.clientX < metaball.cmarginL + metaball.c.width){
			if(e.clientY > metaball.cmarginT && e.clientY < metaball.cmarginT + metaball.c.height){
				// metaball.metaballs.push({x:x, 
				// 				 y: y, 
				// 				 direction : dir,
				// 				 radius : metaball.nextmbradius,
				// 				 speed : metaball.nextmbspeed,
				// 				 blobbiness : metaball.nextmbblobbiness});
				// metaball.last = new Date().getTime();
				metaball.spawnMetaball(x,
									   y,
									   dir,
									   metaball.nextmbradius,
									   metaball.nextmbspeed,
									   metaball.nextmbblobbiness);

				metaball.drawMSLines();
			}
		}
		
	},
	getRepulsionVector : function(mball, delta){
		let phase = mball.blobbiness;
		let d;
		let vec = new Vector2(0,0);
		let thismbvec = new Vector2(mball.x, mball.y);
		for(let k=0; k< this.metaballs.length; k++){

			let mb = this.metaballs[k];
			let othermbvec = new Vector2(mb.x,mb.y);
			let other2me = new Vector2(0,0);
			let attract = false;
			if((phase < 0 && mb.blobbiness > 0) || (phase > 0 && mb.blobbiness < 0)){
				other2me = thismbvec.subtract(othermbvec).getNormal();
			}
			else if(mb != mball){
				other2me = othermbvec.subtract(thismbvec).getNormal();
				attract = true;
			}
			let radiussquared = mb.radius*mb.radius;
			d = this.getDistance(thismbvec, mb);
			if (d > 2 * radiussquared){
				continue;
			}
			let term1;
			let scaled;
			if(!attract){
				term1 = Math.abs(this.repulsionscale*(mb.blobbiness/phase));
				scaled = other2me.multiplyByScalar(term1 * (radiussquared / ((d*d) + 0.001)));
			}
			else{
				term1 = Math.abs(this.attractionscale*(mb.blobbiness/phase));
				scaled = other2me.multiplyByScalar(term1 * (radiussquared / ((d*d) + 0.001)));
				if(scaled.multiplyByScalar(delta).getMagnitude() > other2me.getMagnitude()){
					scaled = other2me;
					//metaball.x = mb.x;
					//metaball.y = mb.y;

					//return new Vector2(0,0);
				}
			}
		    
		    vec = vec.add(scaled);	
			//sum += mb.blobbiness * (radiussquared / ((d*d) + 0.001));
			
			
		}
		return vec;
	},
	getAttractionVector : function(mball,){
		let phase = mball.blobbiness;
		let d;
		let vec = new Vector2(0,0);
		let thismbvec = new Vector2(mball.x, mball.y);
		for(let k=0; k< this.metaballs.length; k++){

			let mb = this.metaballs[k];
			if(mb == mball){
				continue;
			}
			let othermbvec = new Vector2(mb.x,mb.y);
			if((phase < 0 && mb.blobbiness < 0) || (phase > 0 && mb.blobbiness > 0)){
				let other2me = thismbvec.subtract(othermbvec).getNormal().multiplyByScalar(-1);
				let radiussquared = mb.radius*mb.radius;
				d = this.getDistance(thismbvec, mb);

				if (d > 2 * radiussquared){
					continue;
				}
			    let scaled = other2me.multiplyByScalar(Math.abs(this.maxrepulsion*(mb.blobbiness/phase)) * (radiussquared / ((d*d) + 0.001)));
			    vec = vec.add(scaled);	
				//sum += mb.blobbiness * (radiussquared / ((d*d) + 0.001));
			}
			

		}
		return vec;
	},
	update : function(){
		let d = new Date().getTime();
		let delta = (d - this.last)/1000;
		this.last = new Date().getTime();
		for(let i=0; i<this.metaballs.length; i++){
			let mball = this.metaballs[i];
			let adjusteddir = this.getRepulsionVector(mball, delta);
			//let adjusteddir = mball.direction.multiplyByScalar(mball.speed).add(this.getRepulsionVector(mball));
			//mball.speed -= delta;
			//adjusteddir = adjusteddir.add(this.getAttractionVector(mball));
			let movement = adjusteddir.multiplyByScalar(delta);
			mball.x += movement.x;
			mball.y += movement.y;
			if(mball.x + mball.radius*2< 0 && mball.direction.x <0){
				mball.x = this.c.width + mball.radius*2 -1;
				//mball.direction.x *= -1;
			}
			else if(mball.y + mball.radius*2< 0 && mball.direction.y <0){
				mball.y = this.c.height + mball.radius *2 -1;
				//mball.direction.y *= -1;
			}
			else if(mball.x - mball.radius*2> this.c.width && mball.direction.x > 0){
				mball.x = - mball.radius*2;
				//mball.direction.x *= -1;
			}
			else if(mball.y  - mball.radius*2> this.c.height && mball.direction.y > 0){
				mball.y = - mball.radius*2;
				//mball.direction.y *= -1;
			}
			// if(mball.x - mball.radius*2< 0){
			// 	mball.x = 0 + mball.radius*2;
			// 	//mball.direction.x *= -1;
			// }
			// else if(mball.y - mball.radius*2< 0){
			// 	mball.y = 0 + mball.radius*2;
			// 	//mball.direction.y *= -1;
			// }
			// else if(mball.x + mball.radius*2> this.c.width){
			// 	mball.x = this.c.width - mball.radius*2;
			// 	//mball.direction.x *= -1;
			// }
			// else if(mball.y  + mball.radius*2> this.c.height){
			// 	mball.y = this.c.height - mball.radius*2;
			// 	//mball.direction.y *= -1;
			// }
		}
	},
	drawDots : function(fillStyle){
		if(this.metaballs.length > 0){
			for (var i = 0; i < this.points.length; i++) {
				let point = this.points[i];
				this.ctx.fillStyle = fillStyle;
				if(point.value > 0){
					if(point.value < 40){
						this.ctx.fillStyle = "green";
					}
					else if(point.value < 60){
						this.ctx.fillStyle = "yellow";
					}
					else if(point.value < 90){
						this.ctx.fillStyle = "orange";
					}	
					else{
						this.ctx.fillStyle = "red";
					}
				}
				else if(point.value < 0){
					if(point.value > -40){
						this.ctx.fillStyle = "deepskyblue";
					}
					else if(point.value > -60){
						this.ctx.fillStyle = "purple";
					}
					else if(point.value > -90){
						this.ctx.fillStyle = "fuchsia";
					}
				}			
				this.ctx.fillRect(point.x,point.y,1,1);
			}
		}
		
	},
	drawMSLines : function(){		
		if(this.metaballs.length > 0){
			this.marchSquares();		
			this.ctx.beginPath();
			for(let i=0; i<this.lines.length-1; i+=2){
				this.ctx.moveTo(this.lines[i].x, this.lines[i].y);
				this.ctx.lineTo(this.lines[i+1].x, this.lines[i+1].y);
			}
			this.ctx.stroke();
		}
		
	},
	draw : function(){
		this.ctx.clearRect(0,0,this.c.width,this.c.height);
		this.drawMSLines();
		this.drawDots("green");
		
	},
	marchSquares : function(){
		this.lines = [];
		this.points = [];
		let binaryArray = [];
		let cornerpositions = [];
		for(let i=0; i<Math.floor(this.c.height/this.MSquareSize); i++){
			binaryArray.push([]);
			cornerpositions.push([]);
			for(let j=0; j<Math.floor(this.c.width/this.MSquareSize); j++){
				
				let value = this.getValueAtPoint({x:j*this.MSquareSize, y:i*this.MSquareSize});
				cornerpositions[cornerpositions.length-1].push({x:j*this.MSquareSize, y:i*this.MSquareSize, value: value});
				if(Math.abs(value) > this.MetaballThreshold){
					binaryArray[binaryArray.length-1].push("1");
				}
				else{
					binaryArray[binaryArray.length-1].push("0");
				}
			}
		}
		for(let i=0; i<binaryArray.length - 1; i++){;
			for(let j=0; j<binaryArray[i].length - 1; j++){
				let tl = binaryArray[i][j];
				let tr = binaryArray[i][j+1];
				let br = binaryArray[i+1][j+1];
				let bl = binaryArray[i+1][j];
				let index = parseInt(tl+tr+br+bl, 2);
				let point = cornerpositions[i][j];
				if(index != 0 && index != 15){
					this.lookupTable[index](point,this.lines);
				}
				if(index == 15){
					this.points.push(point);
				}
				
			}
		}
	},
	getValueAtPoint : function(point){
		let d;
		let sum = 0;
		for(let k=0; k< this.metaballs.length; k++){
			let mb = this.metaballs[k];
			let radiussquared = mb.radius*mb.radius;
			d = this.getDistance(point, mb);
			if (d > 2 * radiussquared){
				continue;
			}
					
			sum += mb.blobbiness * (radiussquared / ((d*d) + 0.001));
		}
		return sum;
	},
	getDistance : function(ptA, ptB){
		return Math.sqrt((ptA.x-ptB.x)*(ptA.x-ptB.x) + (ptA.y-ptB.y)*(ptA.y-ptB.y));
	},
	lookupTable : [	
					// 00 - 0000 - none
					function(p,lines){}, 
					// 01 - 0001 - bottom left
					function(p,lines){
						lines.push({x:p.x, y:p.y + metaball.MSquareSize/2});
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y + metaball.MSquareSize});
					}, 
					// 02 - 0010 - bottom right
					function(p,lines){
						lines.push({x:p.x + metaball.MSquareSize, y:p.y + metaball.MSquareSize/2});
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y + metaball.MSquareSize});
					}, 
					// 03 - 0011 - bottom right and bottom left
					function(p,lines){
						lines.push({x:p.x, y:p.y + metaball.MSquareSize/2});
						lines.push({x:p.x + metaball.MSquareSize, y:p.y + metaball.MSquareSize/2});
					}, 
					// 04 - 0100 - top right
					function(p,lines){
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y});
						lines.push({x:p.x + metaball.MSquareSize, y:p.y + metaball.MSquareSize/2});
					}, 
					// 05 - 0101 - top right and bottom left
					function(p,lines){
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y});
						lines.push({x:p.x, y:p.y + metaball.MSquareSize/2});

						lines.push({x:p.x + metaball.MSquareSize, y:p.y + metaball.MSquareSize/2});
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y + metaball.MSquareSize});
					}, 
					// 06 - 0110 - top right and bottom right
					function(p,lines){
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y});
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y + metaball.MSquareSize});
					}, 
					// 07 - 0111 - top right and bottom right and bottom left
					function(p,lines){
						lines.push({x:p.x+metaball.MSquareSize/2, y:p.y});
						lines.push({x:p.x, y:p.y+metaball.MSquareSize/2});
					}, 
					// 08 - 1000 - top left
					function(p,lines){
						lines.push({x:p.x+metaball.MSquareSize/2, y:p.y});
						lines.push({x:p.x, y:p.y+metaball.MSquareSize/2});
					}, 
					// 09 - 1001 - top left and bottom left
					function(p,lines){
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y});
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y + metaball.MSquareSize});
					}, 
					// 10 - 1010 - top left and bottom right
					function(p,lines){
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y});
						lines.push({x:p.x + metaball.MSquareSize, y:p.y + metaball.MSquareSize/2});

						lines.push({x:p.x, y:p.y + metaball.MSquareSize/2});
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y + metaball.MSquareSize});
					},
					// 11 - 1011 - top left, bottom right and bottom left 
					function(p,lines){
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y});
						lines.push({x:p.x + metaball.MSquareSize, y:p.y + metaball.MSquareSize/2});
					}, 
					// 12 - 1100 - top left and top right
					function(p,lines){
						lines.push({x:p.x, y:p.y + metaball.MSquareSize/2});
						lines.push({x:p.x + metaball.MSquareSize, y:p.y + metaball.MSquareSize/2});
					}, 
					// 13 - 1101 - top left, top right and bottom left
					function(p,lines){
						lines.push({x:p.x + metaball.MSquareSize, y:p.y + metaball.MSquareSize/2});
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y + metaball.MSquareSize});
					}, 
					// 14 - 1110 - top left, top right and bottom right
					function(p,lines){
						lines.push({x:p.x, y:p.y + metaball.MSquareSize/2});
						lines.push({x:p.x + metaball.MSquareSize/2, y:p.y + metaball.MSquareSize});
					}, 
					// 15 - 1111 - all
					function(p,lines){ }
				]
}