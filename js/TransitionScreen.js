// NON-INTERACTIVE PART USED BETWEEN MODULES TO CONTROL PACING AND MOOD. IT FADES IN A TYPED TITLE AND SUBTITLE, PLAYS THE MODULE-SPECIFIC AUDIO THEN FADES OUT ONLY AFTER THE AUDIO. VISUAL GLITCHES AND SUBLIMINAL FLASHES REINFORCE PSYCHOLOGICAL PRESSURE ETC ETC . . .

class TransitionScreen extends Screen {
  constructor(title, subtitle, font) {
    super();
    this.title = title;
    this.subtitle = subtitle;
    this.font = font;

    this.alpha = 0;
    this.done = false;

    this.barY = 0;
    this.scanOffset = 0;

    this.timer = 0;
    this.state = "fadeIn";

    // SUBLIMINALS AND SUCH
    this.flashFrames = floor(random(25, 40));
    this.bigBurstFrames = 30;

    // ACTIVATES THE TYPEWRITER
    this.titleWriter = new Typewriter(this.title || "", 35);
    this.subtitleWriter = this.subtitle
      ? new Typewriter(this.subtitle, 28)
      : null;

    // MODULE INTRO AUDIO
    
    this.audio =
      this.moduleNumber !== null && moduleAudio[this.moduleNumber]
        ? moduleAudio[this.moduleNumber]
        : null;

    this.audioPlayed = false;
    this.audioFinished = false;

    // THIS MAKES SURE THE AUDIO OF THE SLIDE ONLY PLAYS WHEN THE SLIDE IS VISIBLE
    this.hasRendered = false;

    this.flickerState = false;
    this.lastFlicker = millis();
  }

  update() {
    // THIS MAKES SURE THE TYPEWRITER IS ALWAYS UPDATED
    if (this.moduleNumber === 5) {
      if (millis() - this.lastFlicker > random(80, 220)) {
        this.flickerState = !this.flickerState;
        this.lastFlicker = millis();
      }
    }

    this.titleWriter.update();
    if (this.subtitleWriter) this.subtitleWriter.update();

// THIS MAKES SURE AUDIO STARTS ONCE, HAD A FEW PROBLEMS IN PAST W/ THIS
    if (this.audio && this.hasRendered && !this.audioPlayed) {
      this.audio.play();
      this.audioPlayed = true;
    }

// THIS DETECTS WHEN THE AUDIO IS FINISHED
    if (
      this.audioPlayed &&
      this.audio &&
      !this.audio.isPlaying() &&
      !this.audioFinished
    ) {
      this.audioFinished = true;
    }
// CONTROLS STANDARD TRANSITION FLOW
    if (this.state === "fadeIn") {
      this.alpha += 4;
      if (this.alpha >= 255) {
        this.alpha = 255;
        this.state = "hold";
        this.timer = millis();
      }
    } else if (this.state === "hold") {
      const audioDone = !this.audio || this.audioFinished;

      if (audioDone && millis() - this.timer > 2000) {
        this.state = "fadeOut";
      }
    } else if (this.state === "fadeOut") {
      this.alpha -= 4;
      if (this.alpha <= 0) {
        this.alpha = 0;
        this.done = true;
      }
    }

// THIS CONTROLS THE CRT STUFF
    this.scanOffset += 0.5;
    this.barY = (this.barY + 1) % height;

    // THIS WARPS THE AMBIENCE PITCH
    if (typeof ambience !== "undefined") {
      ambience.rate(this.state === "fadeOut" ? random(0.94, 1.06) : 1);
    }
  }

