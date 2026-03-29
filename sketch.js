// =============================================
//  PAC-MAN  –  Upgraded Edition
//  Features: Main Menu · How To Play · Difficulty
//             Smart ghost AI (BFS pathfinding)
// =============================================

// ── State machine ──────────────────────────────
// "MENU"  |  "HOW"  |  "DIFF"  |  "PLAY"  |  "WIN"  |  "LOSE"
var gameState = "MENU";

// ── Game variables ─────────────────────────────
var pacman, pacAnim;
var score = 0;
var lives = 3;
var difficulty = "NORMAL";   // EASY | NORMAL | HARD
var ghostSpeed = 1;          // pixels per frame – set by difficulty

// Desired direction buffered by player (supports queued turns)
var desiredDX = 0, desiredDY = 0;
var currentDX = 0, currentDY = 0;

// ── Images / sounds ────────────────────────────
var redGhost, yellowGhost, blueGhost, pinkGhost, heart;
var point, Dead;

// ── Sprites ────────────────────────────────────
var walls, zones, food, door;
var heart1, heart2, heart3;
var ghost1, ghost2, ghost3, ghost4, ghost5, ghost6, ghost7, ghost8;
var ghosts = [];

// ── BFS grid (20 px cells) ─────────────────────
var CELL = 20;
var COLS, ROWS;
var walkable = [];          // walkable[col][row] = true/false
var gridBuilt = false;

// ── pathfinding state per ghost ────────────────
// each ghost gets: .path = [], .pathTimer = 0

// ── Menu button placeholders (HTML buttons) ────
var btnPlay, btnHow, btnBack, btnEasy, btnNormal, btnHard, btnRestart;

// ==============================================================
function preload() {
  pacAnim       = loadAnimation("./Images/Pac1.png", "./Images/Pac2.png");
  redGhost      = loadImage("./Images/RedGhost.png");
  yellowGhost   = loadImage("./Images/YellowGhost.png");
  blueGhost     = loadImage("./Images/BlueGhost.png");
  pinkGhost     = loadImage("./Images/PinkGhost.png");
  heart         = loadImage("./Images/Heart.png");
  point         = loadSound("./Sounds/Points.wav");
  Dead          = loadSound("./Sounds/Heart.wav");
}

// ==============================================================
function setup() {
  createCanvas(560, 680);
  textFont("monospace");

  // Build all game sprites once (hidden until PLAY state)
  buildArena();
  buildFood();
  buildPacman();
  buildGhosts();
  buildHUD();

  // Build BFS walkability grid after walls exist
  buildWalkGrid();

  // Hide everything until the player starts
  setGameVisible(false);

  // Create HTML overlay buttons
  makeMenuButtons();
  showMenu();
}

// ==============================================================
function draw() {
  background("black");

  if (gameState === "MENU")  { drawMenu();   return; }
  if (gameState === "HOW")   { drawHow();    return; }
  if (gameState === "DIFF")  { drawDiff();   return; }
  if (gameState === "WIN")   { drawEnd(true);  return; }
  if (gameState === "LOSE")  { drawEnd(false); return; }

  // ── PLAY ──────────────────────────────────────
  handlePacmanInput();
  movePacman();

  // Wrap at screen edges (tunnels)
  if (pacman.x > 565) pacman.x = 5;
  if (pacman.x < -5)  pacman.x = 555;

  // Eat dots
  pacman.overlap(food, function(collector, collected) {
    collected.remove();
    point.play();
    score += 10;
  });

  // Update hearts
  heart1.visible = lives >= 1;
  heart2.visible = lives >= 2;
  heart3.visible = lives >= 3;

  // Ghost AI
  for (var i = 0; i < ghosts.length; i++) {
    smartGhost(ghosts[i], i);
  }

  pacman.bounceOff(walls);
  pacman.bounceOff(door);
  drawSprites();

  // HUD
  fill("white");
  textSize(14);
  textAlign(LEFT, TOP);
  text("SCORE", 10, 8);
  fill("yellow");
  textSize(18);
  text(score, 10, 26);

  // Win / lose checks
  var totalFood = food.length;  // dots remaining
  if (totalFood === 0) {
    gameState = "WIN";
    Dead.play();
    hideGameButtons();
    showRestartButton();
    return;
  }
  if (lives <= 0) {
    gameState = "LOSE";
    Dead.play();
    hideGameButtons();
    showRestartButton();
    return;
  }
}

