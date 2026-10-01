// オリジナルブロック崩し (Processing → p5.js 移植版)

const BLN = 11;                  // ブロックの数(縦横)
const BLSX = 40, BLSY = 40;      // ブロックの大きさ
const BAD = 15;                  // ボールの直径

let px = 0, py = 860;            // バーの座標
let psx = 0, psy = 10;           // バーの幅・高さ
let bavx = 0, bavy = 0;          // ボールの速度
let bax = 0, bay = 0;            // ボールの座標
let lx = 0, ly = 0;              // マス目の線の位置

let blx = [];                    // ブロックのx座標
let bly = [];                    // ブロックのy座標
let bap = [];                    // ブロックの有無 1あり、0なし
let blockcolor = [];             // ブロックの色(RGB)
let counter = [];                // 色が変わるまでのフレームカウント

let angle = 0;                   // 0:発射前 1:発射中
let num = 0;                     // 0:右向き 1:左向き
let reset = 0;                   // リセット回数
let power = 3;                   // 速さ(1〜5)
let score = 0;
let hit = 0;
let editMode = 0;                // 0:なし 1:DRAW 2:ERASE (元コードの変数名drawは関数名と衝突するため変更)
let guide = 0;                   // 偶数のとき説明書を表示

let ballflag = false;
let startflag = false;

// シークレットメッセージ
let s1 = false;
let s2 = false;
let s3 = false;

let guideline;                   // 説明書の画像

function preload() {
  guideline = loadImage("rule.png");
}

function setup() {
  // 元のコードはsize(600, 800)でしたが、座標は800x1000前提で書かれているため合わせています
  createCanvas(800, 1000);
  textFont('sans-serif');
  frameRate(60);

  bay = 855 - BAD / 2;
  initBlocks();
}

// ブロックの配置と有無をランダムに作り直す
function initBlocks() {
  for (let i = 0; i < BLN; i++) {
    blx[i] = [];
    bly[i] = [];
    bap[i] = [];
    blockcolor[i] = [];
    if (!counter[i]) counter[i] = [];
    for (let j = 0; j < BLN; j++) {
      blx[i][j] = (BLSX + 20) * i + 80;
      bly[i][j] = (BLSY + 20) * j + 80;
      bap[i][j] = floor(random(2));
      blockcolor[i][j] = [random(0, 255), random(0, 255), random(0, 255)];
      if (counter[i][j] === undefined) counter[i][j] = 0;
    }
  }
}

function draw() {
  background(0);
  ball();
  block();
  playervar();
  setting();
  secret();
}

function ball() {
  // 玉の初期配置
  if (angle === 0) {
    fill(255);
    noStroke();
    ellipse(mouseX, bay, BAD, BAD);
    stroke(255);
    strokeWeight(5);

    if (num % 2 === 0) {
      line(mouseX + 20, 825, mouseX + 40, 805);
      line(mouseX + 40, 805, mouseX + 33, 805);
      line(mouseX + 40, 812, mouseX + 40, 805);
    }
    if (num % 2 === 1) {
      line(mouseX - 20, 825, mouseX - 40, 805);
      line(mouseX - 40, 805, mouseX - 33, 805);
      line(mouseX - 40, 812, mouseX - 40, 805);
    } // ↗
  }

  // 弾の軌道、青い
  if (startflag) {
    noStroke();
    fill(0, 0, 255);
    ellipse(bax, bay, BAD, BAD);
  }

  // 弾の発射、速度判定 (SHIFTキー)
  if (keyIsDown(SHIFT)) {
    startflag = true;
    angle = 1;
    if (power === 1) {
      bavy = -2;
      bavx = 2;
    } else if (power === 2) {
      bavy = -3.5;
      bavx = 3.5;
    } else if (power === 3) {
      bavy = -5;
      bavx = 5;
    } else if (power === 4) {
      bavy = -7.5;
      bavx = 7.5;
    } else if (power === 5) {
      bavy = -9;
      bavx = 9;
    }
  }

  // 弾
  if (startflag) {
    if (!ballflag) {
      bax = mouseX;
      ballflag = true;
    }
    if (num % 2 === 0 && angle === 1) {
      bax = bax + bavx;
      bay = bay + bavy;
    }
    if (num % 2 === 1 && angle === 1) {
      bax = bax - bavx;
      bay = bay + bavy;
    }
    noStroke();
    fill(255);
    ellipse(bax, bay, BAD, BAD);
    editMode = 0;
  }

  // 壁の反射
  if (bax > 780) {
    bavx = -bavx;
    bax -= 6;
  }
  if (bax < 20) {
    bavx = -bavx;
    bax += 6;
  }
  if (bay < 20) {
    bavy = -bavy;
  }
}

