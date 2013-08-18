﻿window.onload = function(){
	canvas = document.getElementById('game');
	context = canvas.getContext('2d');
	canvas.style.display = 'block'; // Set up canvas
	canvas.style.border = '1px solid #ddd';
	canvas.style.background = '#fff'; // Set canvas style
	canvas.style.margin = (window.innerHeight > 360 ? window.innerHeight / 2 - 180 + 'px auto' : '10px auto');
	start();
};

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame	|| 
		window.webkitRequestAnimationFrame	|| 
		window.mozRequestAnimationFrame		|| 
		window.oRequestAnimationFrame		|| 
		window.msRequestAnimationFrame		|| 
		function(callback, element){
			window.setTimeout(callback, 1000 / 60);
		};
})();

function start(){
	reset();
}

function setCookie(name, value, days){
	var date = new Date();
	date.setDate(date.getDate() + days);
	var value = escape(value) + ((days == null) ? "" : "; expires=" + date.toUTCString());
	document.cookie = name + "=" + value;
}

function getCookie(name){
	var value = document.cookie;
	var start = value.indexOf(" " + name + "=");
	if (start == -1){
		start = value.indexOf(name + "=");
	}
	if (start == -1){
		value = null;
	}else{
		start = value.indexOf("=", start) + 1;
		var end = value.indexOf(";", start);
		if (end == -1){
			end = value.length;
		}
		value = unescape(value.substring(start, end));
	}
	return value;
}

// Get mouse position
function getMouse(evt){
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

// Get touch position on mobiles
function getTouch(evt){
	var rect = canvas.getBoundingClientRect();
	var touch = evt.touches[0];
	console.log(touch);
	evt.preventDefault();
	return {
		x: touch.clientX - rect.left,
		y: touch.clientY - rect.top
	};
}

// Set up variables
function reset(){
	// Create arrays
	actors = [];
	controllers = [];
	particles =  [];
	items = [];
	camera = [];
	ais = [];
	keys = [];
	keysDown = [];
	test = [];
	level = ['','','','','','','','','','','','','','','','','','','',''];
	partsInserted = [];
	var tempCook = getCookie('options');
	if(tempCook){
		optionvars = tempCook;
	}else{
		optionvars = [50, 50, 87, 65, 68, 69, 81];
	}
	game = 'menu';
	moveLocked = false;
	lookx = 0;
	message = false;
	ui = {
		select: 0,
		area: 0
	}
	mouse = {
		x: 0,
		y: 0,
		down: false,
		click: false
	};
	tomenu = false;
	slow = false;
	trialComplete = false;
	finTime = false;
	sound = {
		shoot1: new Audio('sfx.wav'),
		jump: new Audio('Funk.mp3'),
	}
	menu = [
		[
			['Play', 4, true],
			['Options', 1, true],
			['Credits', 6, true]
		],
		[
			['Sound levels', 2, true],
			['Controls', 3, true],
			['Back', 0, true]
		],
		[
			['Music', 's', 0, 0, 100, false],
			['Sound', 's', 1, 0, 100, false],
			['Back', 1, true]
		],
		[
			['Jump', 'c', 2], ['Left', 'c', 3],
			['Right', 'c', 4],['Next', 'c', 5],
			['Prev', 'c', 6],['Back', 1, true, 120]
		],
		[	
			['Adventure', 9, true],
			['Time trial', 7, true],
			['Free play', 5, true],
			['Back', 0, true]
		],
		['r', 'play'],
		['t', 'Sint', '', 'Programming and graphics by Markus Scully (Asraelite)', 'Sound and music by Christian Stryczynski'],
		[
			['"Super Awesome Carrot" by Josh', 8, 0, 'tl'],
			['"Duck" by Asraelite', 8, 1, 'tl'],
			['"Pipes by Asraelite', 8, 2, 'tl'],
			['Back', 4, true]
		],
		['r', 'time'],
		['r', 'adventure']
	];
	lastspeed = 0;
	
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)){ // Check if mobile
		mobile = true;
	}else{
		mobile = false;
	}
	
	// type, affiliation, lifespan, xpos, ypos, xvel, yvel
	defineLevels(); // Call function to create level variables
	//level = 2 // Set level
	spritesheet = new Image(); // Define spritesheet
	spritesheet.src = 'actors.png';
	itemsheet = new Image(); // Define spritesheet
	itemsheet.src = 'items.png';
	document.addEventListener('keydown', keyDown, true); // Add key events
	document.addEventListener('keyup', keyUp, true);
	if(mobile){
		document.body.addEventListener('touchstart', function(evt){mouse.down = true}, false);
		document.body.addEventListener('touchend', function(evt){mouse.down = false}, false);
		document.body.addEventListener('touchmove', function(evt){mouse.x = getTouch(evt).x; mouse.y = getTouch(evt).y}, false);
	}else{
		document.addEventListener('mousedown', function(evt){mouse.down = true}, false);
		document.addEventListener('mouseup', function(evt){mouse.down = false}, false);
		document.addEventListener('mousemove', function(evt){mouse.x = getMouse(evt).x; mouse.y = getMouse(evt).y}, false);
	}
	
	animate();
}

function toMenu(){
	actors = [];
	controllers = [];
	particles =  [];
	camera = [];
	ais = [];
	items = [];
	keys = [];
	level = ['','','','','','','','','','','','','','','','','','','',''];
	partsInserted = [];
	game = 'menu';
	ui.area = 0;
	ui.select = 0;
	tomenu = false;
}

