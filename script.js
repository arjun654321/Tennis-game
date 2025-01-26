class B {
  constructor(a, b, r) {
    this.a = a;
    this.b = b;
    this.sY = b;
    this.v = createVector(r * 0.21, random(-r * 0.084, r * 0.084));
    this.r = r;
  }

  upd(arc) {
    this.a += this.v.x;
    this.sY += this.v.y;
    this.b = this.sY - arc;
  }

  render() {
    push();
    noStroke();
    fill(54, 54, 54, 100);
    ellipse(this.a, this.sY, this.r);
    stroke(54);
    strokeWeight(1);
    fill(255, 255, 0);
    ellipse(this.a, this.b, this.r);
    pop();
  }
}

class P {
  constructor(a, b, s, bB, tB, imgs, isP, w) {
    this.a = a;
    this.b = b;
    this.bB = bB;
    this.tB = tB;
    this.s = -s;
    this.imgs = imgs;
    this.c = 0;
    this.animSpeed = 0.1;
    this.w = w;
    this.h = w * 2;
    this.dir = "none";
    this.isP = isP;
    this.moved = false;
  }

  move() {
    const spd = this.h * 0.05;
    if (this.dir === 'up' && this.b > this.tB) {
      this.b -= spd;
      this.a += (spd / this.s);
      this.c += this.animSpeed;
    } else if (this.dir === 'down' && this.b < this.bB) {
      this.b += spd;
      this.a -= (spd / this.s);
      this.c += this.animSpeed;
    }
  }

  autoMove(ballY) {
    const d = this.b - ballY;
    if (d < 0 && d < -this.h * 0.5) {
      this.setDir('down');
    } else if (d > 0 && d > this.h * 0.5) {
      this.setDir('up');
    } else {
      this.setDir('none');
    }
    this.move();
  }

  setDir(type) {
    switch (type) {
      case 'up':
        this.dir = 'up';
        this.moved = true;
        break;
      case 'down':
        this.dir = 'down';
        this.moved = true;
        break;
      default:
        this.dir = 'none';
    }
  }

  render() {
    const y1 = this.b - this.h;
    const x1 = this.a + (this.h / this.s);
    const x2 = x1 + this.w;
    const y2 = y1;
    const x3 = this.a + this.w;
    const y3 = this.b;

    this.imgIdx = floor(this.c) % this.imgs.length;

    if (this.imgs.length > 0) {
      noStroke();
      fill(54, 54, 54, 25);
      ellipse(this.a, this.b + this.h, this.h, this.w * 1.5);
      imageMode(CENTER);
      image(this.imgs[this.imgIdx], this.a, this.b, this.w * 2, this.h * 2);
      if (this.isP && !this.moved) {
        textSize(14);
        fill(255);
        text("use the arrow keys to move!", this.a - 10, this.b - (this.h * 1.5));
      }
    } else {
      noStroke();
      fill(54);
      quad(this.a, this.b, x1, y1, x2, y2, x3, y3);
    }
  }
}

let w, h;
let cTLX, cTLY, cBLX, cBLY, cBRX, cBRY, cTRX, cTRY;
let nTLX, nTLY, nBLX, nBLY, nBRX, nBRY, nTRX, nTRY;
let nW, sS, pad, qO;
let p1, p2;
let b;
let lScore, rScore;
let tMR1, tMR2, tMB1, tMB2;
let cH, cW, mBA, q1P, q3P;

function preload() {
  tMR1 = loadImage('https://res.cloudinary.com/dkw0kkkgd/image/upload/v1550623424/tennisManRedOne_zaszr5.png');
  tMR2 = loadImage('https://res.cloudinary.com/dkw0kkkgd/image/upload/v1550623420/tennisManRedTwo_mz3skr.png');
  tMB1 = loadImage('https://res.cloudinary.com/dkw0kkkgd/image/upload/v1550623406/tennisManBlueOne_jo7ppq.png');
  tMB2 = loadImage('https://res.cloudinary.com/dkw0kkkgd/image/upload/v1550623416/tennisManBlueTwo_ac6ppw.png');
}

function setup() {
  initCanvas();
  lScore = 0; rScore = 0;
  initCourtCoords();
  initNetCoords();
  initPaddles();
  b = new B(w * 0.5, h * 0.5, w * 0.021);
}

function initCanvas() {
  h = min(window.innerHeight, window.innerWidth / 2);
  w = min(window.innerWidth, h * 2);
  createCanvas(w, h);
}

function draw() {
  p1.move();
  p2.autoMove(b.b);
  updateB();
  checkCollision();
  checkWall();
  checkScore();
  background(30,30,30);
  drawCourt();
  drawCourtLines();
  p1.render();
  p2.render();
  drawNet();
  b.render();
  drawScore();
}