// ==============================================================
// ── INPUT ─────────────────────────────────────────────────────
function keyPressed() {
  if (gameState !== "PLAY") return;
  if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') { desiredDX=1; desiredDY=0; }
  if (keyCode === LEFT_ARROW  || key === 'a' || key === 'A') { desiredDX=-1; desiredDY=0; }
  if (keyCode === UP_ARROW    || key === 'w' || key === 'W') { desiredDX=0; desiredDY=-1; }
  if (keyCode === DOWN_ARROW  || key === 's' || key === 'S') { desiredDX=0; desiredDY=1; }
}

function handlePacmanInput() {
  if (keyDown("Right") || keyDown("d")) { desiredDX=1; desiredDY=0; }
  else if (keyDown("Left")  || keyDown("a")) { desiredDX=-1; desiredDY=0; }
  else if (keyDown("Up")    || keyDown("w")) { desiredDX=0; desiredDY=-1; }
  else if (keyDown("Down")  || keyDown("s")) { desiredDX=0; desiredDY=1; }
}

// ==============================================================
// ── PACMAN MOVEMENT (smooth + wall-aware) ─────────────────────
var PACSPEED = 2;

function movePacman() {
  var speed = PACSPEED;

  // Try desired direction first
  var nx = pacman.x + desiredDX * speed;
  var ny = pacman.y + desiredDY * speed;

  // Temporarily move, check collision, revert if blocked
  pacman.x = nx; pacman.y = ny;
  var hitWall = pacman.collide(walls) || pacman.collide(door);
  if (!hitWall) {
    currentDX = desiredDX;
    currentDY = desiredDY;
  } else {
    // Revert and continue in old direction
    pacman.x -= desiredDX * speed;
    pacman.y -= desiredDY * speed;
    var nx2 = pacman.x + currentDX * speed;
    var ny2 = pacman.y + currentDY * speed;
    pacman.x = nx2; pacman.y = ny2;
    if (pacman.collide(walls) || pacman.collide(door)) {
      pacman.x -= currentDX * speed;
      pacman.y -= currentDY * speed;
    }
  }

  // Rotation
  if (currentDX > 0) pacman.rotation = 0;
  else if (currentDX < 0) pacman.rotation = 180;
  else if (currentDY < 0) pacman.rotation = -90;
  else if (currentDY > 0) pacman.rotation = 90;
}

// ==============================================================
// ── BFS WALKABILITY GRID ──────────────────────────────────────
function buildWalkGrid() {
  COLS = floor(width  / CELL);
  ROWS = floor(height / CELL);
  walkable = [];

  for (var c = 0; c < COLS; c++) {
    walkable[c] = [];
    for (var r = 0; r < ROWS; r++) {
      var px = c * CELL + CELL/2;
      var py = r * CELL + CELL/2;
      walkable[c][r] = isCellWalkable(px, py);
    }
  }
  gridBuilt = true;
}

function isCellWalkable(px, py) {
  // Use p5.play's sprite overlap to test a dummy point
  var probe = createSprite(px, py, 4, 4);
  probe.visible = false;
  var blocked = false;
  for (var i = 0; i < walls.length; i++) {
    if (probe.overlap(walls[i])) { blocked = true; break; }
  }
  if (!blocked && probe.overlap(door)) blocked = true;
  probe.remove();
  return !blocked;
}

// BFS from (startC,startR) to (goalC,goalR); returns array of {c,r} or []
function bfs(startC, startR, goalC, goalR) {
  if (!gridBuilt) return [];
  if (startC === goalC && startR === goalR) return [];

  var visited = [];
  for (var c = 0; c < COLS; c++) { visited[c] = []; }

  var queue = [{ c: startC, r: startR, path: [] }];
  visited[startC][startR] = true;
  var dirs = [[1,0],[-1,0],[0,1],[0,-1]];

  while (queue.length > 0) {
    var cur = queue.shift();
    for (var d = 0; d < dirs.length; d++) {
      var nc = cur.c + dirs[d][0];
      var nr = cur.r + dirs[d][1];
      // Tunnel wrap (horizontal only, like the real game)
      if (nc < 0) nc = COLS - 1;
      if (nc >= COLS) nc = 0;
      if (nr < 0 || nr >= ROWS) continue;
      if (visited[nc][nr]) continue;
      if (!walkable[nc][nr]) continue;
      visited[nc][nr] = true;
      var newPath = cur.path.concat([{ c: nc, r: nr }]);
      if (nc === goalC && nr === goalR) return newPath;
      queue.push({ c: nc, r: nr, path: newPath });
    }
  }
  return [];
}

