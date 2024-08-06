let board;
let boardWidth = 360;
let boardHeight = 640;
let context;
let gameStarted = false;

let onloadImg;

let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;

let birdUpImg;
let birdDownImg;
let birdMidImg;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -2;
let velocityY = 0;
let gravity = 0.25;

let gameOver = false;
let score = 0;

let gameOverImg;

let scoreImages = [];
for (let i = 0; i < 10; i++) {
  let img = new Image();
  img.src = "./assets/sprites/${i}.png";
  scoreImages.push(img);
}

let hitSound;
let wingSound;
let pointSound;

window.onload = function () {
  board = document.getElementById('gameCanvas');
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext('2d');

  onloadImg = new Image();
  onloadImg.src = './assets/sprites/message.png';
  onloadImg.onload = function () {
    context.drawImage(
      onloadImg,
      (boardWidth - onloadImg.width) / 2,
      (boardHeight - onloadImg.height) / 2,
      onloadImg.width,
      onloadImg.height
    );
  };
  birdUpImg = new Image();
  birdUpImg.src = './assets/sprites/redbird-upflap.png';

  birdDownImg = new Image();
  birdDownImg.src = './assets/sprites/redbird-downflap.png';

  birdMidImg = new Image();
  birdMidImg.src = './assets/sprites/redbird-midflap.png';
  birdMidImg.onload = function () {
    context.drawImage(birdMidImg, bird.x, bird.y, bird.width, bird.height);
  };

  topPipeImg = new Image();
  topPipeImg.src = './assets/sprites/toppipe.png';

  bottomPipeImg = new Image();
  bottomPipeImg.src = './assets/sprites/bottompipe.png';

  gameOverImg = new Image();
  gameOverImg.src = './assets/sprites/gameover.png';

  hitSound = new Audio('./assets/audios/hit.wav');
  wingSound = new Audio('./assets/audios/wing.wav');
  pointSound = new Audio('./assets/audios/point.wav');
};

window.addEventListener('keydown', () => {
  if (!gameStarted) {
    gameStarted = true;
    startGame();
  }
});

function startGame() {
  requestAnimationFrame(update);
  setInterval(placePipes, 1500);
  document.addEventListener('keydown', moveBird);
}

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  velocityY += gravity;
  let birdImgToUse;
  if (velocityY < 0) {
    birdImgToUse = birdUpImg;
  } else if (velocityY > 0) {
    birdImgToUse = birdDownImg;
  } else {
    birdImgToUse = birdMidImg;
  }

  bird.y = Math.max(bird.y + velocityY, 0);
  context.drawImage(birdImgToUse, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    gameOver = true;
  }

  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
      pointSound.play();
    }

    if (detectCollision(bird, pipe)) {
      gameOver = true;
    }
  }

  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift();
  }

  drawScore(score);

  if (gameOver) {
    hitSound.play();
    context.drawImage(
      gameOverImg,
      (boardWidth - gameOverImg.width) / 2,
      (boardHeight - gameOverImg.height) / 2
    );
  }
}

function placePipes() {
  if (gameOver) {
    return;
  }

  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);
}

function moveBird(e) {
  if (e.code == 'Space' || e.code == 'ArrowUp' || e.code == 'KeyX') {
    velocityY = -6;
    wingSound.play();
    if (gameOver) {
      bird.y = birdY;
      pipeArray = [];
      score = 0;
      gameOver = false;
    }
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawScore(score) {
  let scoreStr = score.toString();
  let digitWidth = scoreImages[0].width;
  let digitHeight = scoreImages[0].height;
  let totalWidth = digitWidth * scoreStr.length;

  let startX = (boardWidth - totalWidth) / 2;

  for (let i = 0; i < scoreStr.length; i++) {
    let digit = parseInt(scoreStr[i]);
    let x = startX + i * digitWidth;
    let y = 140;
    context.drawImage(scoreImages[digit], x, y, digitWidth, digitHeight);
  }
}