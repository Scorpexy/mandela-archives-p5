class EndScreen extends Screen {
  constructor(title, subtitle, font) {
    super();

    this.title = title;
    this.subtitle = subtitle;
    this.font = font;

    this.alpha = 0;
    this.fadeIn = true;
    this.done = false;

    this.scanOffset = 0;
    this.barY = 0;

    this.jitterX = 0;
    this.jitterY = 0;

    this.flashTimer = 0;
  }

  update() {
    // Fade in
    if (this.fadeIn) {
      this.alpha += 4;
      if (this.alpha >= 255) {
        this.alpha = 255;
        this.fadeIn = false;
      }
    }

    // CRT motion
    this.scanOffset += 0.5;
    this.barY = (this.barY + 1) % height;

    // subtle jitter
    this.jitterX = random(-0.6, 0.6);
    this.jitterY = random(-0.35, 0.35);

    // random subliminal flicker
    if (random() < 0.015) this.flashTimer = 6;
    if (this.flashTimer > 0) this.flashTimer--;
  }

  display() {
    background(5);

    this.drawScanlines();
    this.drawStatic();
    this.drawVignette();
    this.drawRollingBar();

    textFont(this.font);

    // ----------------------------------------------------
    // MAIN TEXT
    // ----------------------------------------------------
    push();
    translate(this.jitterX, this.jitterY);

    textAlign(CENTER, CENTER);

    fill(255, this.alpha);
    textSize(48);
    text(this.title, width/2, height/2 - 50);

    // subtitle color
    textSize(26);
    if (this.subtitle.startsWith("PASSED")) fill(0, 255, 0, this.alpha);
    else if (this.subtitle.startsWith("FAILED")) fill(255, 0, 0, this.alpha);
    else fill(255, this.alpha);

    text(this.subtitle, width/2, height/2 + 10);

    pop();

    // ----------------------------------------------------
    // "CLICK TO RESTART"
    // ----------------------------------------------------
    fill(255,150);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("CLICK ANYWHERE TO RESTART TRAINING", width/2, height - 40);

    // ----------------------------------------------------
    // SUBLIMINAL FLASH
    // ----------------------------------------------------
    if (this.flashTimer > 0) {
      fill(255, random(120,220));
      noStroke();
      rect(0,0,width,height);
    }
  }

  checkClick() {
    // Restart the whole program
    currentScreen = new TitleScreen(this.font, loadingSound);
  }

  // ----------------------------------------------------
  // CRT EFFECT HELPERS (copied from your style)
  // ----------------------------------------------------
  drawScanlines() {
    stroke(200,200,200,90);
    let o = this.scanOffset % 4;
    for (let y=0; y<height; y+=4) {
      line(random(-1,1), y+o, width+random(-1,1), y+o);
    }
  }

  drawRollingBar() {
    noStroke();
    for (let i=0; i<60; i++) {
      fill(255,255,255,map(i,0,60,80,0));
      rect(0, this.barY + i, width, 1);
    }
  }

  drawStatic() {
    stroke(255,25);
    for (let i=0; i<400; i++) point(random(width), random(height));
  }

  drawVignette() {
    noStroke();
    for (let i=0; i<120; i++) {
      fill(0,map(i,0,119,120,0));
      rect(i,0,1,height);
      rect(width-1-i,0,1,height);
    }
    for (let j=0; j<80; j++) {
      fill(0,map(j,0,79,160,0));
      rect(0,j,width,1);
      rect(0,height-1-j,width,1);
    }
  }
}