function block() {
  // ブロック生成
  for (let i = 0; i < BLN; i++) {
    for (let j = 0; j < BLN; j++) {
      if (bap[i][j] === 1) {
        if (counter[i][j] > 60) {
          blockcolor[i][j] = [random(10, 255), random(10, 255), random(10, 255)];
          counter[i][j] = 0;
        } else {
          counter[i][j]++;
        }
        fill(blockcolor[i][j][0], blockcolor[i][j][1], blockcolor[i][j][2]);
        noStroke();
        rectMode(CORNER);
        rect(blx[i][j], bly[i][j], BLSX, BLSY);
      }
    }
  }

  // ブロックとの衝突反射
  for (let i = 0; i < BLN; i++) {
    for (let j = 0; j < BLN; j++) {
      if (bap[i][j] === 1) {
        if (abs(bay - bly[i][j] - BLSY * 0.5) < (BAD * 0.5 + BLSY * 0.5) &&
            abs(bax - blx[i][j] - BLSX * 0.5) < (BAD * 0.5 + BLSX * 0.5)) {

          if (bly[i][j] > bay - bavy) {
            bavy = -bavy; // 上辺
            bap[i][j] = 0;
            score += 10;
            hit += 1;
            bay += -5;
          } else if (blx[i][j] > bax - bavx) {
            bavx = -bavx; // 左辺
            bap[i][j] = 0;
            score += 10;
            hit += 1;
            bay += -5;
          } else if (blx[i][j] + BLSX < bax - bavx) {
            bavx = -bavx; // 右辺
            bap[i][j] = 0;
            score += 10;
            hit += 1;
            bax += 5;
          } else if (bly[i][j] + BLSY < bay - bavy) {
            bavy = -bavy; // 下辺
            bap[i][j] = 0;
            score += 10;
            hit += 1;
            bay += 5;
          }
        }
      }
    }
  }

  // クリエイトモード
  for (let i = 0; i < BLN; i++) {
    for (let j = 0; j < BLN; j++) {
      if (blx[i][j] < mouseX && mouseX < blx[i][j] + BLSX &&
          bly[i][j] < mouseY && mouseY < bly[i][j] + BLSY) {
        if (editMode === 1) {
          bap[i][j] = 1;
        } else if (editMode === 2) {
          bap[i][j] = 0;
        }
      }
    }
  }
}

function playervar() {
  // バー
  fill(255);
  noStroke();
  px = mouseX;
  psx = 20 + score * 0.12;
  rectMode(CENTER);
  rect(px, py, psx, psy);

  // プレイヤーとボールの衝突反射
  if ((py - psy / 2) < (bay + BAD / 2 - psy / 2) && (bay - 10 < py) &&
      abs(bax - px) < (BAD / 2 + psx / 2)) {
    bavy = -bavy;
    bay = 850;
    bay = bay + bavy;
  }
}