function worldToGrid(x, y) {
  return {
    c: floor(x / CELL),
    r: floor(y / CELL)
  };
}

// ==============================================================
// ── SMART GHOST AI ────────────────────────────────────────────
// Each ghost has a personality:
//   ghost1 (pink)   – targets 4 tiles ahead of Pac-Man
//   ghost2 (blue)   – flanking (mirror of ghost1 relative to ghost3)
//   ghost3 (red)    – direct chase (always hunts Pac-Man position)
//   ghost4 (yellow) – scatter/chase hybrid
//   ghost5-8        – mirrors of 1-4 but slightly slower responses

var PATH_REFRESH = 20; // frames between BFS recalculations

function smartGhost(sprite, index) {
  // Screen wrap
  if (sprite.x > 565) sprite.x = 5;
  if (sprite.x < -5)  sprite.x = 555;

  // Collide with walls (stop overlap)
  sprite.collide(walls);
  sprite.collide(door);

  // Recalculate path periodically
  sprite.pathTimer--;
  if (sprite.pathTimer <= 0) {
    sprite.pathTimer = PATH_REFRESH + index * 3; // stagger ghosts

    var gPos  = worldToGrid(sprite.x, sprite.y);
    var pPos  = worldToGrid(pacman.x, pacman.y);
    var target = getGhostTarget(index, pPos, gPos);

    // Clamp target to grid
    target.c = constrain(target.c, 0, COLS-1);
    target.r = constrain(target.r, 0, ROWS-1);

    // If target cell is not walkable, fall back to Pac-Man directly
    if (!walkable[target.c][target.r]) {
      target = pPos;
    }

    sprite.path = bfs(gPos.c, gPos.r, target.c, target.r);
    sprite.pathStep = 0;
  }

  // Follow path
  if (sprite.path && sprite.path.length > 0 && sprite.pathStep < sprite.path.length) {
    var step = sprite.path[sprite.pathStep];
    var tx = step.c * CELL + CELL/2;
    var ty = step.r * CELL + CELL/2;
    var dx = tx - sprite.x;
    var dy = ty - sprite.y;
    var dist = sqrt(dx*dx + dy*dy);

    if (dist < ghostSpeed + 1) {
      sprite.x = tx;
      sprite.y = ty;
      sprite.pathStep++;
    } else {
      sprite.x += (dx/dist) * ghostSpeed;
      sprite.y += (dy/dist) * ghostSpeed;
    }
  } else {
    // No path – wander randomly
    sprite.x += sprite.speedx;
    sprite.y += sprite.speedy;
    if (sprite.collide(walls)) {
      changeDirection(sprite);
    }
  }

  // Eat pacman
  if (sprite.overlap(pacman)) {
    Dead.play();
    lives -= 1;
    sprite.x = 270;
    sprite.y = 350;
    sprite.path = [];
    sprite.pathTimer = 0;
    pacman.x = 280;
    pacman.y = 530;
    currentDX = 0; currentDY = 0;
    desiredDX = 0; desiredDY = 0;
  }
}

// Returns a grid cell target for each ghost personality
function getGhostTarget(index, pPos, gPos) {
  var pDX = (desiredDX !== 0 || desiredDY !== 0) ? desiredDX : currentDX;
  var pDY = (desiredDX !== 0 || desiredDY !== 0) ? desiredDY : currentDY;

  var personality = index % 4;

  if (personality === 0) {
    // Pinky – target 4 tiles ahead of Pac-Man
    return { c: pPos.c + pDX*4, r: pPos.r + pDY*4 };
  }
  if (personality === 1) {
    // Blinky – direct chase
    return { c: pPos.c, r: pPos.r };
  }
  if (personality === 2) {
    // Inky – flanking: 2 tiles ahead of pac, doubled from blinky
    var pivot = { c: pPos.c + pDX*2, r: pPos.r + pDY*2 };
    return { c: pivot.c*2 - gPos.c, r: pivot.r*2 - gPos.r };
  }
  if (personality === 3) {
    // Clyde – chase when far, scatter to corner when close
    var dist = dist2(gPos.c, gPos.r, pPos.c, pPos.r);
    if (dist > 8) return { c: pPos.c, r: pPos.r };  // chase
    return { c: 1, r: ROWS-2 };                       // scatter corner
  }
  return pPos;
}

