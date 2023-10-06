//canvas width/height
var ctx3 = document.getElementById("invaders").getContext('2d');
var width3 = ctx3.canvas.width = 800;
var height3 = ctx3.canvas.height = 800;

var invaderEnemies = [];
var invaderBullets = [];
var invaderTimer = 0;
var invaderEnd = true;
var invaderDirection = 1;//1 right, -1 left
var invaderDown = false;
var invaderX = 0;
var invaderEnemySpeed = 12;
var invaderSpacing = 75;
var invaderPlayer;

//invader (11x8)
var invaderBits1 = [
  [0,0,1,0,0,0,0,0,1,0,0],
  [0,0,0,1,0,0,0,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,1],
  [0,0,0,1,1,0,1,1,0,0,0]
];

//draw all the characters from a bitmap at 0,0
function drawBits(ctx3,data,width,height) {
  ctx3.fillStyle = "white";
  for (var y = 0; y < data.length; y++) {
    for (var x = 0; x < data[0].length; x++) {
      if (data[y][x]==1) ctx3.fillRect(x*width, y*height, width, height);
    }
  }
}

function InvaderEnemy(x,y) {
  this.pos = [x,y];//x,y
  this.alive = true;
  
  //firing cooldown
  this.cooldown = 300+ Math.random()*300;
}

InvaderEnemy.prototype.update = function() {
  this.checkCollision();
  if (invaderTimer%20 == 0) {
    this.move(invaderDirection, invaderDown);
  }
  //update kinematics
  this.cooldown --;
}

InvaderEnemy.prototype.move = function(direction, down) {
  if (down) {
    this.pos[1] += 25;
    return;
  }
  if (direction == 1) this.pos[0] += invaderEnemySpeed;
  else if (direction == -1) this.pos[0] -= invaderEnemySpeed;
}

InvaderEnemy.prototype.checkCollision = function(){
  //hit box is 44x32
  //collide with bullets
  invaderBullets.forEach((b)=>{
    if (b.team == 1) return;
    if (b.pos[0]>this.pos[0]-22&&b.pos[0]<this.pos[0]+22 &&
        b.pos[1]>this.pos[1]-16&&b.pos[1]<this.pos[1]+16) {
      this.alive = false;
      b.dur = 0;//destroy bullet
    }
  })
}

InvaderEnemy.prototype.shoot = function(){
  if (this.cooldown > 0) return;
  this.cooldown = 300+ Math.random()*300;
  invaderBullets.push(new InvaderBullet(1, this.pos[0], this.pos[1]+17, 0, 5));
}

InvaderEnemy.prototype.draw = function(ctx3) {
  ctx3.translate(this.pos[0]-22,this.pos[1]-22);
  drawBits(ctx3, invaderBits1, 4, 4);
  ctx3.resetTransform();
}

//Player
function InvaderPlayer() {
  this.pos = [width3/2,height3-50];//x,y
  this.alive = true;
  
  //firing cooldown
  this.cooldown = 50;
}

InvaderPlayer.prototype.update = function() {
  this.checkCollision();
  //update kinematics
  this.cooldown --;
}

InvaderPlayer.prototype.checkCollision = function(){
  //hit box is 44x32
  //collide with bullets
  invaderBullets.forEach((b)=>{
    if (b.team == 0) return;
    if (b.pos[0]>this.pos[0]-22&&b.pos[0]<this.pos[0]+22 &&
        b.pos[1]>this.pos[1]-16&&b.pos[1]<this.pos[1]+16) {
      this.alive = false;
      b.dur = 0;//destroy bullet
    }
  })
}

InvaderPlayer.prototype.shoot = function(){
  if (this.cooldown > 0) return;
  this.cooldown = 50;
  invaderBullets.push(new InvaderBullet(0, this.pos[0], this.pos[1]-17, 0, -5));
}

InvaderPlayer.prototype.draw = function(ctx3) {
  ctx3.fillStyle = "green";
  ctx3.fillRect(this.pos[0]-22,this.pos[1],44,24);
  ctx3.fillRect(this.pos[0]-4,this.pos[1]-12,8,13);
}

InvaderPlayer.prototype.moveLeft = function() { this.pos[0]-=6;}

InvaderPlayer.prototype.moveRight = function() { this.pos[0]+=6;}

//Bullets
function InvaderBullet(team, x, y, vx, vy) {
  //team 0 is player, team 1 is enemy
  this.team = team;
  this.pos = [x, y];
  this.vel = [vx, vy];
  this.dur = 150;//bullets expire
}

InvaderBullet.prototype.update = function() {
  this.pos[0] += this.vel[0];
  this.pos[1] += this.vel[1];
  this.dur--;
}

InvaderBullet.prototype.draw = function(ctx3) {
  ctx3.fillStyle = "white";
  ctx3.fillRect(this.pos[0]-3,this.pos[1]-9,6,18);
}

//start game
function startInvaders() {
  invaderEnemies = [];
  for (var y = 0; y < 5; y++) {
    for (var x = 0; x < 8; x++) {
      invaderEnemies.push(new InvaderEnemy(25 + x*invaderSpacing, 100 + y*50));
    }
  }
  invaderBullets = [];
  invaderPlayer = new InvaderPlayer();
  invaderEnd = false;
}
startInvaders();

setInterval(()=>{
  ctx3.fillStyle = "rgb(0,0,0)";
  ctx3.fillRect(0,0,width1, height1);

  //drawBits(ctx3,invaderBits,10,10)
  if (!invaderEnd) {
    //draw invaderEnemies
    for (var i = 0; i < invaderEnemies.length; i++) {
      var p = invaderEnemies[i];
      p.update();
      p.shoot();
      p.draw(ctx3);
      if (!p.alive) {
        invaderEnemies = invaderEnemies.slice(0,i).concat (invaderEnemies.slice(i+1));
        i--;
      }
    }
    if (invaderEnemies.length == 0) {
      invaderEnd = true;
    }
    //move invader enemies
    if (invaderDown) {
      invaderDown = false;
    }
    if (invaderTimer%20==0) invaderX += invaderEnemySpeed * invaderDirection;
    
    if (invaderX>width3-8*invaderSpacing) {
      invaderDown = true;
      invaderDirection = -1;
    }
    if (invaderX<0) {
      invaderDown = true;
      invaderDirection = 1;
    }
    //draw bullets
    for (var i = 0; i < invaderBullets.length; i++) {
      var b = invaderBullets[i];
      b.update();
      b.draw(ctx3);
      if (b.dur <= 0) {
        invaderBullets = invaderBullets.slice(0,i).concat (invaderBullets.slice(i+1));
        i--;
      }
    }
    //draw player
    invaderPlayer.update();
    invaderPlayer.draw(ctx3);
    if (!invaderPlayer.alive) invaderEnd = true;
    //key presses
    if (keys.KeyA) invaderPlayer.moveLeft();
    if (keys.KeyD) invaderPlayer.moveRight();
    if (keys.Space) invaderPlayer.shoot();
    invaderTimer++;
  } else {
    //end game
    ctx3.font = "20px Courier New";
    ctx3.fillStyle = "white";
    ctx3.textAlign = "center";
    ctx3.fillText("GAME OVER!",width1/2,height1/2);
    if (invaderEnemies.length==0) {
      ctx3.fillText("You won!",width1/2,height1/2+30);
    } else {
      ctx3.fillText("You lost!",width1/2,height1/2+30);
    }
  }
}, 20);//high fps to reflect the era