function play(){
	// Create player and its key controller
	actors[0] = new Actor(0, 'player', 200, 200, 3, 128, 64, 16, 16);
	controllers[0] = new Controller(actors[0], [[optionvars[4], 'moveRight'], [optionvars[3], 'moveLeft'], [optionvars[2], 'jump'], [27, 'quit'], [90, 'suicide', 0], ['c', 'current'], [optionvars[5], 'next'], [optionvars[6], 'next']]);
	
	particles[0] = new Particle('mouse', 0, 'mouse', 10000000000, 0, 0, 0, 0, 0, [0, 0]); // Create reticule
	items[0] = new Item(0, 250, 100);
	//setCookie('options', );
	finTime = false;
	
	camera = [actors[0]]; // Set camera.
}

function animate() {
	requestAnimFrame(animate);
	loopGame();
}

// Rounds a number.
function r(num){
	return Math.round(num);
}

function spawn(no){
	for(i = 0 ; i < no; i++){
		actors[actors.length] = new Actor(7, 'all', 100, 100, 3, lookx + 250 + ((Math.random() - 0.5) * 200), 0, 16, 16);
		ais[ais.length] = new Ai(actors.length - 1, 'alphaBot');
	}
}

function controlChar(key){
	var legend = {
		16 : 'Shift',
		17 : 'Control',
		18 : 'Alt',
		32 : 'Space',
		37 : 'L-Arrow',
		38 : 'U-Arrow',
		39 : 'R-Arrow',
		40 : 'D-Arrow'
	}
	
	if(key >= 48 && key <= 90){
		return String.fromCharCode(key);
	}else{
		var keyChar = legend[key];
		return (typeof keyChar === 'undefined' ? key : keyChar);
	}
}

// Converts "65324" into "06:53.240" etc.
function toClock(num, precision){
	var min = Math.floor(num / 60000);
	if(min < 10){
		min = "0" + min;
	}
	var sec = num % 60000; // 6163
	var sec = r(sec / Math.pow(10, 3 - precision));
	sec = (sec * Math.pow(10, 3 - precision)) / 1000;
	
	var disSec = sec;
	for(i = 0; i < precision; i++){
		if(sec % 1 / Math.pow(10, i) == 0){
			disSec += (i == 0 ? ".0" : "0");
		}
	}
	
	if(sec < 10){
		disSec = "0" + disSec;
	}
	return min + ":" + disSec;
}

function setStrChar(string , index, letter) {
    if(index > string.length-1){
		return string;
	}
    return string.substr(0, index) + letter + string.substr(index + 1);
}

// Generate random number from seed (not used)
function seed(num){
	return ((num * 467 + ((num * 6) % 9)) % 1000) / 1000;
}

// Add key pressed to key list.
function keyDown(e){
	var keyPress;
	if (typeof event !== 'undefined') {
		keyPress = event.keyCode;
	}else if(e){
		keyPress = e.which;
	}
	if(keys.indexOf(keyPress) == -1){
		keys.push(keyPress);
		keysDown.push(keyPress);
	}
}

// Remove key from key list.
function keyUp(e){
	var keyPress;
	if (typeof event !== 'undefined') {
		keyPress = event.keyCode;
	}else if(e){
		keyPress = e.which;
	}
	keys.splice(keys.indexOf(keyPress), 1);
}

// Define objects.

function Controller(object, actions){
	this.actor = object;
	this.checkKeys = function(){
		for(i in actions){
			if(actions[i].length > 2 && actions[i][2] == 0){
				if(keysDown.indexOf(actions[i][0]) > -1){
					this.actor.action(actions[i][1]);
				}
			}else{
				if(keys.indexOf(actions[i][0]) > -1){
					this.actor.action(actions[i][1]);
				}
			}
			if(mouse.down && actions[i][0] == 'c'){
				this.actor.action(actions[i][1]);
			}
		}
		this.actor.refreshActions();
	}
}

function Ai(index, ai){
	this.index = index;
	this.actor = actors[index];
	this.aivars = [0, 0, 0];
	this.action = function(act){
		this.actor.action(act);
	}
	this.run = function(){
		switch(ai){
			case 'alphaBot':
				var topDistance = 400;
				var distanceAway = Math.abs(actors[0].x - this.actor.x);
				if(distanceAway < topDistance){
					if(this.aivars[0] == 1){
						this.aivars[1] = 120;
					}else{
						this.aivars[1] = 300;
					}
					if(this.aivars[0] == 1 && distanceAway < 150){
						var angle = Math.atan2(actors[0].y - ((this.actor.y) + (distanceAway / 10)), actors[0].x - this.actor.x);
						this.actor.vars[0] = angle;
						this.action('en1');
					}
					if(this.aivars[0] == 1 && this.actor.energy <= 5){
						this.aivars[0] = 0;
					}
					if(this.aivars[0] == 0 && this.actor.energy >= 100){
						this.aivars[0] = 1;
					}
					var inverter = (distanceAway > this.aivars[1] ? 0 : 1);
					if(Math.abs(distanceAway - this.aivars[1]) > 20){
						if(this.actor.x > actors[0].x){
							this.action(['moveLeft', 'moveRight'][inverter]);
						}else{
							this.action(['moveRight', 'moveLeft'][inverter]);
						}
						if(this.actor.x == this.aivars[2]){
							this.action('jump');
						}
						this.aivars[2] = this.actor.x;
					}
				}
				break;
			case 'pace': // Walking back and forth
				if(this.actor.xvel == 0){
					this.aivars[0] = (1 - this.aivars[0]);
				}
				if(this.actor.box.inlava){
					this.action('jump');
				}
				this.action(this.aivars[0] == 0 ? 'moveRight' : 'moveLeft');
				break;
			case 'still':
				break;
			case 'test': // Jumping AI
				this.action('jump');
				break;
		}
		
		if(this.actor.health < 0){
			this.deleteme = true;
			this.actor.deleteme = true;
			for(i = 0; i < 64; i++){
				particles.push(new Particle(0, 2, 2, Math.random() * 500 + 2500, this.actor.x + ((i % 8) * 2), this.actor.y - ((i % 8) * 2), (Math.random() - 0.5) * 10, (Math.random() - 0.8) * 10, 0.4, [0.99, 0.99]));
			}
			this.actor.x = 0;
			this.actor.y = 0;
		}
	}
}

