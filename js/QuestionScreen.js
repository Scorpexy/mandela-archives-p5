// THE MAIN MULTIPLE CHOICE INTERACTION SCREEN, PRESENTING Q:A EFFECTS WITH PACING BEFORE INPUT ALLOED, RECORDS USERS SELECTION, HOLDS RESULT, FADES OUT TO SIGNAL COMPLETION, HAS SUBLTLE VISUAL DISTORTIONS TO UNDERMINE TRUST IN THE INTERFACE

class QuestionScreen extends Screen {
  constructor(questionText, answers, correctIndex, font, beepSound, screenId) { // EVEN MORE INHERITANCE FROM SCREEN
    super();

    this.questionText = (questionText ?? "").toString();

    // THIS MAKES SURE THE ANSWERS ARE STRINGS
    this.answers = Array.isArray(answers)
      ? answers.map((a) => (a ?? "").toString())
      : [];


    const ci = Number(correctIndex);
    this.correctIndex =
      Number.isFinite(ci) && this.answers.length > 0
        ? Math.min(Math.max(0, Math.floor(ci)), this.answers.length - 1)
        : 0;

    this.font = font || window.ocrFont;
    this.beepSound = beepSound || null;

    this.screenId = (screenId ?? "").toString();

    this.alpha = 0;
    this.fadingOut = false;
    this.selected = -1;
    this.done = false;
    this.holdTimerStarted = false;
    this.wasCorrect = false;

    this.selectionTime = 0;
    this.selectionDelayMs = 200;


    // THIS ACTIVATES THE TYPEWRITER

    this.qWriter = new Typewriter(this.questionText, 26);
    this.answerWriters = this.answers.map((txt) => new Typewriter(txt, 20));
    this.answersRevealed = 0;

    // MISC. HORROR SETTINGS I ADDED

    this.distortHitboxes = random() < 0.25;
    this.phantomAnswers = random() < 0.18;
    this.wrongTextFlash = random() < 0.12;
    this.flashTimer = 0;

    // BUTTON LAYOUT
    this.buttons = [];
    let startY = 250;
    let boxW = 600;
    let boxH = 60;
    let gap = 20;

    // THIS PART ALLOWS THE DISTORTION OF THE BOXES (NO ITS NOT BAD CODE!)
    for (let i = 0; i < this.answers.length; i++) {
      this.buttons.push({
        x: 100 + (this.distortHitboxes ? random(-12, 12) : 0),
        y:
          startY +
          i * (boxH + gap) +
          (this.distortHitboxes ? random(-8, 8) : 0),
        w: boxW + (this.distortHitboxes ? random(-20, 20) : 0),
        h: boxH + (this.distortHitboxes ? random(-10, 12) : 0),
        label: this.answers[i],
      });
    }
  }

  getResult() {
    return {
      done: !!this.done,
      selected: this.selected,
      wasCorrect: !!this.wasCorrect,
      correctIndex: this.correctIndex,
      screenId: this.screenId,
    };
  }