function dist2(c1,r1,c2,r2){ return sqrt((c1-c2)*(c1-c2)+(r1-r2)*(r1-r2)); }

// ==============================================================
// ── ARENA BUILDERS ────────────────────────────────────────────
function buildArena() {
  walls = new Group();

  // outer walls
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
  // inner walls
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
  // ghost home
  walls.add(createSprite(210,350,10,90));
  walls.add(createSprite(350,350,10,90));
  walls.add(createSprite(280,390,150,10));
  walls.add(createSprite(230,310,50,10));
  walls.add(createSprite(330,310,50,10));

  door = createSprite(280,310,50,10);
  door.shapeColor = "red";

  for (var i = 0; i < walls.length; i++) {
    walls[i].shapeColor = "blue";
  }

  // Intersection zones (for fallback wandering)
  zones = new Group();
  var zoneCoords = [
    [240,280],[320,280],[180,420],[380,420],[180,360],[380,360],
    [140,360],[420,360],[260,660],[300,660],[60,600],[500,600],
    [120,540],[440,540],[180,540],[380,540],[200,480],[360,480],
    [260,540],[300,540],[120,480],[440,480],[120,160],[440,160],
    [140,220],[420,220],[20,160],[540,160],[140,80],[420,80],
    [260,180],[300,180],[200,160],[360,160]
  ];
  for (var z = 0; z < zoneCoords.length; z++) {
    var s = createSprite(zoneCoords[z][0], zoneCoords[z][1], 2, 2);
    s.visible = false;
    zones.add(s);
  }
}

function buildFood() {
  food = new Group();
  for (var x = 10; x < width; x += 20) {
    for (var y = 90; y < height; y += 20) {
      var dot = createSprite(x, y, 5, 5);
      dot.shapeColor = "yellow";
      food.add(dot);
    }
  }
  // Remove dots inside walls / ghost zone
  for (var i = food.length - 1; i >= 0; i--) {
    var fx = food[i].position.x;
    var fy = food[i].position.y;
    if (food[i].overlap(walls) || food[i].overlap(door)) {
      food[i].remove();
    } else if (fx > 140 && fx < 420 && fy > 240 && fy < 460) {
      food[i].remove();
    } else if (fx > 0 && fx < 120 && fy > 250 && fy < 350) {
      food[i].remove();
    } else if (fx > 0 && fx < 120 && fy > 375 && fy < 450) {
      food[i].remove();
    } else if (fx > 440 && fx < 560 && fy > 250 && fy < 350) {
      food[i].remove();
    } else if (fx > 440 && fx < 560 && fy > 375 && fy < 450) {
      food[i].remove();
    }
  }
}

function buildPacman() {
  pacman = createSprite(280, 530, 10, 10);
  pacman.addAnimation("move", pacAnim);
  pacman.scale = 0.175;
}

function buildGhosts() {
  ghosts = [];
  ghost1 = makeGhost(340,290,pinkGhost);
  ghost2 = makeGhost(220,290,blueGhost);
  ghost3 = makeGhost(310,290,redGhost);
  ghost4 = makeGhost(250,290,yellowGhost);
  ghost5 = makeGhost(310,410,redGhost);
  ghost6 = makeGhost(250,410,yellowGhost);
  ghost7 = makeGhost(340,410,pinkGhost);
  ghost8 = makeGhost(220,410,blueGhost);
  ghosts = [ghost1,ghost2,ghost3,ghost4,ghost5,ghost6,ghost7,ghost8];
}