  display() {
    // THIS BOOLEAN VAL. ALLOWS AUDIO TO START
    this.hasRendered = true;

    clear();
    background(5);

    this.drawScanlines();
    this.drawStatic();
    this.drawVignette();
    this.drawRollingBar();

    textFont(this.font);

    const typedTitle = this.titleWriter.getText() || "";
    const typedSubtitle = this.subtitleWriter
      ? this.subtitleWriter.getText() || ""
      : "";

    // THIS PART CONTROLS THE RESULT OF EACH MODULE, COLOUR OF THE PASSED OR FAILED TEXT, ETC
    if (this.title.includes("COMPLETE") && this.subtitle.includes("/")) {
      textAlign(CENTER, CENTER);
      textSize(38);
      fill(255, this.alpha);
      text(
        typedTitle,
        width / 2 + random(-1, 1),
        height / 2 - 40 + random(-1, 1)
      );

      textSize(28);
      if (this.subtitle.startsWith("PASSED")) fill(0, 255, 0, this.alpha);
      else fill(255, 0, 0, this.alpha);

      text(
        typedSubtitle,
        width / 2 + random(-1, 1),
        height / 2 + 15 + random(-1, 1)
      );

      if (this.flashFrames > 0) {  // MISC. FLASHING TEXT ETC
        this.flashFrames--;
        textSize(24);
        fill(255, random(140, 200));
        push();
        translate(
          width / 2 + random(-200, 200),
          height / 2 + random(-150, 150)
        );
        rotate(random(-0.08, 0.08));
        text("DON'T SAVE THEM", 0, 0);
        pop();
      }

      if (this.title === "MODULE 2 COMPLETE" && this.bigBurstFrames > 0) {
        this.bigBurstFrames--;

        const msgs = [
          "YOU ARE BEING WATCHED", // THESE ARE THE ASSORTMENT OF WEIRD MESSAGES I DRAFTED
          "SOMETHING IS WRONG",
          "THIS ISN'T REAL",
          "ECHOES DETECTED",
          "STOP LISTENING",
          "KEEP STILL",
          "BEHIND YOU",
          "RETURN TO THE LINE",
          "CONNECTION BREACHED",
          "IDENTITY MISMATCH",
          "UNKNOWN VOICE PATTERN",
          "LOOK AWAY",
          "NO NO NO NO",
          "ERROR 7F-Δ",
          "DO NOT MOVE",
          "STOP",
          "GET OUT",
          "RUN",
          "IT HEARS YOU",
          "YOU SHOULDN'T BE HERE",
        ];

        for (let i = 0; i < 20; i++) {
          fill(255, 0, 0, random(90, 200));
          textSize(random(14, 26));
          text(msgs[floor(random(msgs.length))], random(width), random(height));
        }
      }

      if (this.subtitle.startsWith("FAILED") && random() < 0.02) {
        fill(255, 0, 0, 190);
        textSize(20);
        text("YOU SHOULD NOT BE HERE", width / 2, height / 2 + 70);
      }
    }

    // THIS IS THE BOG-STANDARD INTRO
    else {
      textAlign(CENTER, TOP);
      textSize(32);

      // CONTROLS THE TITLE FLICKER OF M5
      if (this.moduleNumber === 5 && this.flickerState) {
        fill(200, 40, 40, this.alpha); // RED intrusive title
        text("WHO ARE YOU?", width / 2 + random(-2, 2), 40 + random(-2, 2));
      } else {
        fill(255, this.alpha); // NORMAL title
        text(typedTitle, width / 2 + random(-1, 1), 40 + random(-1, 1));
      }

      // CONTROLS THE SUBTITLE
      if (typedSubtitle) {
        textSize(22);
        textAlign(CENTER, CENTER);
        fill(255, this.alpha);
        text(
          typedSubtitle,
          width / 2 + random(-1, 1),
          height / 2 + random(-1, 1)
        );
      }
    }

    // Ghost flicker
    if (random() < 0.02) {
      textSize(16);
      fill(255, random(40, 120));
      textAlign(CENTER, CENTER);
      text(
        "UNRESOLVED SIGNAL",
        width / 2 + random(-40, 40),
        height / 2 + random(-60, 60)
      );
    }

    // THIS ADDS THE WATER MARK AT BOTTOM LEFT OF GAME
    textAlign(LEFT, BOTTOM);
    fill(255, 40);
    textSize(12);
    text("OPERATOR CODE: 7F-Δ / ACTIVE SESSION", 20, height - 20);

    // VERY SMALL CHANCE OF SHOWING A DAMAGE FLASH
    if (random() < 0.0007) {
      noStroke();
      fill(255, random(120, 220));
      rect(0, 0, width, height);
    }
  }

  
  
  // THIS IS THE VHS EFFECTS AGAIN WOOHOO
  drawScanlines() {
    stroke(200, 200, 200, 90);
    let o = this.scanOffset % 4;
    for (let y = 0; y < height; y += 4) {
      line(random(-1, 1), y + o, width + random(-1, 1), y + o);
    }
  }

  drawRollingBar() {
    noStroke();
    for (let i = 0; i < 60; i++) {
      fill(255, 255, 255, map(i, 0, 60, 80, 0));
      rect(0, this.barY + i, width, 1);
    }
  }

  drawStatic() {
    stroke(255, 25);
    for (let i = 0; i < 400; i++) {
      point(random(width), random(height));
    }
  }

  drawVignette() {
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

  checkClick() {}
}
