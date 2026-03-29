var pacman, pacAnim
var score=0
var speedx=-1,speedy=0
var lives=3
function preload(){
  pacAnim=loadAnimation("./Images/Pac1.png","./Images/Pac2.png")
  redGhost=loadImage("./Images/RedGhost.png")
  yellowGhost=loadImage("./Images/YellowGhost.png")
  blueGhost=loadImage("./Images/BlueGhost.png")
  pinkGhost=loadImage("./Images/PinkGhost.png")
  heart=loadImage("./Images/Heart.png")

  point=loadSound("./Sounds/Points.wav")
  Dead=loadSound("./Sounds/Heart.wav")
}
function setup() {
  createCanvas(560, 680);
  back=createSprite(250,250,500,500)
  back.shapeColor="black"

heart1 = createSprite(400, 30, 20, 20);
heart1.addImage(heart);
heart1.scale = 0.1;

heart2 = createSprite(450, 30, 20, 20);
heart2.addImage(heart);
heart2.scale = 0.1;

heart3 = createSprite(500, 30, 20, 20);
heart3.addImage(heart);
heart3.scale = 0.1;

myButton = createButton("RESTART");
myButton.position(-220, 350);
myButton.mousePressed(reset);

  walls=new Group();

  //outer walls
  walls.add(createSprite(280,70,550,10));
  walls.add(createSprite(10,160,10,190));
  walls.add(createSprite(550,160,10,190));
  walls.add(createSprite(60,250,110,10));
  walls.add(createSprite(500,250,110,10));
  walls.add(createSprite(60,330,110,10));
  walls.add(createSprite(500,330,110,10));
  walls.add(createSprite(60,370,110,10));
  walls.add(createSprite(500,370,110,10));
  walls.add(createSprite(60,450,110,10));
  walls.add(createSprite(500,450,110,10));
  walls.add(createSprite(110,290,10,90));
  walls.add(createSprite(450,290,10,90));
  walls.add(createSprite(110,410,10,90));
  walls.add(createSprite(450,410,10,90));
  walls.add(createSprite(10,560,10,230));
  walls.add(createSprite(550,560,10,230));
  walls.add(createSprite(280,670,550,10));
  
  //inner walls
  walls.add(createSprite(280,110,30,90));
  walls.add(createSprite(80,130,70,50));
  walls.add(createSprite(480,130,70,50));
  walls.add(createSprite(80,200,70,30));
  walls.add(createSprite(480,200,70,30));
  walls.add(createSprite(190,130,90,50));
  walls.add(createSprite(370,130,90,50));
  walls.add(createSprite(280,200,150,30));
  walls.add(createSprite(160,260,30,150));
  walls.add(createSprite(400,260,30,150));
  walls.add(createSprite(160,410,30,90));
  walls.add(createSprite(400,410,30,90));
  walls.add(createSprite(190,260,90,30));
  walls.add(createSprite(370,260,90,30));
  walls.add(createSprite(280,230,30,90));
  walls.add(createSprite(280,440,150,30));
  walls.add(createSprite(190,500,90,30));
  walls.add(createSprite(370,500,90,30));
  walls.add(createSprite(280,470,30,90));
  walls.add(createSprite(80,500,70,30));
  walls.add(createSprite(480,500,70,30));
  walls.add(createSprite(280,560,150,30));
  walls.add(createSprite(280,590,30,90));
  walls.add(createSprite(140,620,190,30));
  walls.add(createSprite(420,620,190,30));
  walls.add(createSprite(100,530,30,90));
  walls.add(createSprite(460,530,30,90));
  walls.add(createSprite(160,590,30,90));
  walls.add(createSprite(400,590,30,90));
  walls.add(createSprite(30,560,50,30));
  walls.add(createSprite(530,560,50,30));

  //ghost home
  walls.add(createSprite(210,350,10,90));
  walls.add(createSprite(350,350,10,90));
  walls.add(createSprite(280,390,150,10));
  walls.add(createSprite(230,310,50,10));
  walls.add(createSprite(330,310,50,10));

  door=createSprite(280,310,50,10);
  door.shapeColor="red"

  for (let i = 0; i < walls.length; i++) {
    walls[i].shapeColor = "blue";
  }

   //intersections
  zones= new Group();
  
  zones.add(createSprite(240,280,2,2))
  zones.add(createSprite(320,280,2,2))
  zones.add(createSprite(180,420,2,2))
  zones.add(createSprite(380,420,2,2))
  zones.add(createSprite(180,360,2,2))
  zones.add(createSprite(380,360,2,2))
  zones.add(createSprite(140,360,2,2))
  zones.add(createSprite(420,360,2,2))
  zones.add(createSprite(260,660,2,2))
  zones.add(createSprite(300,660,2,2))
  zones.add(createSprite(60,600,2,2))
  zones.add(createSprite(500,600,2,2))
  zones.add(createSprite(120,540,2,2))
  zones.add(createSprite(440,540,2,2))
  zones.add(createSprite(180,540,2,2))
  zones.add(createSprite(380,540,2,2))
  zones.add(createSprite(200,480,2,2))
  zones.add(createSprite(360,480,2,2))
  zones.add(createSprite(260,540,2,2))
  zones.add(createSprite(300,540,2,2))
  zones.add(createSprite(120,480,2,2))
  zones.add(createSprite(440,480,2,2))
  zones.add(createSprite(120,160,2,2))
  zones.add(createSprite(440,160,2,2))
  zones.add(createSprite(140,220,2,2))
  zones.add(createSprite(420,220,2,2))
  zones.add(createSprite(20,160,2,2))
  zones.add(createSprite(540,160,2,2))
  zones.add(createSprite(140,80,2,2))
  zones.add(createSprite(420,80,2,2))
  zones.add(createSprite(260,180,2,2))
  zones.add(createSprite(300,180,2,2))
  zones.add(createSprite(200,160,2,2))
  zones.add(createSprite(360,160,2,2))

   for (let i = 0; i < zones.length; i++) {
    zones[i].visible = false;
  }

  food=new Group();

for (let x = 10; x < width; x += 20) {
  for (let y = 90; y < height; y += 20) {
    let dot = createSprite(x, y, 5, 5);
    dot.shapeColor = "yellow";
    food.add(dot);
  }
}

// Remove food that overlaps with any wall or the red door
for (let i = food.length - 1; i >= 0; i--) {
  let x = food[i].position.x;
  let y = food[i].position.y;

  // Remove if overlapping wall or door
  if (food[i].overlap(walls) || food[i].overlap(door)) {
    food[i].remove();
  }

  // ✅ Also remove if inside ghost zone (e.g., x: 200–360, y: 300–400)
  else if (x > 140 && x < 420 && y > 240 && y < 460) {
    food[i].remove();
  }

  else if (x>0&&x<120&&y>250&&y<350){
    food[i].remove();
  }
  else if (x>0&&x<120&&y>375&&y<450){
    food[i].remove();
  }
    else if (x>440&&x<560&&y>250&&y<350){
    food[i].remove();
  }
  else if (x>440&&x<560&&y>375&&y<450){
    food[i].remove();
  }
}
  pacman=createSprite(280,530, 10,10)
  pacman.addAnimation("move", pacAnim);
  pacman.scale=0.175;

  ghost1=createSprite(340,290,20,20)
  ghost1.addImage("ghost", pinkGhost);
  ghost1.scale=0.5
  ghost1.speedx = 1;
  ghost1.speedy = 1;

  ghost2=createSprite(220,290,20,20)
  ghost2.addImage("ghost", blueGhost);
  ghost2.scale=0.5
  ghost2.speedx = 1;
  ghost2.speedy = 1;

  ghost3=createSprite(310,290,20,20)
  ghost3.addImage("ghost", redGhost);
  ghost3.scale=0.5
  ghost3.speedx = 1;
  ghost3.speedy = 1;

  ghost4=createSprite(250,290,20,20)
  ghost4.addImage("ghost", yellowGhost);
  ghost4.scale=0.5
  ghost4.speedx = 1;
  ghost4.speedy = 1;

  ghost5=createSprite(310,410,20,20)
  ghost5.addImage("ghost", redGhost);
  ghost5.scale=0.5
  ghost5.speedx = 1;
  ghost5.speedy = 1;

  ghost6=createSprite(250,410,20,20)
  ghost6.addImage("ghost", yellowGhost);
  ghost6.scale=0.5
  ghost6.speedx = 1;
  ghost6.speedy = 1;

  ghost7=createSprite(340,410,20,20)
  ghost7.addImage("ghost", pinkGhost);
  ghost7.scale=0.5
  ghost7.speedx = 1;
  ghost7.speedy = 1;

  ghost8=createSprite(220,410,20,20)
  ghost8.addImage("ghost", blueGhost);
  ghost8.scale=0.5
  ghost8.speedx = 1;
  ghost8.speedy = 1;

ghost1.timer = 0;
ghost2.timer = 0;
ghost3.timer = 0;
ghost4.timer = 0;
ghost5.timer = 0;
ghost6.timer = 0;
ghost7.timer = 0;
ghost8.timer = 0;

 
}