function makeGhost(x,y,img) {
  var g = createSprite(x,y,20,20);
  g.addImage("ghost", img);
  g.scale = 0.5;
  g.speedx = 1; g.speedy = 0;
  g.path = []; g.pathStep = 0; g.pathTimer = 0;
  return g;
}

function buildHUD() {
  heart1 = createSprite(480,30,20,20); heart1.addImage(heart); heart1.scale=0.1;
  heart2 = createSprite(510,30,20,20); heart2.addImage(heart); heart2.scale=0.1;
  heart3 = createSprite(540,30,20,20); heart3.addImage(heart); heart3.scale=0.1;
}

// ==============================================================
// ── VISIBILITY HELPERS ────────────────────────────────────────
function setGameVisible(v) {
  pacman.visible = v;
  for (var i = 0; i < ghosts.length; i++) ghosts[i].visible = v;
  for (var j = 0; j < walls.length; j++) walls[j].visible = v;
  door.visible = v;
  for (var k = 0; k < food.length; k++) food[k].visible = v;
  heart1.visible = v ? lives >= 1 : false;
  heart2.visible = v ? lives >= 2 : false;
  heart3.visible = v ? lives >= 3 : false;
}

// ==============================================================
// ── MENU DRAWING ──────────────────────────────────────────────
function drawMenu() {
  setGameVisible(false);
  drawSprites();

  // Title
  textAlign(CENTER, CENTER);
  fill("#FFD700");
  textSize(52);
  text("PAC-MAN", width/2, 200);

  fill("#FFD700");
  textSize(14);
  text("⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛", width/2, 235);

  fill("white");
  textSize(13);
  text("Use WASD or Arrow Keys to move", width/2, 580);
  text("Eat all the dots to win!", width/2, 600);
  text("Don't get caught by the ghosts!", width/2, 620);
}

function drawHow() {
  setGameVisible(false);
  drawSprites();
  textAlign(CENTER, TOP);

  fill("#FFD700");
  textSize(30);
  text("HOW TO PLAY", width/2, 60);

  fill("white");
  textSize(15);
  var lines = [
    "WASD or Arrow Keys  –  move Pac-Man",
    "",
    "Eat all yellow dots to WIN",
    "",
    "Avoid the coloured ghosts",
    "Touching one costs a life",
    "You have 3 lives total",
    "",
    "GHOST PERSONALITIES:",
    "  RED   – Direct chaser (always on you)",
    "  PINK  – Cuts you off (targets ahead)",
    "  BLUE  – Flanking attack",
    " YELLOW – Chases when far, scatters when close",
    "",
    "Tunnels on the sides wrap around!"
  ];
  for (var i = 0; i < lines.length; i++) {
    text(lines[i], width/2, 115 + i*26);
  }
}

function drawDiff() {
  setGameVisible(false);
  drawSprites();
  textAlign(CENTER, CENTER);

  fill("#FFD700");
  textSize(30);
  text("SELECT DIFFICULTY", width/2, 130);

  textSize(14);
  fill("#aaaaaa");
  text("Ghost speed increases with difficulty", width/2, 170);
  text("Score multiplier:  EASY ×1  |  NORMAL ×2  |  HARD ×3", width/2, 192);
}

function drawEnd(won) {
  setGameVisible(true);   // keep board visible behind text
  drawSprites();

  // Dark overlay
  fill(0,0,0,160);
  rect(0,0,width,height);

  textAlign(CENTER, CENTER);
  if (won) {
    fill("#FFD700");
    textSize(48);
    text("YOU WIN!", width/2, 280);
    fill("white");
    textSize(22);
    text("Final Score: " + score, width/2, 340);
  } else {
    fill("#FF3333");
    textSize(48);
    text("GAME OVER", width/2, 280);
    fill("white");
    textSize(22);
    text("Score: " + score, width/2, 340);
  }
}

