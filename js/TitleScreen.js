// ESTABLISHED THE VHS/CRT AESTHETIC AND ALLOWS USER TO PRESS START, UPON THIS, UI IS HIDDEN, LOADING SOUND IS PLAYED AND ALLOWS TRANSITION ONCE AUDIO FINISHES, ALL GENERAL CRT//VHS EFFECTS INSTIL ATMOSPHERE

class TitleScreen {
  constructor(font, loadingSound) {
    this.font = font;                      // ALL JUST VAR. SETUPS
    this.loadingSound = loadingSound;

    this.flicker = 0;
    this.jitterX = 0;
    this.jitterY = 0;

    this.scanOffset = 0;
    this.barY = 0;

    
    this.timeSeconds = 1;
    this.lastUpdate = millis();

    // START BUTTON
    this.buttonX = width / 2 - 150;
    this.buttonY = height / 2 + 150;
    this.buttonW = 300;
    this.buttonH = 80;
    this.buttonPressed = false;

    // STATE FLAGS
    this.started = false;       // player clicked start
    this.disappeared = false;   // UI fades out
    this.finished = false;      // ready for next screen

    // BRIGHTNESS FLICKER
    this.brightnessFlicker = 0;
  }

  update() {  // TOP PARTS ARE MISC. VALS FOR VHS EFECTS

    this.jitterX = random(-0.6, 0.6);
    this.jitterY = random(-0.35, 0.35);


    this.flicker = random(0.995, 1.005);

    
    this.scanOffset += 0.5;


    this.barY += 1;
    if (this.barY > height) this.barY = -50;

    // TIMER
    if (millis() - this.lastUpdate >= 1000) {
      this.timeSeconds++;
      this.lastUpdate = millis();
    }

    // CONTROLS THE BRIGHTNESS FLICKER, CHANGE FOR VARIANCE
    this.brightnessFlicker = random(0, 25);


    // HIDES THE MAJORITY OF THE UI AFTER THE "START" BUTTON IS PRESSED
    if (this.started && !this.disappeared) {
      this.disappeared = true;
    }

    // THIS TRANSITIONS THE SCREEN TO FIRST SCREEN AFTER THE "LOADING" SOUND FINISHES
    if (this.started && !this.loadingSound.isPlaying()) {
      this.finished = true;
    }
  }

  display() {
    background(5);

    // --- CRT EFFECTS ---
    this.drawScanlines();
    this.drawStatic();
    this.drawVignette();

    textFont(this.font);
    textSize(28);
    fill(255);


    if (!this.disappeared) {
      // ADDS THE PLAY LABEL
      push();
      translate(this.jitterX, this.jitterY);
      translate(20, 20);
      textAlign(LEFT, TOP);
      this.textRGB("PLAY |>", 0, 0, color(200));  // THE PLAY BUTTON LOOKS A TAD WEIRD BECAUSE MY FANCY FONT WOULDN'T WORK WITH THE EMOJI, SO ENJOY THE CRUDELY DRAWN BUTTON
      pop();

      // SLP (I DONT KNOW WHAT THIS ACTUALLY IS, JUST FOUND IT CONSISTENTLY ON VHS VIDEO SCREENS)
      push();
      translate(this.jitterX, this.jitterY);
      translate(20, height - 40);
      textAlign(LEFT, TOP);
      this.textRGB("SLP", 0, 0, color(200));
      pop();

      // TITLE
      push();
      textFont(this.font);
      textSize(70);
      scale(0.7);

      let sx = width / 0.7 / 2;
      let sy = height / 0.7 / 2 - 60;

      textAlign(CENTER, CENTER);

      this.textRGB("EMERGENCY LINE", sx, sy, color(201, 29, 29));    // COULDN'T THINK OF A MORE CLEVER WAY OF HAVING A MULTIPLE LINE TITLE??
      this.textRGB("INTEGRITY", sx, sy + 70, color(201, 29, 29));
      this.textRGB("TRAINING", sx, sy + 140, color(201, 29, 29));

      pop();

      // START BUTTON
      this.drawButton();
    }

    // MAKES THE TIMER VISIBLE AFTER THE "START" BUTTON IS PRESSED, IDK WHY I ADDED THIS I JUST THOUGHT ITWAS COOL
    push();
    translate(this.jitterX, this.jitterY);
    translate(width - 20, height - 40 - 3);
    textAlign(RIGHT, TOP);
    this.textRGB(this.formatTime(this.timeSeconds), 0, 0, color(230));
    pop();

    // INITIATES THE ROLLING BAR
    this.drawRollingBar();

    // INITIATES BRIGHTNESS FLICKER
    this.drawBrightnessFlicker();
  }