// Actor class for all solid cubes
function Actor(image, type, health, energy, powers, xpos, ypos, width, height, ai){
	this.image = image;
	this.ai = typeof ai === 'undefined' ? false : ai;
	this.group = type;
	this.health = health;
	this.maxhealth = health;
	this.energy = energy;
	this.maxenergy = energy;
	this.tookDamage = 0;
	this.select = 0;
	this.powers = 1;
	this.yvel = 0;
	this.xvel = 0;
	this.imageLoad = 2;
	this.deleteme = false;
	this.right = this.up = this.down = false;
	this.left = false;
	this.x = xpos;
	this.y = ypos;
	this.w = width;
	this.h = height;
	this.box = new Box(this.x, this.y, this.w, this.h, this.xvel, this.yvel, 0, true);
	this.oneactions = [];
	this.actionsturn = [];
	this.index = actors.length;
	this.vars = [false, false, false]; // for use by AIs to control particles
	this.test = '';
	
	this.refreshActions = function(){
		this.oneactions = [];
		for(i in this.actionsturn){
			this.oneactions.push(this.actionsturn[i]);
		}
	}
	
	// Actions to call from controllers
	this.action = function(type){
		if(!message){
			var angle = Math.atan2(-(this.y - mouse.y), (mouse.x - ((this.x - lookx))));
			var distanceToSound = Math.abs(this.x - lookx - 250);
			switch(type){
				case 0:
					if(this.energy >= 2){
						particles.push(new Particle(0, 0, 0, Math.random() * 500 + 5000, this.x + 8, this.y - 8, Math.cos(angle) * 15 + this.xvel, Math.sin(angle) * 15 + this.yvel, 0.4, [0.997, 0.997]));
						if(distanceToSound < 500){
							sound.shoot1.volume = (r(distanceToSound < 100 ? 1 : (500 - distanceToSound) / 400) * optionvars[1]) / 100;
							sound.shoot1.play();
						}
						this.energy -= 2;
					}
					break;
				case 'en1':
					if(this.energy >= 2){
						particles.push(new Particle(0, 1, 1, Math.random() * 500 + 5000, this.x + 8, this.y - 8, Math.cos(this.vars[0]) * 15 + this.xvel, Math.sin(this.vars[0]) * 15 + this.yvel, 0.4, [0.995, 0.995]));
						if(distanceToSound < 500){
							sound.shoot1.volume = (r(distanceToSound < 100 ? 1 : (500 - distanceToSound) / 400) * optionvars[1]) / 100;
							sound.shoot1.play();
						}
						this.energy -= 2;
					}
					break;
				case 'moveLeft':
					this.xvel -= (0.08 * speed);
					break;
				case 'moveRight':
					this.xvel += (0.08 * speed);
					break;
				case 'jump':
					this.box.y += 1;
					if(this.box.collide() || this.box.inlava){
						this.yvel = -6.8 * (this.box.inlava ? 0.2 : 1);
						if(distanceToSound < 300){
							sound.jump.volume = (r(distanceToSound < 100 ? 1 : (300 - distanceToSound) / 200) * optionvars[1]) / 100;
							sound.jump.play();
						}
					}
					this.box.y -= 1;
					break;
				case 'current':
					this.action(this.select);
					break;
				case 'next':
					this.select = (this.select + 1) % this.powers;
					break;
				case 'prev':
					this.select = (this.select <= 0 ? this.powers : this.select - 1);
					break;
				case 'suicide':
					this.health = (this.y > 50 ? 0 : this.health);
					break;
				case 'quit':
					tomenu = true;
					break;
			}
		}
		this.actionsturn.push(type);
	}
	
	this.simulate = function(){
		this.box.xvel = this.xvel;
		this.box.yvel = this.yvel;
		this.box.x = this.x;
		this.box.y = this.y;
		this.box.health = this.health;
		this.box.run();
		this.x = this.box.x;
		this.y = this.box.y;
		this.xvel = this.box.xvel;
		this.yvel = this.box.yvel;
		this.health = this.box.health;
		if(this.health <= 0){
			if(this.image == 0){
				messsage = ['', 'Shuffleshit, yo'];
				for(i = 0; i < 64; i++){
					particles.push(new Particle(0, 0, 0, Math.random() * 500 + 2500, this.x + ((i % 8) * 2), this.y - ((i % 8) * 2), (Math.random() - 0.5) * 10, (Math.random() - 0.8) * 10, 0.4, [0.99, 0.99]));
				}
				this.x = 128;
				this.y = 64;
				this.xvel = 0;
				this.yvel = 0;
				this.health = this.maxhealth;
				clockStart = new Date().getTime();
			}
		}
		if(this.energy >= this.maxenergy){
			this.energy = this.maxenergy;
		}else{
			this.energy += 0.04 * speed;
		}
		//this.xvel *= Math.pow(0.992, speed);
	}
	
	this.draw = function(){
		//var reflect = 100; // Depth reflection goes before fading completely
		var drawx = r(this.x - lookx + this.xvel);
		var drawy = 200;
		context.drawImage(spritesheet, this.image * 16, 16, 16, 16, drawx, r(this.y - 16 - looky), this.w, this.h);
		context.globalAlpha = 1;
		if(this.tookDamage > 0 && this.image != 0){
			context.strokeStyle = '#555';
			context.fillStyle = '#c54';
			context.fillRect(r((this.x - lookx) + 8 + this.xvel) - 10 - 0.5, r(this.y) - 23.5, (this.health / this.maxhealth) * 20, 5);
			context.strokeRect(r((this.x - lookx) + 8 + this.xvel) - 10 - 0.5, r(this.y) - 23.5, 20, 5);
			this.tookDamage -= 0.05 * speed;
		}
		//context.drawImage(spritesheet, this.image * 16, 16, 16, 16, drawx, r((216 - (this.y - 216)) - looky), 16, 16);
		// StartX, StartY, EndX, EndY
		//var gradient = context.createLinearGradient(drawx, r((216 - this.y + 216) - looky - 5), drawx, r((214 - (this.y - 216)) - looky) + 16);
		//gradient.addColorStop(0.1, 'rgba(255, 255, 255, ' + (this.y < 120 ? 1 : ((200 - this.y) / 35) + 0.2) +')');
		//gradient.addColorStop(0.9, 'rgba(255, 255, 255, 1)');
		//context.fillStyle = gradient;
		//context.fillRect(drawx, r((216 - (this.y - 216)) - looky), 16, 16);
	}
}