// ==============================================================
// ── HTML BUTTONS ──────────────────────────────────────────────
function makeMenuButtons() {
  // -- Main menu --
  btnPlay = createButton("▶  PLAY");
  styleBtn(btnPlay, "#FFD700", "#222");
  btnPlay.mousePressed(function() { showDiff(); });

  btnHow = createButton("? HOW TO PLAY");
  styleBtn(btnHow, "#4488FF", "white");
  btnHow.mousePressed(function() { showHow(); });

  // -- How-to-play --
  btnBack = createButton("← BACK");
  styleBtn(btnBack, "#555", "white");
  btnBack.mousePressed(function() { showMenu(); });

  // -- Difficulty --
  btnEasy = createButton("EASY");
  styleBtn(btnEasy, "#44BB44", "white");
  btnEasy.mousePressed(function() { startGame("EASY"); });

  btnNormal = createButton("NORMAL");
  styleBtn(btnNormal, "#FFD700", "#222");
  btnNormal.mousePressed(function() { startGame("NORMAL"); });

  btnHard = createButton("HARD");
  styleBtn(btnHard, "#FF4444", "white");
  btnHard.mousePressed(function() { startGame("HARD"); });

  // -- In-game / end screen --
  btnRestart = createButton("↺  PLAY AGAIN");
  styleBtn(btnRestart, "#FFD700", "#222");
  btnRestart.mousePressed(function() { showMenu(); });

  hideAllButtons();
}

function styleBtn(btn, bg, fg) {
  btn.style("background", bg);
  btn.style("color", fg);
  btn.style("font-family", "monospace");
  btn.style("font-size", "16px");
  btn.style("font-weight", "bold");
  btn.style("padding", "10px 28px");
  btn.style("border", "2px solid rgba(255,255,255,0.3)");
  btn.style("border-radius", "6px");
  btn.style("cursor", "pointer");
  btn.style("letter-spacing", "1px");
}

function hideAllButtons() {
  [btnPlay,btnHow,btnBack,btnEasy,btnNormal,btnHard,btnRestart]
    .forEach(function(b){ b.position(-400,-400); });
}

function hideGameButtons() {
  [btnPlay,btnHow,btnBack,btnEasy,btnNormal,btnHard].forEach(function(b){ b.position(-400,-400); });
}

function showRestartButton() {
  btnRestart.position(width/2 - 75, 390);
}

function showMenu() {
  gameState = "MENU";
  hideAllButtons();
  btnPlay.position(width/2 - 60, 290);
  btnHow.position(width/2 - 75, 360);
}

function showHow() {
  gameState = "HOW";
  hideAllButtons();
  btnBack.position(width/2 - 50, 545);
}

function showDiff() {
  gameState = "DIFF";
  hideAllButtons();
  btnEasy.position(width/2 - 200, 240);
  btnNormal.position(width/2 - 50, 240);
  btnHard.position(width/2 + 100, 240);
  btnBack.position(width/2 - 50, 340);
}

// ==============================================================
// ── START / RESET GAME ────────────────────────────────────────
function startGame(diff) {
  difficulty = diff;
  if (diff === "EASY")   { ghostSpeed = 0.7; }
  if (diff === "NORMAL") { ghostSpeed = 1.2; }
  if (diff === "HARD")   { ghostSpeed = 1.8; }

  resetGame();
  gameState = "PLAY";
  hideAllButtons();
  setGameVisible(true);
  loop();
}

function resetGame() {
  score = 0;
  lives = 3;
  currentDX = 0; currentDY = 0;
  desiredDX = 0; desiredDY = 0;

  pacman.x = 280; pacman.y = 530;
  pacman.rotation = 0;

  var startPositions = [
    [340,290],[220,290],[310,290],[250,290],
    [310,410],[250,410],[340,410],[220,410]
  ];
  for (var i = 0; i < ghosts.length; i++) {
    ghosts[i].x = startPositions[i][0];
    ghosts[i].y = startPositions[i][1];
    ghosts[i].speedx = 1; ghosts[i].speedy = 0;
    ghosts[i].path = [];
    ghosts[i].pathStep = 0;
    ghosts[i].pathTimer = i * 5; // staggered start
  }

  // Rebuild food
  for (var j = food.length - 1; j >= 0; j--) { food[j].remove(); }
  buildFood();
}

// ==============================================================
// ── FALLBACK DIRECTION (used when BFS fails) ──────────────────
function changeDirection(sprite) {
  var dirs = [
    { dx:1, dy:0 }, { dx:-1, dy:0 },
    { dx:0, dy:1 }, { dx:0, dy:-1 }
  ];
  var d = dirs[floor(random(4))];
  sprite.speedx = d.dx;
  sprite.speedy = d.dy;
}
