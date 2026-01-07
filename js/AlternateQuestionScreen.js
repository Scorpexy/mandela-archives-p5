// THIS CLASS CONTROLS MODULE 4, WHERE YOU DECIDE IF THE SHOWN ENTIIY IS A HUMAN OR AN ALTERNATE (SKINWALKER TYPE THING), DECIDED THIS AS A SEPARATE CLASS DUE TO HOW DRASTICALLY DIFFERENT THIS SECTION WAS FROM THE FIRST THREE, PROCESS WHICH OCCURS IS AN IMAGE IS SHOWN ON THE SCREEN, WHERE THE SCREEN HAS THE WHOLE VHS FILTER AND SUCH, USER HAS TWO BUTTONS "NORMAL", "ALTERNATE". USER DECIDES IF ENTITY IS EITHER ONE BY PRESING THE RESPECTIVE BUTTON

class AlternateQuestionScreen extends Screen {
  // INHERITANCE EXAMPLE YET AGAIN
  constructor(index, font, beepSound, imageData) {
    super();
    this.index = index; // 1, 2, OR 3, RELATING TO IMAGE NAME

    this.font = font;
    this.beepSound = beepSound;

    // THE RESPECTVE IMAGE PATH IS BEING CHOSEN
  

    this.done = false;
    this.wasCorrect = false;
    this.fade = 0;
    this.fadingOut = false;

    // TYPEWRITER FODDER
    this.prompt = new Typewriter("M4Q" + index + ". Identify the subject:", 28);

    // CREATES THE BUTTONS FOR THE USER TO PRESS
    this.buttons = [
      { label: "NORMAL", x: 150, y: 460, w: 200, h: 70, value: "normal" },
      { label: "ALTERNATE", x: 450, y: 460, w: 200, h: 70, value: "alternate" },
    ];
  }

  update() {
    if (!this.fadingOut && this.fade < 255) this.fade += 8;
    if (this.fadingOut) {
      this.fade -= 12;
      if (this.fade <= 0) this.done = true;
    }

    this.prompt.update();
  }

  display() {
    background(5);
    this.drawScanlines(); // ACTIVATES THE RESPECTIVE PROCEDURES AT BOTTOM OF CLASS
    this.drawStatic();
    this.drawVignette();
    textFont(this.font);

    fill(255, this.fade);
    textSize(26);
    textAlign(LEFT, TOP);
    text(this.prompt.getText(), 40, 40);

    // THIS PLACES THE IMAGE ON SCREEN, SEE THE IMAGES IN FILES
    if (this.img) {
      push();
      translate(width / 2, height / 2 - 30);
      imageMode(CENTER);

      // ADDS THE SUBTLE HORROR JITTER I REFERENCED IN SUCCESS CRITERIA 1
      translate(random(-1, 1), random(-1, 1));

      image(this.img, 0, 0, 350, 350);
      pop();
    }

    // CREATES THE BUTTONS AND THEIR CHARACTERISTICS
    for (let b of this.buttons) {
      stroke(255, this.fade);
      noFill();
      rect(b.x, b.y, b.w, b.h, 6);

      noStroke();
      fill(255, this.fade);
      textSize(22);
      textAlign(CENTER, CENTER);
      text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }
  }

  checkClick(mx, my) {
    // REGISTERS THE CLICK ON EITHER BUTTON, REUSED CODE FROM OTHER CLASSES
    if (this.fadingOut || !this.prompt.isDone()) return;

    for (let b of this.buttons) {
      if (mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h) {
        if (this.beepSound) this.beepSound.play();

        let guessAlt = b.value === "alternate";
        this.wasCorrect = guessAlt === this.isAlternate;

        this.fadingOut = true;
        return;
      }
    }
  }

  // REDONE CRT AFFECTS, NOTHING SPECIAL
  drawScanlines() {
    stroke(200, 200, 200, 60);
    let off = frameCount % 4;
    for (let y = 0; y < height; y += 4) {
      line(0, y + off, width, y + off);
    }
  }

  drawStatic() {
    stroke(255, 25);
    for (let i = 0; i < 300; i++) point(random(width), random(height));
  }

  drawVignette() {
    noStroke();
    for (let i = 0; i < 120; i++) {
      fill(0, map(i, 0, 119, 120, 0));
      rect(i, 0, 1, height);
      rect(width - 1 - i, 0, 1, height);
    }
  }
}
