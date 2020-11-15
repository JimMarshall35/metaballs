document.body.onload = function(){
	metaball.init();
	//metaballsUI.init();
	asteroidspawner.init(20);
	loop = function(){
		metaball.update();
		metaball.draw();
		
		window.requestAnimationFrame(loop);
	}
	window.requestAnimationFrame(loop);
}