function Item(type, xpos, ypos){
	this.x = xpos;
	this.y = ypos;
	this.hover = 0;
	this.hovervel = 0.1;
	this.deleteme = false;
	
	this.draw = function(){
		var drawx = r(this.x - lookx + this.xvel);
		context.drawImage(itemsheet, this.type * 8, 0, 8, 8, drawx, this.x, 8, 8);		
		context.globalAlpha = 1;
	}
	
	this.run = function(){
		this.hover += this.hovervel;
		if((4 - Math.abs(this.hover)) <= 0){
			this.hovervel *= -1;
		}
		if(Math.abs((this.x + 4) - (actors[0].x + 8)) < 10 && Math.abs((this.y + 4) - (actors[0].y + 8)) < 10){
			switch(this.type){
				case 0:
					actors[0].health += 100;
					if(actors[0].health > actors[0].maxhealth){
						actors[0].health = actors[0].maxhealth;
					}
					break;
				case 1:
					
					break;
			}
		}
	}
}

function Particle(type, affiliation, drawType, lifespan, xpos, ypos, xvel, yvel, gravity, airRes){
	this.gravity = typeof gravty !== 'undefined' ? gravity : 1;
	this.x = xpos;
	this.y = ypos;
	this.drawType = drawType;
	this.xvel = xvel;
	this.yvel = yvel;
	this.type = type;
	this.air = airRes;
	this.life = lifespan;
	this.size = [3, 5, 7, 5][type];
	this.created = this.timeup = new Date();
	this.timeup = new Date(this.timeup.getTime() + lifespan);
	this.deleteme = false;
	this.aff = affiliation;
	this.vars = [false, false];
	var angle = Math.random() * 360;
	this.addx = Math.sin(angle) * ((particles.length + 200) / 5);
	this.addy = Math.cos(angle) * ((particles.length + 200) / 10);
	this.box = new Box(this.x, this.y, this.size, this.size, this.xvel, this.yvel, 1, gravity, this.air);
	this.box.unstuck();
	
	this.drawBox = function(alpha, width, color, size){
		context.globalAlpha = alpha;
		context.lineWidth = width;
		context.strokeStyle = color;
		context.strokeRect(r(this.x - lookx) + 0.5, r(this.y - looky) + 0.5, size, size);
	};
	
	this.draw = function(){
		if(this.x > lookx - 50 && this.x < lookx + 550 && this.y < 300 && this.y > -50){
			switch(this.drawType){
				case 'mouse':
					context.globalAlpha = 0.7;
					context.lineWidth = 2;
					context.strokeStyle = '#33d';
					context.strokeRect(mouse.x - this.vars[0] / 2, mouse.y - this.vars[0] / 2, this.vars[0], this.vars[0]);
					break;
				case 0:
					this.drawBox(1, 1, '#66b', 2);
					break;
				case 1:
					this.drawBox(1, 1, '#f87', 2);
					break;
				case 2:
					this.drawBox(1, 1, '#655', 2);
					break;
				case 3:
					context.globalAlpha = 0.5;
					context.lineWidth = 1;
					context.strokeStyle = '#000';
					context.strokeRect(r(this.x - lookx) + 0.5, r(this.y - looky) + 0.5, 4, 4);
					break;
			}
			context.globalAlpha = 1;
		}
	}
	
	this.simulate = function(){
		switch(this.type){
			case 'mouse':
				if(this.vars[0] == false){
					this.vars[0] = 8;
				}
				if(this.vars[1] == true){
					this.vars[0] += 0.4;
					if(this.vars[0] >= 10){
						this.vars[1] = false;
					}
				}else{
					this.vars[0] -= 0.4;
					if(this.vars[0] <= 7){
						this.vars[1] = true;
					}
				}
				this.x = lookx;
				if(mouse.down){
					if(mobile){
						if(mouse.y < 100){
							actors[0].action('jump');
						}
						if(mouse.x > 300){
							actors[0].action('moveRight');
						}else if(mouse.x < 200){
							actors[0].action('moveLeft');
						}
					}
					this.vars[0] = 6;
				}
				break;
			case 0:
				/*
				for(j in actors){
					if(Math.abs(this.x - (actors[j].x + 8)) < 20 && Math.abs(this.y - (actors[j].y + 8)) < 20){
						this.xvel += (20 - Math.abs(this.x - (actors[j].x + 8))) / (this.x > (actors[j].x + 8) ? 5 : -5);
						this.yvel += (20 - Math.abs(this.y - (actors[j].y + 8))) / (this.y > (actors[j].y + 8) ? 5 : -5);
					}
				}
				*/
				break;
			case 1:
			
			default:
				break;
		}
		
		for(j in actors){
			var act = actors[j];
			if(this.y + 16 < act.y + act.h && this.y + 16 + this.size > act.y){
				if(this.x + this.size > act.x && this.x < act.x + act.w && (this.aff == 1 ? j == 0 : j > 0)){
					actors[j].health -= (Math.abs(this.xvel) + Math.abs(this.yvel)) / 10;
					actors[j].xvel += this.xvel / 8;
					actors[j].yvel += this.yvel / 8;
					actors[j].tookDamage = 40;
					this.deleteme = true;
				}
			}
		}
		// this.y < obj.y + obj.h && this.y + obj.h > obj.y && this.x + obj.w > obj.x && this.x < obj.x + obj.w && obj.box != this)
		
		if(thisLoop > this.timeup){
			this.deleteme = true;
		}
		this.box.xvel = this.xvel;
		this.box.yvel = this.yvel;
		this.box.x = this.x;
		this.box.y = this.y + 16;
		this.box.run();
		this.x = this.box.x;
		this.y = this.box.y - 16;
		this.xvel = this.box.xvel;
		this.yvel = this.box.yvel;
	}
}