  // ---------------------------------------------------
  // BUTTON HANDLING
  // ---------------------------------------------------
  checkClick(mx, my) {
    if (this.disappeared) return;

    let inside =
      mx > width / 2 - this.buttonW / 2 &&
      mx < width / 2 + this.buttonW / 2 &&
      my > this.buttonY - this.buttonH / 2 &&
      my < this.buttonY + this.buttonH / 2;

    if (inside && !this.started) {
      this.buttonPressed = true;
      this.loadingSound.play();
      this.started = true;
      // do NOT set finished here
    }
  }

  // ---------------------------------------------------
  // FORMATTING + EFFECT HELPERS
  // ---------------------------------------------------

  textRGB(txt, x, y, baseCol) {
    push();
    fill(255, 0, 0, 80);
    text(txt, x - 1, y);
    fill(0, 255, 255, 80);
    text(txt, x + 1, y);
    fill(baseCol || 255);
    text(txt, x, y);
    pop();
  }

  drawButton() {  // THIS PROVIDES THE LAYOUT FOR THE "START" BUTTON, I.E. IN THE CENTER OF THE SCREEN AND A SLIGHT JITTER
    push();
    rectMode(CENTER);

    let jx = random(-0.3, 0.3);
    let jy = random(-0.2, 0.2);
    translate(jx, jy);

    let bgCol = this.buttonPressed ? color(172, 57, 57) : color(40);
    fill(bgCol);
    noStroke();
    rect(width / 2, this.buttonY, this.buttonW, this.buttonH, 4);

    stroke(120);
    strokeWeight(1.5);
    noFill();
    rect(width / 2, this.buttonY, this.buttonW - 4, this.buttonH - 4, 3);

    stroke(38, 38, 38);
    strokeWeight(4);
    rect(width / 2, this.buttonY, this.buttonW, this.buttonH, 4);

    fill(140, 140, 140);
    textAlign(CENTER, CENTER);
    textSize(32);
    stroke(0, 150);
    strokeWeight(6);
    text("START", width / 2, this.buttonY);

    stroke(0);
    strokeWeight(3);
    fill(140, 140, 140);
    text("START", width / 2, this.buttonY);

    pop();
  }

  formatTime(sec) { // SELF-EXPLANATORY
    let h = floor(sec / 3600);
    let m = floor((sec % 3600) / 60);
    let s = sec % 60;
    return nf(h, 2) + ":" + nf(m, 2) + ":" + nf(s, 2);
  }

  drawScanlines() {  // VHS EFFECT
    stroke(200, 200, 200, 90);
    let offset = this.scanOffset % 4;

    for (let y = 0; y < height; y += 4) {
      line(random(-1, 1), y + offset, width + random(-1, 1), y + offset);
    }
  }

  drawRollingBar() { // ADDS THE ROLLING BAR VHS EFFECT
    noStroke();
    let h = 60;
    for (let i = 0; i < h; i++) {
      let alpha = map(i, 0, h, 80, 0);
      fill(255, 255, 255, alpha);
      rect(0, this.barY + i, width, 1);
    }
  }

  drawStatic() {  // VHS EFFECT // THE CARRIED OVER VHS EFFECT ON EVERYTHING
    stroke(255, 255, 255, 25);
    strokeWeight(1);
    let count = 400;
    for (let i = 0; i < count; i++) {
      let x = random(width);
      let y = random(height);
      point(x, y);
    }
  }

  drawVignette() {
    noStroke();
    for (let i = 0; i < 120; i++) {
      let alpha = map(i, 0, 119, 120, 0);
      fill(0, alpha);
      rect(i, 0, 1, height);
      rect(width - 1 - i, 0, 1, height);
    }

    for (let j = 0; j < 80; j++) {
      let alpha = map(j, 0, 79, 160, 0);
      fill(0, alpha);
      rect(0, j, width, 1);
      rect(0, height - 1 - j, width, 1);
    }
  }

  drawBrightnessFlicker() {
    push();
    noStroke();
    fill(255, this.brightnessFlicker);
    rect(0, 0, width, height);
    pop();
  }
}