function draw() {
 background('black');
 if(keyDown("Right")||keyDown("d")){
  pacman.x=pacman.x+2
  pacman.rotation=0
 }else if(keyDown("Left")||keyDown("a")){
  pacman.x=pacman.x-2
  pacman.rotation=180
 } else if(keyDown("Up")||keyDown("w")){
  pacman.y=pacman.y-2
  pacman.rotation=-90
 }else if(keyDown("Down")||keyDown("s")){
  pacman.y=pacman.y+2
  pacman.rotation=90
 }

 if (pacman.x>560){
  pacman.x=10
 }
 if (pacman.x<0){
  pacman.x=550
 }

   pacman.overlap(food, function (collector, collected) {
    collected.remove(); // Dot disappears
    point.play()
    score+=10;
  });

heart1.visible = lives >= 1;
heart2.visible = lives >= 2;
heart3.visible = lives >= 3;

  aiGhost(ghost1, speedx,speedy)
  aiGhost(ghost2, speedx,speedy)
  aiGhost(ghost3, speedx,speedy)
  aiGhost(ghost4, speedx,speedy)
  aiGhost(ghost5, speedx,speedy)
  aiGhost(ghost6, speedx,speedy)
  aiGhost(ghost7, speedx,speedy)
  aiGhost(ghost8, speedx,speedy)

  

  pacman.bounceOff(walls)
  pacman.bounceOff(door)
  drawSprites();
  fill("red")
  textSize(20)
  text(score, 20, 50)
  if (score===2580){
    heart1.visible=false
    fill("red")
    textSize(20)
    text("WINNER",220,350);
    myButton.position(240, 350);
    Dead.play()
    noLoop()
    //reset fnction
  }
  if (lives===0){
    heart1.visible=false
    fill("red")
    textSize(20)
    text("GAME OVER",220,350);
    myButton.position(240, 350);
    Dead.play()
    noLoop()
    //reset function
  }

}