// Collision detection class
function Box(x, y, w, h, xvel, yvel, colgroup, gravity, airRes){
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.col = colgroup;
	this.right = false;
	this.left = false;
	this.up = false;
	this.down = false;
	this.gravity = gravity;
	this.air = (typeof airRes === 'undefined' ? [0.99, 1] : airRes);
	this.health = 0;
	this.inlava = false;
	
	this.reset = function(){
		this.right = false;
		this.left = false;
		this.up = false;
		if(!this.inlava){
			this.down = false;
		}
	}
	
	this.collide = function(){
		// Check for collision with level
		var lv = level;
		var colareax = ((this.width - 2) >> 4) + 2;
		var colareay = ((this.height - 2) >> 4) + 2;
		var collision = false;
		var type = 'level';
		this.inlava = false;
		test = [];
		for(var hr = 0; hr < colareax; hr++){
			for(var vr = 0; vr < colareay; vr++){
				var xcol = (((this.x - (hr == colareax - 1 ? 1 + 16 - (((this.width - 1) % 16) + 1): 0)) >> 4) + hr);
				var ycol = (((this.y - (vr == colareay - 1 ? 1 + 16 - (((this.height - 1) % 16) + 1) : 0)) >> 4) + vr);
				if(ycol - 1 >= 0 && ycol <= lv.length){
					if(xcol >= 0 && xcol < lv[ycol].length){
						if(lv[ycol - 1][xcol] == '#'){
							collision = true;
						}else if(lv[ycol - 1][xcol] == 'x'){
							this.health -= 0.01 * speed;
							this.inlava = true;
							this.xvel *= Math.pow(0.997, speed);
							this.yvel *= Math.pow(0.997, speed);
						}else if(lv[ycol - 1][xcol] == 'w'){
							this.inlava = true;
							this.xvel *= Math.pow(0.999, speed);
							this.yvel *= Math.pow(0.999, speed);
						}else if(lv[ycol - 1][xcol] == 'F'){
							if(trialComplete == false){
								var time = r((new Date().getTime() - clockStart));
								finTime = toClock(time, 3);
								rawFinTime = time;
								var record = getCookie('trial record: ' + levelNo);
								if(rawFinTime < record || !record){
									setCookie('trial record: ' + levelNo, rawFinTime, 30);
									record = rawFinTime;
								}
								message = ['Level completed', 'Time : ' + finTime, 'Record : ' + toClock(record, 3)];
							}
							trialComplete = true;
						}
					}
				}
			}
		}
		if(this.col == 0){
			for(j in actors){
				var obj = actors[j];
				if(this.y < obj.y + obj.h && this.y + obj.h > obj.y && this.x + obj.w > obj.x && this.x < obj.x + obj.w && obj.box != this){
					collision = true;
				}
			}
		}
		
		return collision;
	}
	
	this.move = function(){
		if(!this.inlava){
			this.down = false;
		}
		var apparentVel = (this.xvel * speed) / (1000 / 60);
		var velToKill = Math.abs(apparentVel)
		var maxMove = Math.floor(this.width / 2);
		while(velToKill > 0){ // If velocity is more than half the box size, only move in increments of half box size to prevent clipping
			if(velToKill > maxMove){
				this.x += (this.xvel > 0 ? maxMove : -maxMove);
				velToKill -= maxMove;
			}else{
				this.x += (this.xvel > 0 ? velToKill : -velToKill);
				velToKill = 0;
			}
			if(this.collide() && Math.abs(this.xvel) > 0){
				this.x = ((this.x >> 4) << 4) + (this.xvel > 0 ? 16 - (((this.width - 1) % 16) + 1) : 16);
				this.xvel = 0;
				velToKill = 0;
			}
		}
		
		var apparentVel = (this.yvel * speed) / (1000 / 60);
		var velToKill = Math.abs(apparentVel);
		var maxMove = Math.floor(this.height / 2);
		while(velToKill > 0){
			if(velToKill > maxMove){
				this.y += (this.yvel > 0 ? maxMove : -maxMove);
				velToKill -= maxMove;
			}else{
				this.y += (this.yvel > 0 ? velToKill : velToKill * -1);
				velToKill = 0;
				
			}
			if(this.collide()){
				this.y = ((this.y >> 4) << 4) + (this.yvel > 0 ? 16 - (((this.height - 1) % 16) + 1) : 16);
				if(this.yvel < 0){
					this.down = true;
				}
				this.yvel = 0;
				velToKill = 0;
			}
		}
		
		if(this.collide()){
			this.unstuck(5000);
		}
		
		this.reset();
		
	}
	
	this.unstuck = function(limit){
		var j = 0;
		var originalx = this.x;
		var originaly = this.y;
		while(this.collide() && j < limit){
			this.x = r(originalx + (Math.sin(Math.PI * 2 * ((j % 16) / 16)) * (j / 4)));
			this.y = r(originaly + (Math.cos(Math.PI * 2 * ((j % 16) / 16)) * (j / 4)));
			j++;
		}
		if(j >= limit){
			this.x = originalx;
			this.y = originaly;
		}
	}
	
	this.run = function(){
		this.y += 1;
		if(this.collide() == false && this.gravity){
			this.yvel += (0.025 * gravity) * speed;
		}
		this.y -= 1;
		this.xvel *= Math.pow(this.air[0], speed);
		this.yvel *= Math.pow(this.air[1], speed);
		this.move();
	}
}

