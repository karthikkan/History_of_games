//canvas width/height
var ctx4 = document.getElementById("mario").getContext('2d');
var width4 = ctx4.canvas.width = 1000;
var height4 = ctx4.canvas.height = 600;

var marioEnd = false;

var camOffset = 0;
var invinceFrames = 75;

//load images
var marioShort = document.getElementById("marioShort");
var blockSkins = [document.getElementById("marioGround"),//ground
                  document.getElementById("marioBrick"),//bricks
                  document.getElementById("marioPowerup")//powerup
                 ];
var marioGoomba = document.getElementById("marioGoomba");//couldn't find a transparent image btw
var marioMushroom = document.getElementById("marioMushroom");
var marioFlag = document.getElementById("marioFlag");

var goombas = [];
var blocks = [];
var mushrooms = [];

//block pattern (0 is air, 1 is ground, 2 is brick, 3 is box, 4 is goomba spawn)
var blockMap = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,4,0,0,0,0,4,0,0,0,0,4,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,0,4,2,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,2,2,2,2,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,4,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
var blockSize = 50;

//blocks (50x50)
function MarioBlock(type, x,y) {
  this.type = type;// (0 is air, 1 is ground, 2 is brick, 3 is box)
  this.pos = [x,y];
  this.breakable = false;
  this.hit = false;//check if block was hit from bottom

  if (this.type == 2) this.breakable = true;
}

MarioBlock.prototype.spawnPowerup = function(){
  if (this.type == 3 && this.hit) {//only spawn for power boxes
    this.type = 2;//change visual
    mushrooms.push(new Mushroom(this.pos[0],this.pos[1]-blockSize))
  }
}

MarioBlock.prototype.draw = function(ctx4) {
  ctx4.drawImage(blockSkins[this.type-1],this.pos[0] + camOffset,this.pos[1],blockSize,blockSize)
}


//generic entity
function MarioEntity(type, x, y) {
  this.type = 0;//0 is goomba, 1 is player, 2 is mushroom
  this.pos = [x,y];//x,y
  this.vel = [0,0];
  this.acc = [0,0];
  this.hitbox = [45,45];//default size
  this.alive = true;
  this.onGround = false;
  this.direction = 1;//0 left, 1 right
}

MarioEntity.prototype.update = function() {
  //gravity
  this.acc[1] = 0.5;
  this.collideBlocks();
  if (this.type == 1) this.getInputs(); //allow player to use inputs
  this.acc[0] = this.vel[0]*-0.2;
  this.vel[0] += this.acc[0];
  this.vel[1] += this.acc[1];
  this.pos[0] += this.vel[0];
  this.pos[1] += this.vel[1];
  //fall off edge
  if (this.pos[1] >= width4) this.alive = false;
}

MarioEntity.prototype.collideBlocks = function() {
  //i hated this sm
  this.onGround = false;
  blocks.forEach((b) => {
    //calculate priority of collision (top vs sides)
    var overlapSide = 0;
    var overlapTop = 0;

    //within border
    if (this.pos[0]+this.hitbox[0] >= b.pos[0] && this.pos[0] <= b.pos[0]+blockSize &&
       this.pos[1]+this.hitbox[1] >= b.pos[1] && this.pos[1] <= b.pos[1]+blockSize
       ) {
      //overlap horizontally (across top)
      if (this.pos[0] <= b.pos[0])
        overlapTop = this.pos[0]+this.hitbox[0]-b.pos[0];
      else 
        overlapTop = b.pos[0]+blockSize - this.pos[0];
      //overlap vertically (on sides)
      if (this.pos[1] <= b.pos[1])
        overlapSide = this.pos[1]+this.hitbox[1]-b.pos[1];
      else 
        overlapSide = b.pos[1]+blockSize - this.pos[1];
    }
    //console.log(`overlaptop ${overlapTop}, overlapside ${overlapSide}`)
    //prioritize vertical movement -> bonk head or on ground
    if (overlapTop > overlapSide) {
      //landing on top
      if (this.pos[1]+this.hitbox[1] >= b.pos[1] && this.pos[1] <= b.pos[1]) {
        this.pos[1] = b.pos[1]-this.hitbox[1];//stop on ground
        this.acc[1] = 0;
        this.vel[1] = 0;
        this.onGround = true;
      }
      //hitting head
      else if (this.pos[1] <= b.pos[1]+blockSize && this.pos[1] >= b.pos[1]) {
        this.vel[1] *= -1;//bounce downward
        b.hit = true;//break the block/check for powerup
        b.spawnPowerup();//spawn powerup (only runs if its a box)
      }
    }

    //prioritize horizontal movement -> bounce sides
    if (overlapTop < overlapSide) {
      //hit left side
      if (this.pos[0]+this.hitbox[0] >= b.pos[0] && this.pos[0] <= b.pos[0]) {
        this.pos[0] = b.pos[0]-this.hitbox[0];
        this.vel[0] = -Math.abs(this.vel[0]);//push left
        this.direction = 0;
      }
      //hit right side
      else if (this.pos[0] <= b.pos[0]+blockSize && this.pos[0] >= b.pos[0]) {
        this.pos[0] = b.pos[0]+blockSize;
        this.vel[0] = Math.abs(this.vel[0]);//push right
        this.direction = 1;
      }
    }
  });
}