function initCourtCoords() {
  pad = h * 0.125;
  qO = w * 0.125;

  cTLX = pad + qO;
  cTLY = pad;
  cBLX = pad;
  cBLY = h - pad;
  cBRX = w - pad - qO;
  cBRY = h - pad;
  cTRX = w - pad;
  cTRY = pad;
}

function initNetCoords() {
  nW = h * 0.125;
  sS = w * 0.021;

  nTLX = (w * 0.5) + qO * 0.5;
  nTLY = pad - nW;
  nBLX = w * 0.5 - qO * 0.5;
  nBLY = h - pad - nW;
  nBRX = w * 0.5 - qO * 0.5;
  nBRY = h - pad;
  nTRX = w * 0.5 + qO * 0.5;
  nTRY = pad;
}

function initPaddles() {
  const bB = cBLY;
  const tB = cTRY;
  const yB = [bB, tB];

  const pos = [cBLX + 30, cBLY - 60];
  const s = (cBLY - cTLY) / (cBLX - cTLX);
  const bImgs = [tMB1, tMB2];
  p1 = new P(...pos, s, ...yB, bImgs, true, w * 0.03);

  const pos2 = [cTRX - 70, cTRY + 60];
  const s2 = (cTRY - cBRY) / (cTRX - cBRX);
  const rImgs = [tMR1, tMR2];
  p2 = new P(...pos2, s2, ...yB, rImgs, false, w * 0.03);
}

function keyReleased() {
  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    p1.setDir('none');
  } else if (keyCode === 87 || keyCode === 83) {
    p1.setDir('none');
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    p1.setDir('up');
  } else if (keyCode === DOWN_ARROW) {
    p1.setDir('down');
  }
}

function checkCollision() {
  const bB = b.b + b.r,
        tB = b.b - b.r,
        tP1 = p1.b - p1.h,
        bP1 = p1.b + p1.h,
        tP2 = p2.b - p2.h,
        bP2 = p2.b + p2.h;

  if (b.a >= p1.a - p1.w && b.a <= p1.a + p1.w) {
    if (tB <= bP1 && bB >= tP1) {
      playerHit();
    }
  } else if (b.a >= p2.a - p2.w && b.a <= p2.a + p2.w) {
    if (tB <= bP2 && bB >= tP2) {
      computerHit();
    }
  }
}

function playerHit() {
  b.v.x *= -1.03;
  b.a = p1.a + p1.w + 5;
  let vMag;
  let xV = b.v.x;

  const maxTopS = (cTRY - (p1.b - p1.h)) / (cTRX - (p1.a + p1.w));
  const maxBottomS = (cBRY - (p1.b + p1.h)) / (cBRX - (p1.a + p1.w));

  if (b.b < p1.b) {
    vMag = -random(4);
    b.v.y = map(vMag, -4, 0, xV * maxTopS, 0);
  } else {
    vMag = random(4);
    b.v.y = map(vMag, 0, 4, 0, xV * maxBottomS);
  }
}

function computerHit() {
  b.v.x *= -1.03;
  b.a = p2.a - p2.w - 4;
  let vMag;
  let xV = b.v.x;

  const maxTopS = (cTLY - (p2.b - p2.h)) / (cTLX - (p2.a - p2.w));
  const maxBottomS = (cBLY - (p2.b + p2.h)) / (cBLX - (p2.a - p2.w));

  if (b.b < p2.b) {
    vMag = -random(4);
    b.v.y = map(vMag, -4, 0, xV * maxTopS, 0);
  } else {
    vMag = random(4);
    b.v.y = map(vMag, 0, 4, 0, xV * maxBottomS);
  }
}

function resetB() {
  b.a = w * 0.5;
  b.b = h * 0.5;
  b.sY = h * 0.5;
  b.v.x = (b.v.x < 0) ? b.r * 0.21 : -(b.r * 0.21);
  b.v.y = random(-b.r * 0.084, b.r * 0.084);
}

function checkWall() {
  const uB = cTLY;
  const lB = cBLY;

  if (b.b <= uB) { b.v.y *= -1 }
  if (b.b >= lB) { b.v.y *= -1 }
}

function checkScore() {
  const lB = cBLX;
  const rB = cTRX;

  if (b.a <= lB) { 
      rScore++; 
      displayMessage("red wins, cheers", "red");
      resetB(); 
  }
  if (b.a >= rB) { 
      lScore++; 
      displayMessage("blue wins, cheers", "blue");
      resetB(); 
  }
}