// Run game.

var speed;
var lastLoop = new Date();
var thisLoop = lastLoop;
function loopGame(){
	canvas.style.margin = (window.innerHeight > 360 ? window.innerHeight / 2 - 180 + 'px auto' : '10px auto');
    lastLoop = thisLoop;
	thisLoop = new Date();
    speed = (thisLoop - lastLoop);
	speed = (speed > 50 ? 50 : speed);
	context.clearRect(0, 0, 500, 350);
	limitLeft = 16;
	limitRight = 16;
	if(game == 'playing'){
		if(gameMode == 'free' || gameMode == 'adventure'){
			var maxx = 0;
			for(i in actors){
				if(actors[i].x > maxx){
					maxx = actors[i].x;
				}
			}
			maxx += 1;
			while(level[0].length < maxx){
				partIndex = Math.floor(Math.random() * (levelparts.length - 1)) + 1;
				partFound = false;
				if(partsInserted.length == 0){
					var toInsert = levelparts[0];
					partsInserted.push([false, '5n', 1, 1, 0]);
					partFound = true;
				}else{
					thisPart = levelparts[partIndex];
					if(thisPart[20] == partsInserted[partsInserted.length - 1][1] && (Math.random() * thisPart[24]) < 1){
						if(partsInserted[partsInserted.length - 1] != thisPart || Math.random() < 0){
							partsInserted.push([thisPart[20], thisPart[21], thisPart[22], thisPart[23], thisPart[24]]);
							toInsert = thisPart;
							partFound = true;
						}
					}
				}
				if(partFound){
					for(i = 0; i < 20; i++){
						level[i] += toInsert[i];
					}
				}
			}
			if(gameMode == 'adventure'){
				limitRight = 200000;
			}
		}else if(gameMode == 'time'){
			level = timelevels[levelNo];
			limitRight = (level[0].length << 4) - 516;
		}
	}
	for(i in controllers){
		controllers[i].checkKeys();
	}
	lookx = 0
	looky = 0;
	for(i in camera){
		lookx += (camera[i] instanceof Array ? camera[i][0] : camera[i].x + camera[i].xvel * 1) - 250;
	}
	lookx /= camera.length;
	looky /= camera.length;
	if(lookx < limitLeft){
		lookx = limitLeft;
	}
	if(lookx > limitRight && gameMode != 'free'){
		lookx = limitRight;
	}
	
	context.globalAlpha = 1;
	context.lineWidth = 1;
	var lv = level;
	for(i = 0; i < lv.length; i++){ // Draw level
		for(j = (lookx > 300 ? r((lookx - 300) / 16) : 0); j < r((lookx + 600) / 16); j++){
			if(lv[i][j] == '#' || lv[i][j] == 'x' || lv[i][j] == 'w'){
				//#efefef
				var edgeTile = false;
				if((j < lv[i].length && j > 0 && i < lv.length - 1 && i > 0)){
					var edgeChecks = [[-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];
					for(k in edgeChecks){
						if(lv[i + edgeChecks[k][0]][j + edgeChecks[k][1]] != '#'){
							edgeTile = true;
						}
					}
					if(edgeTile){
						context.fillStyle = '#ddd';
					}else{
						context.fillStyle = '#eee';
					}
				}
				if(lv[i][j] == 'x'){
					context.fillStyle = '#d77';
				}
				if(lv[i][j] == 'w'){
					context.fillStyle = '#47d';
				}
				context.fillRect((j << 4) - r(lookx), i << 4, 16, 16);
			}else if(lv[i][j] == 'E'){
				actors[actors.length] = new Actor(6, 'all', 100, 100, 3, j << 4, i << 4, 16, 16);
				ais[ais.length] = new Ai(actors.length - 1, 'alphaBot');
				level[i] = setStrChar(level[i], j, '.');
			}
		}
	}
	context.fillStyle = 'rgba(255, 200, 200, 0.7)';
	for(i in test){
		context.fillRect((test[i][0] << 4) - lookx, test[i][1] << 4, 16, 16);
	}
	for(i in actors){
		if(actors[i].x < lookx + 550 && actors[i].x > lookx - 50){
			actors[i].draw();
		}
	}
	context.globalAlpha = 1;
	context.fillStyle = "#444";
	context.font = "10pt Arial";
	context.textAlign = 'left';
	if(game == 'playing'){
		context.strokeStyle = '#555';
		context.fillStyle = '#c54';
		context.fillRect(10, 285, camera[0].health / 2, 10);
		context.strokeRect(10, 285, camera[0].maxhealth / 2, 10);
		context.fillStyle = '#68f';
		context.fillRect(10, 300, camera[0].energy / 2, 10);
		context.strokeRect(10, 300, camera[0].maxenergy / 2, 10);
		context.fillStyle = '#444';
	}else{
		context.fillText('W and S to move', 10, 270);
		context.fillText('Enter to select', 10, 290);
		context.fillText('A and D to change slider value', 10, 310);
	}
	lastspeed = (new Date() % 10 == 0 ? r(1000 / speed) : lastspeed);
	context.fillText('FPS: ' + lastspeed, 10, 20);
	if(game == 'playing'){
		if(gameMode == 'time'){
			var time = r((new Date().getTime() - clockStart));
			if(trialComplete && !message){
				toMenu();
				ui.area = 7;
				ui.select = levelNo;
			}
			context.fillText('Time: ' + (finTime ? finTime : toClock(time, 1)), 10, 40);
		}else{
			trialComplete = false;
		}
	}else{
		trialComplete = false;
	}
	context.textAlign = 'right';
	if(mobile){
		context.fillText('RetX: ' + r(mouse.x), 420, 290);
		context.fillText('RetX: ' + r(mouse.y), 490, 290);
		context.fillText('Sint mobile version α 0.6', 490, 310);
	}else{
		context.fillText('Sint version α 0.6', 490, 20); // β
	}
	context.fillText(test, 490, 290);
	for(i in ais){
		if(Math.abs(ais[i].actor.x - lookx) < 2000){
			ais[i].run();
		}
	}
	for(i in actors){
		actors[i].simulate();
	}
	for(i in particles){
		particles[i].simulate();
		particles[i]. draw();
	}
	for(i in items){
		items[i].run();
		items[i].draw();
	}
	
	
	if(message){
		context.strokeStyle = '#555';
		context.fillStyle = '#ccc';
		context.fillRect(100, 100, 300, 120);
		context.strokeRect(100, 100, 300, 120);
		context.textAlign = 'center';
		context.fillStyle = '#9bf';
		context.fillRect(150, 180, 200, 25);
		context.font = '12pt Helvetica';
		context.fillStyle = '#fff';
		context.fillText('Enter to Continue', 250, 198);
		for(j = 0; j < message.length; j++){
			context.fillText(message[j], 250, 130 + (20 * j));
		}
		if(keysDown.indexOf(13) > -1){
			message = false;
		}
	}
	
	if(game == 'menu'){
		if(keysDown.indexOf(83) > -1 && moveLocked == false){
			ui.select += 1;
		}else{
			menudown = false;
		}
		if(keysDown.indexOf(87) > -1 && moveLocked == false){
			ui.select -= 1;
		}
		ui.select = (ui.select + menu[ui.area].length) % menu[ui.area].length;
		if(menu[ui.area][0] == 't'){
			ui.select = 0;
		}
		var thisType = menu[ui.area][ui.select][1];
		// Draw menu
		context.fillStyle = '#69d';
		context.font = '40pt Helvetica';
		context.textAlign = 'center';
		context.shadowColor = '#69d';
		context.shadowBlur = 10;
		context.fillText('Sint', 250, 100);
		context.shadowBlur = 0;
		// Main menu
		if(mobile){
			play();
			game = 'playing';
			gameMode = 'free';
		}
		if(menu[ui.area][0] == 'r'){
			switch(menu[ui.area][1]){
				case 'play':
					play();
					game = 'playing';
					gameMode = 'free';
					break;
				case 'time':
					play();
					clockStart = new Date().getTime();
					game = 'playing';
					gameMode = 'time';
					break;
				case 'adventure':
					play();
					var controls = controlChar(optionvars[2]) + ", " + controlChar(optionvars[3]) + " and " + controlChar(optionvars[4]);
					message = ['Use ' + controls + ' to move', 'Mouse to aim and click to shoot', 'Get past level 20 to win'];
					game = 'playing';
					gameMode = 'adventure';
					break;
				default:
					ui.area = 0;
					break;
			}
		}else if(menu[ui.area][0] == 't'){
					context.fillStyle = '#78a';
					context.font = '12pt Helvetica';
					for(i = 1; i < menu[ui.area].length; i++){
						context.fillText(menu[ui.area][i], 250, 120 + (20 * i));
					}
					context.fillStyle = '#9bf';
					context.fillRect(150, 130 + (20 * i), 200, 25);
					context.font = '12pt Helvetica';
					context.fillStyle = '#fff';
					context.fillText('Back', 250, 148 + (20 * i));
		}else{
			for(i in menu[ui.area]){
				if(menu[ui.area][i][1] == 's'){
					context.fillStyle = (ui.select == i ? '#9bf' : '#cdf');
					context.fillRect(150, 150 + (30 * i), 80, 25);
					context.font = '12pt Helvetica';
					context.fillStyle = (ui.select == i ? '#fff' : '#eef');
					context.fillText(menu[ui.area][i][0], 190, 168 + (30 * i));
					context.fillStyle = '#eee';
					context.strokeStyle = (ui.select == i ? '#cdf' : '#ddf');
					context.fillRect(240, 160 + (30 * i), 110, 5);
					context.strokeRect(240, 160 + (30 * i), 110, 5);
					context.fillStyle = (ui.select == i ? '#9bf' : '#cdf');
					context.strokeStyle = (ui.select == i ? '#79f' : '#abf');
					var thisoption = menu[ui.area][i][2];
					var optionaddx = 100 * (optionvars[thisoption] / (menu[ui.area][i][4] - menu[ui.area][i][3]));
					context.strokeRect(240 + optionaddx, 155 + (30 * i), 10, 10);
					context.fillRect(240 + optionaddx, 155 + (30 * i), 10, 10);
					if(ui.select == i){
						if(keys.indexOf(65) > -1){
							if(optionvars[thisoption] > menu[ui.area][i][3]){
								optionvars[thisoption] -= 0.1 * speed;
							}else{
								optionvars[thisoption] = menu[ui.area][i][3]
							}
						}
						if(keys.indexOf(68) > -1){
							if(optionvars[thisoption] < menu[ui.area][i][4]){
								optionvars[thisoption] += 0.1 * speed;
							}else{
								optionvars[thisoption] = menu[ui.area][i][4]
							}
						}
					}
				}else if(menu[ui.area][i][1] == 'c'){
					context.fillStyle = (ui.select == i ? '#9bf' : '#cdf');
					context.fillRect(150, 120 + (30 * i), 80, 25);
					context.font = '12pt Helvetica';
					context.fillStyle = (ui.select == i ? '#fff' : '#eef');
					context.fillText(menu[ui.area][i][0], 190, 138 + (30 * i));
					context.fillStyle = (ui.select == i ? '#9bf' : '#cdf');
					context.fillRect(240, 120 + (30 * i), 110, 25);
					context.fillStyle = (ui.select == i ? '#fff' : '#eef');
					var tempIn = optionvars[parseInt(i) + 2];
					tempIn = controlChar(tempIn);
					if(tempIn == 0){
						tempIn = 'Enter key';
					}
					context.fillText(tempIn, 290, 138 + (30 * i));
					
					if(ui.select == i){
						if(keysDown.length > 0 && keysDown.indexOf(13) > -1 && moveLocked == false){
							moveLocked = true;
							optionvars[ui.select + 2] = 0;
						}else if(keysDown.length > 0 && moveLocked == true){
							optionvars[ui.select + 2] = keysDown[0];
							moveLocked = false;
						}
					}
				}else{
					thisOne = menu[ui.area];
					if(thisOne[i].length > 3){
						var more = thisOne[i][3];
					}else{
						var more = false;
					}
					context.fillStyle = (ui.select == i ? '#9bf' : '#cdf');
					context.fillRect((more == 'tl' ? 100 : 150), (typeof more === 'number' ? more : 150) + (30 * i), (more == 'tl' ? 300 : 200), 25);
					context.font = '12pt Helvetica';
					context.fillStyle = (ui.select == i ? '#fff' : '#eef');
					context.fillText(menu[ui.area][i][0], 250, (typeof more === 'number' ? more + 18 : 168) + (30 * i));
				}
			}
		}
		if(keysDown.indexOf(13) > -1 && thisType != 'c' && thisType != 's'){
			if(menu[ui.area][ui.select][0] == 't'){
				ui.area = 0;
				ui.select = 0;
			}else if(menu[ui.area][ui.select][3] == 'tl'){
				levelNo = ui.select;
				ui.area = 8;
				ui.select = 0;
			}else{
				ui.area = menu[ui.area][ui.select][1];
				ui.select = 0;
			}
		}
	}
	
	var len = 0;
	if(actors.length > len){
		len = actors.length;
	}
	if(particles.length > len){
		len = particles.length;
	}
	if(items.length > len){
		len = items.length;
	}
	for(i = 0; i < len; i++){
		if(actors.length > i && actors[i].deleteme){
			actors.splice(i, 1);
		}
		if(ais.length > i && ais[i].deleteme){
			ais.splice(i, 1);
		}
		if(particles.length > i && particles[i].deleteme){
			particles.splice(i, 1);
		}
		if(items.length > i && items[i].deleteme){
			items.splice(i, 1);
		}
	}
	
	// Slow down game to test low framerates
	if(slow){
		for(var j=1; j < 10000000; j++){
			j = j;
		}
	}
	if(tomenu){
		toMenu();
	}
	keysDown = [];
}