MarioEntity.prototype.getInputs = function() {
  if (keys.KeyA) {
    this.vel[0] -= 2;
    this.direction = 0;
  }
  if (keys.KeyD) {
    this.vel[0] += 2;
    this.direction = 1;
  }
  if (keys.KeyW&&this.onGround) this.vel[1] = -14;
}

MarioEntity.prototype.draw = function(ctx4){
  ctx4.fillStyle = "red";
  ctx4.fillRect(this.pos[0] + camOffset,this.pos[1],this.hitbox[0],this.hitbox[1]);
}

//enemies
function Goomba(x, y) {
  MarioEntity.call(this, 0, x, y);
  this.type = 0;
}
Object.setPrototypeOf(Goomba.prototype, MarioEntity.prototype);

Goomba.prototype.update = function() {
  MarioEntity.prototype.update.call(this);//get the old update stuff
  this.vel[0] = 2*(this.direction-0.5);
}

Goomba.prototype.draw = function() { ctx4.drawImage(marioGoomba,this.pos[0]+camOffset,this.pos[1],this.hitbox[0],this.hitbox[1]);
}

//powerup
function Mushroom(x, y) {
  MarioEntity.call(this, 2, x, y);
  this.type = 2;
}
Object.setPrototypeOf(Mushroom.prototype, MarioEntity.prototype);

Mushroom.prototype.update = function() {
  MarioEntity.prototype.update.call(this);//get the old update stuff
  this.vel[0] = 3*(this.direction-0.5);
}

Mushroom.prototype.draw = function() { ctx4.drawImage(marioMushroom,this.pos[0]+camOffset,this.pos[1],this.hitbox[0],this.hitbox[1]);
}


//player
function Mario(x, y) {
  MarioEntity.call(this, 1, x, y);
  this.type = 1;
  this.hasMushroom = false;
  this.invinceFrames = invinceFrames;//invincibility frames
}
Object.setPrototypeOf(Mario.prototype, MarioEntity.prototype);

Mario.prototype.update = function() {
  //detect goomba
  this.collideGoomba();
  this.collideMushroom();
  MarioEntity.prototype.update.call(this);//get the old update stuff
  camOffset = Math.min(camOffset,300-this.pos[0]);//move camera
  //change mario size
  if (this.mushroom) this.hitbox[1] = 90;
  else this.hitbox[1] = 45;
  this.invinceFrames --;
}

Mario.prototype.collideGoomba = function() {
  goombas.forEach((g) => {
    //calculate priority of collision (top vs sides)
    var overlapSide = 0;
    var overlapTop = 0;

    //within border
    if (this.pos[0]+this.hitbox[0] >= g.pos[0] && this.pos[0] <= g.pos[0]+g.hitbox[0] &&
       this.pos[1]+this.hitbox[1] >= g.pos[1] && this.pos[1] <= g.pos[1]+g.hitbox[1]
       ) {
      //overlap horizontally (across top)
      if (this.pos[0] <= g.pos[0])
        overlapTop = this.pos[0]+this.hitbox[0]-g.pos[0];
      else 
        overlapTop = g.pos[0]+g.hitbox[0] - this.pos[0];
      //overlap vertically (on sides)
      if (this.pos[1] <= g.pos[1])
        overlapSide = this.pos[1]+this.hitbox[1]-g.pos[1];
      else 
        overlapSide = b.pos[1]+blockSize - this.pos[1];
    }
    //console.log(`overlaptop ${overlapTop}, overlapside ${overlapSide}`)
    //prioritize vertical movement -> bonk head or on ground
    if (overlapTop > overlapSide) {
      //landing on top
      if (this.pos[1]+this.hitbox[1] >= g.pos[1] && this.pos[1] <= g.pos[1]) {
        //kill goomba
        g.alive = false;
        this.vel[1] = -7;//jump
      }
      //hitting head
      else if (this.pos[1] <= g.pos[1]+g.hitbox[1] && this.pos[1] >= g.pos[1]) {
        //kill player
        this.damage();
      }
    }

    //prioritize horizontal movement -> bounce sides
    if (overlapTop < overlapSide) {
      //hit left side
      if (this.pos[0]+this.hitbox[0] >= g.pos[0] && this.pos[0] <= g.pos[0]) {
        //kill player
        this.damage();
      }
      //hit right side
      else if (this.pos[0] <= g.pos[0]+g.hitbox[0] && this.pos[0] >= g.pos[0]) {
        //kill player
        this.damage();
      }
    }
  });
}

