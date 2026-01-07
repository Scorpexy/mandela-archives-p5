// RUNDOWN: VERY CONFLICTED ABOUT THIS, IN THE WAY I BELIEVE IT SHOULD EITHER BE A RARE SIGHT, OR SEEM MORE SCARY, RATHER THAN JUST A WARNING.



class ModuleMinusOne extends Screen {   // LOOK, INHERITANCE!
  constructor(font) {
    super();
    this.font = font;

    this.alpha = 0;
    this.state = "fadeIn"; // SEQUENCE GOES AS IN fadeIn -> lines -> fadeOut
    this.done = false;

    this.lines = [
      "⋯",
      "WHO ARE YOU?",
      "",
      "You are not in the records.",
      "Your origin conflicts with stored routes.",
      "Your designation is incomplete.",
      "",
      "This channel is not for you.",
      "Return to your assigned modules.",
      "Do not access MODULE -1 again."
    ];

    // THESE SPECIAL LINES ARE IN RED FOR SCARY PURPOSES ETC
    this.redLines = new Set([
      "WHO ARE YOU?",
      "You are not in the records.",
      "This channel is not for you.",
      "Do not access MODULE -1 again."
    ]);

    // one typewriter per line
    this.writers = this.lines.map(t => new Typewriter(t, 24));
    this.currentLine = 0;
    this.lineDoneTime = null;
    this.lineHoldMs = 900;
  }

  update() {
    if (this.state === "fadeIn") {
      this.alpha += 6;
      if (this.alpha >= 255) {
        this.alpha = 255;
        this.state = "lines";
      }
    } else if (this.state === "lines") {
      let w = this.writers[this.currentLine];
      w.update();

      if (w.isDone()) {
        if (this.lineDoneTime === null) {
          this.lineDoneTime = millis();
        } else if (millis() - this.lineDoneTime > this.lineHoldMs) {
          this.currentLine++;
          this.lineDoneTime = null;

          if (this.currentLine >= this.lines.length) {
            this.state = "fadeOut";
          }
        }
      }
    } else if (this.state === "fadeOut") {
      this.alpha -= 4;
      if (this.alpha <= 0) {
        this.alpha = 0;
        this.done = true;
      }
    }
  }

  display() {
    clear();
    background(5);

    this.drawScanlines();
    this.drawStatic();
    this.drawVignette();

    if (this.font) textFont(this.font);
    textAlign(LEFT, TOP);

    let x = 60;
    let y = 120;
    let lineH = 32;

    for (let i = 0; i <= this.currentLine && i < this.lines.length; i++) {
      let txt =
        i === this.currentLine && this.state === "lines"
          ? this.writers[i].getText()
          : this.lines[i];

      if (txt === "") {
        y += lineH;
        continue;
      }

      // MAKES SURE ONLY COMPLETED LINES JITTER
      let jx = i < this.currentLine ? random(-0.6, 0.6) : 0;
      let jy = i < this.currentLine ? random(-0.6, 0.6) : 0;

      textSize(i === 1 ? 30 : 22);

      let isRed = this.redLines.has(this.lines[i]);

      
      let escalation = map(i, 0, this.lines.length - 1, 0.4, 1);

      // THIS CONTROLS THE RED SHADOW, NOTHING REALLY INTERESTING
      if (isRed) {
        fill(180, 30, 30, this.alpha * 0.5 * escalation);
        text(txt, x + jx + 1.4, y + jy + 1.4);
      }

      // main text
      if (isRed) {
        fill(220, 50, 50, this.alpha * escalation);
      } else {
        fill(220, this.alpha);
      }

      text(txt, x + jx, y + jy);
      y += lineH;
    }

    // THESE ARE THE OCCASIONAL RED GLITCHY BARS
    if (random() < 0.03) {
      for (let i = 0; i < 3; i++) {
        noStroke();
        fill(255, 0, 0, random(40, 120));
        rect(0, random(height), width, random(2, 6));
      }
    }

    // SUPER DUPER RARE FLARES FLASH (I AM YET TO SEE WHILE TESTING SO MAY NOT WORK)
    if (random() < 0.0015) {
      noStroke();
      fill(255, random(80, 180));
      rect(0, 0, width, height);
    }

    // operator watermark
    textSize(12);
    fill(255, 40);
    textAlign(LEFT, BOTTOM);
    text("INTERNAL CHANNEL / MODULE -1 / UNAUTHORISED", 20, height - 20);
  }

  checkClick(x, y) {}

  // THE FOLLOWING 3 HELPERS ARE USED TO CREATE THE VHS EFFECT WITH SCANLINES, STATIC AND VIGNETTE
  drawScanlines() {
    stroke(200, 200, 200, 60);
    let offset = frameCount % 4;
    for (let y = 0; y < height; y += 4) {
      line(random(-1, 1), y + offset, width + random(-1, 1), y + offset);
    }
  }

  drawStatic() {
    stroke(255, 25);
    for (let i = 0; i < 400; i++) point(random(width), random(height));
  }

  drawVignette() { // COLOUR SHIFTS AND SUCH
    noStroke();
    for (let i = 0; i < 120; i++) {
      fill(0, map(i, 0, 119, 120, 0));
      rect(i, 0, 1, height);
      rect(width - 1 - i, 0, 1, height);
    }
    for (let j = 0; j < 80; j++) {
      fill(0, map(j, 0, 79, 160, 0));
      rect(0, j, width, 1);
      rect(0, height - 1 - j, width, 1);
    }
  }
}