function mouseClicked() {
  if (angle === 0) {
    // route
    if (500 < mouseX && mouseX < 535 && 900 < mouseY && mouseY < 935) {
      num = 1;
    } else if (550 < mouseX && mouseX < 585 && 900 < mouseY && mouseY < 935) {
      num = 0;
    }

    // speed -
    if (500 < mouseX && mouseX < 535 && 950 < mouseY && mouseY < 985) {
      power -= 1;
      bavx -= 1.5;
      bavy -= -1.5;
      if (bavx < 2 && bavy > -2) {
        bavx = 2;
        bavy = -2;
      }
    }

    // speed +
    if (550 < mouseX && mouseX < 585 && 950 < mouseY && mouseY < 985) {
      power += 1;
      bavx += 1.5;
      bavy += -1.5;
      if (bavx > 8 && bavy < -8) {
        bavx = 8;
        bavy = -8;
      }
    }

    // draw & erase
    if (105 < mouseX && mouseX < 185 && 900 < mouseY && mouseY < 935) {
      editMode = 1;
    }
    if (105 < mouseX && mouseX < 185 && 950 < mouseY && mouseY < 985) {
      editMode = 2;
    }
  }

  // guide (クリックの回数の偶奇でオンオフ)
  if (690 < mouseX && mouseX < 770 && 900 < mouseY && mouseY < 935) {
    guide += 1;
  }

  // reset
  if (690 < mouseX && mouseX < 770 && 950 < mouseY && mouseY < 985) {
    bay = 855 - BAD / 2;
    bax = 0;
    angle = 0;
    ballflag = false;
    startflag = false;
    num = 0;
    hit = 0;
    editMode = 0;
    reset += 1;
    initBlocks();
  }
}

function secret() { // シークレットメッセージ
  if (score >= 9999) {
    score = 9999;
    s1 = true;
  }
  if (hit === 121) {
    s3 = true;
  }
  if (reset >= 100) {
    s2 = true;
  }

  noStroke(); // p5.jsはstrokeが有効だと文字にも縁取りが付くため
  textSize(20);
  fill(255, 255, 0);
  if (s1) { // スコア9999
    text(" ◆ You got SCORE  '9999' ...really!?!?!?  wow!!  incredible!!", 20, 800, 800, 200);
  }
  if (s2) { // reset100回
    text(" ◆ You clicked RESET  '100'  times!  Very happy~~!  have fun! ", 20, 780, 800, 200);
  }
  if (s3) { // ヒット数121回
    text(" ◆ You got HIT! '121'  Nice play!  uresi~~!!  (*^_^*)", 20, 820, 800, 200);
  }
  if (s1 && s2 && s3) {
    text(" ◆ Secret message was complete!  Thank you so much for playing my game! ", 20, 750, 800, 200);
  }
}

