//canvas width/height
var ctx1 = document.getElementById("spacewar").getContext('2d');
var width1 = ctx1.canvas.width = 800;
var height1 = ctx1.canvas.height = 800;

//images
var spacewarShip = [document.getElementById("spacewar1"),
                    document.getElementById("spacewar2")];

//tweakable vars
var starMass = 100;
var playerMass = 1;
var acc = 0.3;
var maxSpeed = 3;
var starPos = [width1/2, height1/2];
var G = 10;//gravity constant
var botAction = 0;//0 - nothing, 1 - left, 2 - right

var spacewarPlayers = [];
var spacewarMissiles = [];
var spacewarTimer = 0;
var spacewarEnd = true;

var distance = function(x1,y1,x2,y2) {
  return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}

function SpacewarShip(id, x,y) {
  this.id = id;
  this.pos = [x,y];//x,y
  this.vel = [0,0];
  this.acc = [0,0];
  this.angle = 0;
  this.alive = true;
  
  //firing cooldown
  this.cooldown = 20;
}

SpacewarShip.prototype.update = function() {
  this.applyGravity();
  this.checkEdges();
  this.checkCollision();
  //update kinematics
  this.vel[0] = Math.min(maxSpeed,Math.max(-maxSpeed,this.vel[0]));
  this.vel[1] = Math.min(maxSpeed,Math.max(-maxSpeed,this.vel[1]));
  this.pos[0] += this.vel[0];
  this.pos[1] += this.vel[1];
  this.cooldown --;
}

SpacewarShip.prototype.checkEdges = function() {
  if (this.pos[0] < 0) this.pos[0] = width1;
  if (this.pos[0] > width1) this.pos[0] = 0;
  if (this.pos[1] < 0) this.pos[1] = height1;
  if (this.pos[1] > height1) this.pos[1] = 0;
}

SpacewarShip.prototype.applyGravity = function() {
  //F = G(m1*m2)/(r^2) gravity eq
  //var starDist = (starPos[0] - this.pos[0])**2 + (starPos[1] - this.pos[1])**2;
  var starDist = distance(starPos[0],starPos[1],this.pos[0],this.pos[1])
  var angle = Math.atan2(starPos[1] - this.pos[1], starPos[0] - this.pos[0]);
  var force = G*(starMass*playerMass) / (starDist**2);
  //console.log(force);
  this.vel[0] += Math.cos(angle) * force;
  this.vel[1] += Math.sin(angle) * force;
}

SpacewarShip.prototype.checkCollision = function(){
  //collide with players
  spacewarPlayers.forEach((p)=>{
    if (p.id == this.id) return;
    if (distance(p.pos[0],p.pos[1],this.pos[0],this.pos[1]) < 30) {
      this.alive = false;
      //console.log("player col")
    }
  });
  //collide with star
  if (distance(this.pos[0],this.pos[1],starPos[0],starPos[1]) < 40) {
    this.alive = false;
    //console.log("star col")
  }
  //collide with bullets
  spacewarMissiles.forEach((m)=>{
    if (distance(m.pos[0],m.pos[1],this.pos[0],this.pos[1]) < 30) {
      this.alive = false;
      //console.log("bullet col")
    }
  })
}

SpacewarShip.prototype.shoot = function(){
  if (this.cooldown > 0) return;
  this.cooldown = 20;
  var vx = Math.cos(this.angle) * 5;
  var vy = Math.sin(this.angle) * 5;
  spacewarMissiles.push(new SpacewarMissile(this.pos[0] + 9*vx,this.pos[1] + 9*vy, vx, vy));
}

SpacewarShip.prototype.draw = function(ctx1,model) {
  ctx1.translate(this.pos[0],this.pos[1]);
  ctx1.rotate(this.angle + Math.PI/2);
  //draw player
  ctx1.drawImage(spacewarShip[model],-10,-20,20,40);
  ctx1.resetTransform();
}

function SpacewarMissile(x,y, vx, vy) {
  this.pos = [x, y];
  this.vel = [vx, vy];
  this.dur = 250;
}

SpacewarMissile.prototype.update = function() {
  this.pos[0] += this.vel[0];
  this.pos[1] += this.vel[1];
  this.dur--;
}

SpacewarMissile.prototype.draw = function(ctx1) {
  ctx1.fillStyle = "white";
  ctx1.fillRect(this.pos[0]-3,this.pos[1]-3,6,6)
}

//start game
function startSpacewar() {
  spacewarPlayers = [new SpacewarShip(0,100,100),new SpacewarShip(1,width1-100,height1-100)];
  spacewarMissiles = [];
  spacewarEnd = false;
}
startSpacewar();

setInterval(()=>{
  ctx1.fillStyle = "rgb(0,0,0)";
  ctx1.fillRect(0,0,width1, height1);
  if (!spacewarEnd) {
    //draw spacewarPlayers
    spacewarPlayers.forEach((p, i)=>{
      p.update();
      p.draw(ctx1,i);
      if (!p.alive) spacewarEnd = true;
    });
    //draw bullets
    for (var i = 0; i < spacewarMissiles.length; i++) {
      var m = spacewarMissiles[i];
      m.update();
      m.draw(ctx1);
      if (m.dur == 0) {
        spacewarMissiles = spacewarMissiles.slice(0,i).concat (spacewarMissiles.slice(i+1));
        i--;
      }
    }
    //draw star
    ctx1.fillStyle = "white";
    ctx1.translate(starPos[0],starPos[1]);
    ctx1.rotate(spacewarTimer/2);
    ctx1.fillRect(-3,-20,6,40);
    ctx1.fillRect(-20,-3,40,6);
    ctx1.resetTransform();
    spacewarTimer++;
    
    //key presses (player 1 only)
    if (keys.KeyA) spacewarPlayers[0].angle -= 0.1;
    if (keys.KeyD) spacewarPlayers[0].angle += 0.1;
    if (keys.KeyW) {
      spacewarPlayers[0].vel[0] += Math.cos(spacewarPlayers[0].angle) * acc;
      spacewarPlayers[0].vel[1] += Math.sin(spacewarPlayers[0].angle) * acc;
    }
    if (keys.Space) {
      spacewarPlayers[0].shoot();
    }

    //bot movements
    if (Math.random() < 0.01) {
      botAction = Math.floor(Math.random()*3);
    }
    if (botAction==1) spacewarPlayers[1].angle -= 0.1;
    if (botAction==2) spacewarPlayers[1].angle += 0.1;
    
    spacewarPlayers[1].vel[0] += Math.cos(spacewarPlayers[1].angle) * acc;
    spacewarPlayers[1].vel[1] += Math.sin(spacewarPlayers[1].angle) * acc;
    spacewarPlayers[1].shoot();
  } else {
    //end game
    ctx1.font = "20px Courier New";
    ctx1.fillStyle = "white";
    ctx1.textAlign = "center";
    ctx1.fillText("GAME OVER!",width1/2,height1/2);
    if (spacewarPlayers[0].alive) {
      ctx1.fillText("You won!",width1/2,height1/2+30);
    } else {
      ctx1.fillText("You lost!",width1/2,height1/2+30);
    }
  }
}, 70);//low fps to reflect the era