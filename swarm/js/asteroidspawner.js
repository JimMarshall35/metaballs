var asteroidspawner = {
	rmax : 25,
	rmin : 5,
	smax : 160,
	smin : 0,
	spawnrandom : function(){
		let rad = this.rmin+(Math.random()*(this.rmax-this.rmin));
		let speed = this.smin+(Math.random()*(this.smax-this.smin));
		let dir = new Vector2(0,-1).rotate(Math.random()*(2*Math.PI));
		let phases = [-100,100];
		let phase = phases[Math.round(Math.random())];
		let x = Math.random() * metaball.c.width;
		let y = Math.random() * metaball.c.height;
		metaball.spawnMetaball(x,y,dir,rad,speed,phase);
	},
	init : function(num){
		for(let i=0; i<num; i++){
			this.spawnrandom();
		}
	}
}