  // -------------------------------------------------
  // UPDATE
  // -------------------------------------------------
  update() {
    if (this.holdTimerStarted && !this.fadingOut) {
      if (millis() - this.selectionTime > this.selectionDelayMs) {
        this.fadingOut = true;
      }
    }

    if (!this.fadingOut && this.alpha < 255) {
      this.alpha += 6;
      if (this.alpha > 255) this.alpha = 255;
    }

    if (this.fadingOut) {
      this.alpha -= 10;
      if (this.alpha <= 0) {
        this.alpha = 0;
        this.done = true; // 
      }
    }

    this.qWriter.update();

    if (this.qWriter.isDone()) {
      if (this.answersRevealed === 0) {
        this.answersRevealed = 1;
      }

      for (let i = 0; i < this.answersRevealed; i++) {
        if (this.answerWriters[i]) this.answerWriters[i].update();
      }

      if (this.answersRevealed < this.answerWriters.length) {
        let last = this.answersRevealed - 1;
        if (this.answerWriters[last] && this.answerWriters[last].isDone()) {
          this.answersRevealed++;
        }
      }
    }

    if (this.wrongTextFlash) {
      if (this.flashTimer > 0) this.flashTimer--;
      else if (random() < 0.005) {
        this.flashTimer = floor(random(10, 30));
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

// THIS CONTROLS THE WRONG TEXT FLASH THING
    if (this.wrongTextFlash && this.flashTimer > 0) {
      push();
      fill(255, 40);
      textSize(26);
      textAlign(CENTER, CENTER);
      text(
        "M2Q4. This unit has already been compromised.",
        width / 2 + random(-20, 20),
        height / 2 + random(-20, 20)
      );
      pop();
    }

// MYSTICAL SHADOW BLOCK QUESTION
    const baseQ = this.questionText || "";
    let blockText = baseQ.replace(/./g, "█");
    fill(255, 20);
    textSize(28);
    textAlign(LEFT, TOP);
    text(blockText, 40 + random(-1, 1), 40 + random(-1, 1), 720, 200);
// THE TYPED MAIN QUESTION
    let typedQuestion = this.qWriter.getText() || "";
    fill(255, this.alpha);
    text(
      typedQuestion,
      40 + random(-0.7, 0.7),
      40 + random(-0.7, 0.7),
      720,
      200
    );
// FOLLOWING PARTS CONTROL THE ANSWER BOXES
    for (let i = 0; i < this.buttons.length; i++) {
      let b = this.buttons[i];

      let fillCol = color(0, 0);
      if (this.selected === i && !this.fadingOut) {
        fillCol = color(255, 255, 255, this.alpha * 0.35);
      }

      if (this.selected === i && !this.fadingOut) {
        // THIS ADDS WHITE BORDER AROUND BUTTON UPON SELECTION REF: SUCCESS CRITERIA 2
        stroke(255, 255, 255, 255);
        strokeWeight(4);

        
        push();
        noFill();
        stroke(255, 255, 255, 90);
        strokeWeight(8);
        rect(b.x - 2, b.y - 2, b.w + 4, b.h + 4, 6);
        pop();
      } else {
        stroke(255, this.alpha);
        strokeWeight(2);
      }

      fill(fillCol);
      rect(b.x, b.y, b.w, b.h, 4);
      let labelText = this.answerWriters[i]?.getText?.() || "";
      noStroke();
      fill(255, this.alpha);
      textSize(20);
      textAlign(LEFT, CENTER);

      let aJx = random(-0.4, 0.4);
      let aJy = random(-0.4, 0.4);

      text(labelText, b.x + 15 + aJx, b.y + b.h / 2 + aJy);

// THIS PART CONTROLS THOSE PHANTOM ANSWERS WHICH I RARELY SEE, BUT DO EXIST
      if (this.phantomAnswers && random() < 0.02) {
        push();
        fill(255, random(20, 80));
        text(
          labelText.replace(/[A-D]\)/, ""),
          b.x + 15 + random(-30, 30),
          b.y + b.h / 2 + random(-60, 60)
        );
        pop();
      }
    }

    // GHOST TRANSMISSION
    if (random() < 0.015) {
      textSize(16);
      fill(255, random(40, 120));
      textAlign(CENTER, CENTER);
      text(
        "UNRESOLVED SIGNAL",
        width / 2 + random(-50, 50),
        random(height * 0.2, height * 0.8)
      );
    }

    // OPERATOR TAG
    textSize(12);
    fill(255, 40);
    textAlign(LEFT, BOTTOM);
    text("OPERATOR CODE: 7F-Δ / ACTIVE SESSION", 20, height - 20);

    if (random() < 0.0007) {
      noStroke();
      fill(255, random(120, 220));
      rect(0, 0, width, height);
    }
  }

// STUFF SURROUNDING CLICKS ETC, RELATES TO THE BUTTON STUFF
  checkClick(x, y) {
    if (!this.qWriter.isDone()) return;
    if (this.fadingOut) return;
    if (!this.buttons || this.buttons.length === 0) return;

    for (let i = 0; i < this.buttons.length; i++) {
      let b = this.buttons[i];

      let inside = x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h;

      if (inside) {
        this.selected = i;

        if (this.beepSound) this.beepSound.play();

        this.wasCorrect = i === this.correctIndex;

        // ✅ NEW: record time; update() handles the delay deterministically
        if (!this.holdTimerStarted) {
          this.holdTimerStarted = true;
          this.selectionTime = millis();
        }

        break;
      }
    }
  }
// THE VHS EFFECTS AGAIN !
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
}