function displayMessage(text, color) {
  const messageDiv = document.getElementById('message');
  messageDiv.innerText = text;
  messageDiv.className = `message ${color}`;
  messageDiv.style.display = 'block';

  if (color === "red") {
      messageDiv.style.left = "300px"; 
      messageDiv.style.bottom = "100px"; 
  } else if (color === "blue") {
      messageDiv.style.left = "10px"; 
      messageDiv.style.bottom = "100px"; 
  }


  setTimeout(() => {
      messageDiv.style.display = 'none';
  }, 2000);
}

function updateB() {
  let arc;
  mBA = h * 0.0625;
  cW = w - (2 * pad) - qO;
  q1P = cBLX + qO * 0.5 + cW * 0.25;
  q3P = cTRX - qO * 0.5 - cW * 0.25;

  const r1X = p1.a + p1.w;
  const r2X = p2.a - p2.w;

  if (b.v.x > 0) {
    if (b.a <= w * 0.5) {
      arc = map(b.a, r1X, w * 0.5, mBA * 0.5, mBA);
    } else if (b.a > w * 0.5 && b.a <= q3P) {
      arc = map(b.a, w * 0.5, q3P, mBA, 0);
    } else {
      arc = map(b.a, q3P, r2X, 0, mBA * 0.5);
    }
  } else {
    if (b.a >= w * 0.5) {
      arc = map(b.a, r2X, w * 0.5, mBA * 0.5, mBA);
    } else if (b.a < w * 0.5 && b.a >= q1P) {
      arc = map(b.a, w * 0.5, q1P, mBA, 0);
    } else {
      arc = map(b.a, q1P, r1X, 0, mBA * 0.5);
    }
  }
  b.upd(arc);
}

function drawCourt() {
  noStroke();
  fill(54);
  const shift = 10;
  quad(cTLX + shift, cTLY + shift, cBLX + shift, cBLY + shift, cBRX + shift, cBRY + shift, cTRX + shift, cTRY + shift);

  fill(161, 238, 168);
  quad(cTLX, cTLY, cBLX, cBLY, cBRX, cBRY, cTRX, cTRY);
}

function drawCourtLines() {
  stroke(255);

  cH = h - (2 * pad);
  const tSLX1 = pad + ((1 - 0.125) * qO),
        tSLY = pad + (0.125 * cH),
        tSLX2 = w - pad - (0.125 * qO);

  line(q1P, h * 0.5, q3P, h * 0.5);

  const mL = w / 64;
  const lX = cBLX + qO * 0.5;
  const rX = cTRX - qO * 0.5;
  line(lX, h * 0.5, lX + mL, h * 0.5);
  line(rX - mL, h * 0.5, rX, h * 0.5);

  line(tSLX1, tSLY, tSLX2, tSLY);

  const bSLX1 = pad + (0.125 * qO),
        bSLY = pad + ((1 - 0.125) * cH),
        bSLX2 = w - pad - ((1 - 0.125) * qO);

  line(bSLX1, bSLY, bSLX2, bSLY);

  line(bSLX1 + cW * 0.25, bSLY, tSLX1 + cW * 0.25, tSLY);
  line(bSLX2 - cW * 0.25, bSLY, tSLX2 - cW * 0.25, tSLY);
}

function drawNet() {
  strokeWeight(1);
  noStroke();
  fill(54, 54, 54, 54);
  quad(nTRX, nTRY, nBRX, nBRY, nBRX + sS, nBRY, nTRX + sS, nTRY);

  stroke(54);
  line(nBLX, nBRY - nW * 0.75, nTRX, nTRY - nW * 0.75);
  line(nBLX, nBRY - nW * 0.5, nTRX, nTRY - nW * 0.5);
  line(nBLX, nBRY - nW * 0.25, nTRX, nTRY - nW * 0.25);
  line(nBRX, nBRY, nTRX, nTRY);

  for (let i = 1; i <= 9; i++) {
    line(nBLX + (i * qO) / 10, (10 - i) * cH / 10 + nW, nBLX + (i * qO) / 10, (10 - i) * cH / 10);
  }

  stroke(245);
  strokeWeight(4);
  line(nTLX, nTLY, nBLX, nBLY);
  line(w * 0.5, h * 0.5, w * 0.5, h * 0.5 - nW);
  stroke(54);
  line(nBRX, nBRY, nBLX, nBLY);
  strokeWeight(3);
  line(nTRX, nTRY, nTLX, nTLY);
}

function drawScore() {
  textSize(h * 0.1);
  noStroke();
  fill(54);
  textAlign(RIGHT);
  text(lScore, pad + qO + (cW * 0.25), pad - 10);
  textAlign(LEFT);
  text(rScore, w - pad - (cW * 0.25), pad - 10);
} 