function setting() {
  // 線の配列
  stroke(0, 150, 0);
  strokeWeight(1.5);

  for (let l = 0; l < 20; l++) {
    line(lx + 70, 70, lx + 70, 730);
    line(70, ly + 70, 730, ly + 70);
    ly += 60;
    lx += 60;
    if (lx > 800) {
      lx = 0;
    }
    if (ly > 700) {
      ly = 0;
    }
  }

  rectMode(CORNER); // 縁
  noFill();
  stroke(200);
  strokeWeight(20);
  rect(10, 10, 780, 880);

  stroke(0, 0, 111); // 枠
  strokeWeight(30);
  rect(0, 0, 800, 900);
  fill(0, 0, 111);
  rect(0, 900, 800, 100);

  strokeWeight(10); // スコア枠
  fill(200);
  rect(10, 890, 780, 105);
  strokeWeight(5);
  line(width * 1 / 4, 890, width * 1 / 4, 995); // 仕切り線
  line(width * 2 / 4, 890, width * 2 / 4, 995);
  line(width * 3 / 4, 890, width * 3 / 4, 995);
  line(0, 942, 800, 942);

  // 機能リスト
  fill(0);
  noStroke(); // 文字に縁取りが付かないように
  textSize(25);
  text("DRAW", 20, 900, 100, 100);
  text("ERASE", 20, 950, 100, 100);
  text("SCORE", width * 1 / 4 + 10, 950, 100, 100);
  text("HIT!", width * 1 / 4 + 10, 900, 100, 100);
  text("ROUTE", width * 2 / 4 + 10, 900, 100, 100);
  text("SPEED", width * 2 / 4 + 10, 950, 100, 100);
  text("GUIDE", width * 3 / 4 + 10, 900, 100, 100);
  text("RESET", width * 3 / 4 + 10, 950, 100, 100);

  // 機能リスト 矢印や枠
  fill(150);
  stroke(0);
  strokeWeight(2);

  // route
  rect(500, 900, 35, 35);
  rect(550, 900, 35, 35);
  line(555, 930, 580, 905); // ↗
  line(580, 905, 580, 920);
  line(580, 905, 565, 905);
  line(505, 905, 530, 930); // ↖
  line(505, 905, 505, 920);
  line(505, 905, 520, 905);

  // speed
  rect(500, 950, 35, 35);
  rect(550, 950, 35, 35);
  line(505, 950 + 35 / 2, 530, 950 + 35 / 2); // -
  line(555, 950 + 35 / 2, 580, 950 + 35 / 2); // +
  line(555 + 25 / 2, 955, 555 + 25 / 2, 980);

  // draw / erase / guide / reset
  rect(105, 900, 80, 35);
  rect(105, 950, 80, 35);
  rect(690, 900, 80, 35);
  rect(690, 950, 80, 35);
  fill(0);
  triangle(695, 908, 695, 927, 710, 900 + 35 / 2);
  triangle(695, 958, 695, 977, 710, 950 + 35 / 2);
  triangle(110, 908, 110, 927, 125, 900 + 35 / 2);
  triangle(110, 958, 110, 977, 125, 950 + 35 / 2);
  noStroke();
  textSize(20);
  text("CLICK", 130, 910, 100, 100);
  text("CLICK", 130, 960, 100, 100);
  text("CLICK", 715, 910, 100, 100);
  text("CLICK", 715, 960, 100, 100);

  // ガイド表示
  if (bay > 930) {
    stroke(255, 0, 0);
    strokeWeight(5);
    line(650, 980, 680, 980);
    line(680, 980, 670, 975);
    line(680, 980, 670, 985);
  }
  if (startflag) {
    fill(255);
    strokeWeight(5);
    stroke(255, 0, 0);
    // draw erase
    ellipse(155, 950 + 35 / 2, 30, 30);
    line(140, 950 + 35 / 2, 170, 950 + 35 / 2);
    ellipse(155, 900 + 35 / 2, 30, 30);
    line(140, 900 + 35 / 2, 170, 900 + 35 / 2);
    // speed route
    ellipse(500 + 35 / 2, 950 + 35 / 2, 30, 30);
    line(502, 950 + 35 / 2, 530, 950 + 35 / 2);
    ellipse(500 + 35 / 2, 900 + 35 / 2, 30, 30);
    line(502, 900 + 35 / 2, 530, 900 + 35 / 2);
    ellipse(550 + 35 / 2, 950 + 35 / 2, 30, 30);
    line(552, 950 + 35 / 2, 580, 950 + 35 / 2);
    ellipse(550 + 35 / 2, 900 + 35 / 2, 30, 30);
    line(552, 900 + 35 / 2, 580, 900 + 35 / 2);
  }

  // 機能リストのシステム
  noStroke();
  fill(255);
  textSize(50);

  // score / hit
  text(String(score), width * 1 / 4 + 90, 948, 100, 100);
  text(String(hit), width * 1 / 4 + 90, 898, 100, 100);

  // route
  textSize(20);
  fill(0);
  if (num % 2 === 0) {
    text("RIGHT", width * 2 / 4 + 15, 922, 100, 100);
  } else if (num % 2 === 1) {
    text("LEFT", width * 2 / 4 + 15, 922, 100, 100);
  }

  // speed
  if (power === 1) {
    text("◆", width * 2 / 4 + 8, 972, 100, 100);
  } else if (power === 2) {
    text("◆◆", width * 2 / 4 + 8, 972, 100, 100);
  } else if (power === 3) {
    text("◆◆◆", width * 2 / 4 + 8, 972, 100, 100);
  } else if (power === 4) {
    text("◆◆◆◆", width * 2 / 4 + 8, 972, 100, 100);
  } else if (power === 5) {
    text("◆◆◆◆◆", width * 2 / 4 + 8, 972, 100, 100);
  } else if (power > 5) {
    power = 5;
  } else if (power < 1) {
    power = 1;
  }

  // draw & erase
  if (editMode === 1 && angle === 0) {
    fill(0);
    text("ON", 30, 922, 100, 100);
  } else if (editMode === 2 && angle === 0) {
    fill(0);
    text("ON", 30, 972, 100, 100);
  }

  // guide
  if (guide % 2 === 0) {
    image(guideline, 30, 30, 740, 840); // 説明書の画像

    stroke(255, 0, 0);
    strokeWeight(5);
    line(650, 930, 680, 930);
    line(680, 930, 670, 925);
    line(680, 930, 670, 935);
  }
}