Mario.prototype.collideMushroom = function() {
  mushrooms.forEach((m) => {
    if (this.pos[0]+this.hitbox[0] >= m.pos[0] && this.pos[0] <= m.pos[0]+m.hitbox[0] &&
       this.pos[1]+this.hitbox[1] >= m.pos[1] && this.pos[1] <= m.pos[1]+m.hitbox[1]
       ) {
      m.alive = false;
      this.mushroom = true;
      this.pos[1] -= 50;
    }
  });
}

Mario.prototype.damage = function() {
  //invince frames
  if (this.invinceFrames > 0) return;
  this.invinceFrames = invinceFrames;
  if (this.mushroom) this.mushroom = false;
  else this.alive = false;
}

Mario.prototype.draw = function() {
  ctx4.translate(this.pos[0] + camOffset,this.pos[1]);
  if (this.direction == 0) {
    ctx4.scale(-1,1);
    ctx4.translate(-this.hitbox[0],0);
  }
  if (this.invinceFrames < 0 || this.invinceFrames % 25 > 12) {//flashing while invincible
      ctx4.drawImage(marioShort,0,0,this.hitbox[0],this.hitbox[1]);
  }
  ctx4.resetTransform();
}

var marioPlayer = new Mario(100, 0);


function startMario() {
  camOffset = 0;
  goombas = [];
  blocks = [];
  marioPlayer = new Mario(100, 0);
  //generate map
  for (var y = 0; y < blockMap.length; y++) {
    for (var x = 0; x < blockMap[0].length; x++) {
      if (blockMap[y][x] != 0){
        if (blockMap[y][x] == 4) {//spawn goomba
          goombas.push(new Goomba(blockSize*x, blockSize*y+200));
          continue;
        }
        //spawn block
        blocks.push(new MarioBlock(blockMap[y][x], blockSize*x, blockSize*y+200));
      }
    }
  }
  //add map ending
  for (var i = 0; i < 15; i++) {
    blocks.push(new MarioBlock(1, blockSize*(x+i), blockSize*(y-1)+200));
  }
  marioEnd = false;
}
startMario();

setInterval(()=>{
  if (!marioEnd) {
    ctx4.fillStyle = "rgb(0,138,197)";
    ctx4.fillRect(0,0,width4,height4);
    //draw player
    marioPlayer.update();
    marioPlayer.draw(ctx4);
    if (!marioPlayer.alive) marioEnd = true;
    //check if reached the end
    if (marioPlayer.pos[0] > blockMap[0].length*blockSize) marioEnd = true;
  
    //draw enemies
    for (var i = 0; i < goombas.length; i++) {
      goombas[i].update();
      goombas[i].draw(ctx4);
      if (!goombas[i].alive) {
        goombas = goombas.slice(0,i).concat(goombas.slice(i+1));
        i--;
      }
    }

    //draw powerup
    for (var i = 0; i < mushrooms.length; i++) {
      mushrooms[i].update();
      mushrooms[i].draw(ctx4);
      if (!mushrooms[i].alive) {
        mushrooms = mushrooms.slice(0,i).concat(mushrooms.slice(i+1));
        i--;
      }
    }

    //draw flag at the end
    ctx4.drawImage(marioFlag, blockMap[0].length*blockSize + camOffset, height4-blockSize*5.3, blockSize*1.5, blockSize*5.5);
    
    //draw blocks
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].draw(ctx4);
      if (blocks[i].hit&&blocks[i].breakable) {
        blocks = blocks.slice(0,i).concat(blocks.slice(i+1));
        i--;
      }
    }
  } else {
    //end game
    ctx4.font = "50px Courier New";
    ctx4.fillStyle = "white";
    ctx4.textAlign = "center";
    ctx4.fillText("GAME OVER!",width4/2,height4/2);
    if (!marioPlayer.alive) {
      ctx4.fillText("You lost!",width4/2,height4/2+60);
    } else {
      ctx4.fillText("You won!",width4/2,height4/2+60);
    }
  }
  
},20);