function aiGhost(sprite,speedx,speedy){
  if (sprite.x>560){
  sprite.x=10
 }
 if (sprite.x<0){
  sprite.x=550
 }
 sprite.collide(walls)
 sprite.collide(door)
  sprite.x += sprite.speedx;
  sprite.y += sprite.speedy;
  // If hit wall, pick new direction
  if (sprite.collide(walls)) {
    changeDirection(sprite);
  }

  // Only change direction when touching a zone and timer is 0
  if (sprite.overlap(zones) && sprite.timer <= 0) {
    changeDirection(sprite);
    sprite.timer = 30; // wait 30 frames before allowing another change
  }

  // Countdown timer
  if (sprite.timer > 0) {
    sprite.timer--;
  }


if (sprite.collide(pacman)){
  sprite.speedx=1
  sprite.speedy=1
  Dead.play()
  lives-=1
  sprite.x=260;
  sprite.y=300;
  pacman.x=280;
  pacman.y=530;
}

}

function changeDirection(sprite){
  let dir = random(['up', 'down', 'left', 'right']);
  if (dir === 'up') {
    sprite.speedx = 0;
    sprite.speedy = -1;
  } else if (dir === 'down') {
    sprite.speedx = 0;
    sprite.speedy = 1;
  } else if (dir === 'left') {
    sprite.speedx = -1;
    sprite.speedy = 0;
  } else if (dir === 'right') {
    sprite.speedx = 1;
    sprite.speedy = 0;
  }
}

function reset(){
  myButton.position(-200,200)
  score=0
  lives=3
  heart1.visible=true
  heart2.visible=true
  heart3.visible=true
  ghost1.x = 340;
  ghost1.y = 290;
  ghost2.x = 220;
  ghost2.y = 290;
  ghost3.x = 310;
  ghost3.y = 290;
  ghost4.x = 250;
  ghost4.y = 290;
  ghost5.x = 310;
  ghost5.y = 410;
  ghost6.x = 250;
  ghost6.y = 410;
  ghost7.x = 340;
  ghost7.y = 410;
  ghost8.x = 220;
  ghost8.y = 410;
  aiGhost(ghost1, speedx,speedy)
  aiGhost(ghost2, speedx,speedy)
  aiGhost(ghost3, speedx,speedy)
  aiGhost(ghost4, speedx,speedy)
  aiGhost(ghost5, speedx,speedy)
  aiGhost(ghost6, speedx,speedy)
  aiGhost(ghost7, speedx,speedy)
  aiGhost(ghost8, speedx,speedy)
   for (let i = food.length - 1; i >= 0; i--) {
    food[i].remove();
  }
    for (let x = 10; x < width; x += 20) {
    for (let y = 90; y < height; y += 20) {
      let dot = createSprite(x, y, 5, 5);
      dot.shapeColor = "yellow";

      if (!dot.overlap(walls) && !dot.overlap(door) &&
          !(x > 140 && x < 420 && y > 240 && y < 460) &&
          !(x > 0 && x < 120 && y > 250 && y < 450) &&
          !(x > 440 && x < 560 && y > 250 && y < 450)) {
        food.add(dot);
      } else {
        dot.remove(); // don't add if invalid
      }
    }
  }
 loop();
}
