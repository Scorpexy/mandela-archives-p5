// FINAL SCREEN DESIGNED TO UNSETTLEMTHE PLAYER BY REMOVING INPUT, AND HAVING A SERIES OF TIMED PHASES (WAIT, BLACKOUT, TAUNT ETC), EACH DELIBERATLY CONSTRUCTED TO INCREASE TENSION. MOUSE MOVEMENT IS TRACKED BEHIND THE SCENES, USING THAT BEHAVIOR TO TRIGGER FLASH MESSAGES, CREATES ILLUSION THAT THE SYSTEM IS WATCHING OR INTERPRETING THE PLAYER.

class ModuleFiveScreen extends Screen {
  constructor(font) {
    super();
    this.font = font;
    this.phase = "WAIT";
    this.phaseStart = millis();

    this.done = false;

    // THIS PART CONTROLS BUTTON GEOMETRY 
    this.buttonX = width / 2 - 160;
    this.buttonY = height / 2 + 100;
    this.buttonW = 320;
    this.buttonH = 60;

    // NEXT FEW VARS ARE FOR MOUSE TRACKING, FOR THE PERSONALISED MESSAGES
    this.clicks = 0;
    this.totalMouseDist = 0;
    this.lastMouseX = mouseX;
    this.lastMouseY = mouseY;
    this.lastMoveTime = millis();


    this.motorMsgShown = false;
    this.stillMsgShown = false;


    this.flashMessage = "";
    this.flashUntil = 0;

    // HERE ARE A FEW TAUNTING MESSAGES I WAS ABLE TO COME UP WITH
    this.tauntLines = [
      "YOU ARE NO LONGER BEING TESTED.",
      "YOU WERE FLAGGED EARLY.",
      "THE REMAINDER WAS FOR OBSERVATION.",
      "MOST SUBJECTS DON'T WAIT THIS LONG.",
      "YOU ARE NOT LIKE THE OTHERS."
    ];
    this.visibleTauntLines = 0;
    this.tauntLineTimer = 0;


    this.verdictMainShown = false;
    this.verdictSubShown = false;
    this.verdictMainTime = 0;


    this.blackoutStart = 0;
  }


  phaseTime() {
    return millis() - this.phaseStart;
  }

  changePhase(next) {
    this.phase = next;
    this.phaseStart = millis();

    // Phase init logic
    if (next === "TAUNT") {
      this.visibleTauntLines = 1;
      this.tauntLineTimer = millis();
    }
    if (next === "VERDICT") {
      this.verdictMainShown = false;
      this.verdictSubShown = false;
      this.verdictMainTime = 0;
    }
    if (next === "BLACKOUT") {
      this.blackoutStart = millis();
    }
  }

  update() {
    const now = millis();

    // THIS BIT TRACKS THE MOUSE MOVEMENT FOR THE SCARY MESSAGE FLASHING, SCARING VIEWER AGAIN
    let dx = mouseX - this.lastMouseX;
    let dy = mouseY - this.lastMouseY;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0.5) {
      this.totalMouseDist += dist;
      this.lastMoveTime = now;
      this.lastMouseX = mouseX;
      this.lastMouseY = mouseY;
    }


    if (this.flashMessage && now > this.flashUntil) {
      this.flashMessage = "";
    }


    if (typeof ambience !== "undefined" && ambience.isLoaded && ambience.isLoaded()) {
      if (this.phase === "TAUNT" || this.phase === "BUTTON" || this.phase === "VERDICT") {
        let t = this.phaseTime();

        let fade = constrain(0.7 - (t / 30000) * 0.6, 0.1, 0.7);
        ambience.setVolume(fade);
      }
    }

// THIS IS THE GENERAL LOGIC FOR THE PHASES
    if (this.phase === "WAIT") {
      this.updateWait();
    } else if (this.phase === "LOGGING") {
      this.updateLogging();
    } else if (this.phase === "TAUNT") {
      this.updateTaunt();
    } else if (this.phase === "BUTTON") {
      this.updateButton();
    } else if (this.phase === "VERDICT") {
      this.updateVerdict();
    } else if (this.phase === "BLACKOUT") {
      this.updateBlackout();
    }
  }

// THIS PART MAY SEEM MENIAL, BUT IT BUILDS TENSION// FAKES A SENSE OF SECURITY IN USER
  updateWait() {
    // Long boring wait, nothing seems to happen
    const T_WAIT = 30000; // 30s
    if (this.phaseTime() > T_WAIT) {
      this.changePhase("LOGGING");
    }
  }


   updateLogging() {
  const now = millis();          
  const t = this.phaseTime();

  if (!this.motorMsgShown && t > 5000 && this.totalMouseDist > 400) {
    this.setFlash("MOTOR ANXIETY DETECTED.");
    this.motorMsgShown = true;
  }

  if (!this.stillMsgShown && now - this.lastMoveTime > 8000) {
    this.setFlash("…DON'T DO THAT.");
    this.stillMsgShown = true;
  }

  const T_LOGGING = 40000;
  if (t > T_LOGGING) {
    this.changePhase("TAUNT");
  }
}


  // FOLLOWING PARTS CONTROL THE TAUNTING OF THE USER, LIKE THAT ENTITY IS HUNTING USER
  updateTaunt() {
    const now = millis();
    const t = this.phaseTime();


    if (this.visibleTauntLines < this.tauntLines.length) {
      if (now - this.tauntLineTimer > 6000) { // every 6s
        this.visibleTauntLines++;
        this.tauntLineTimer = now;
      }
    }

    if (!this.stillMsgShown && now - this.lastMoveTime > 10000) {
      this.setFlash("I CAN STILL SEE YOU.");
      this.stillMsgShown = true;
    }

    // Move on
    const T_TAUNT = 45000; // 45s
    if (t > T_TAUNT) {
      this.changePhase("BUTTON");
    }
  }


  updateButton() {
    const t = this.phaseTime();

    // After a while, whether they click or not, move to verdict
    const T_BUTTON = 30000; // 30s
    if (t > T_BUTTON) {
      this.changePhase("VERDICT");
    }
  }


  updateVerdict() {
    const now = millis();
    const t = this.phaseTime();

    if (!this.verdictMainShown && t > 4000) {
      this.verdictMainShown = true;
      this.verdictMainTime = now;
    }

    if (this.verdictMainShown && !this.verdictSubShown && now - this.verdictMainTime > 7000) {
      this.verdictSubShown = true;
    }

    const T_VERDICT = 25000; // 25s
    if (t > T_VERDICT) {
      this.changePhase("BLACKOUT");
    }
  }


  updateBlackout() {
    const t = this.phaseTime();

   
    const T_BLACK = 4000; // 4s
    if (t > T_BLACK) {
      this.done = true; 
    }
  }

  setFlash(msg, duration = 1200) {
    this.flashMessage = msg;
    this.flashUntil = millis() + duration;
  }

// THIS IS THE MAIN DISPLAY PART
  display() {
    background(0);
    textFont(this.font);

    // CONTROLS THE VHS//CRT JITTER I ALWAYS GO ON ABOUT . . .
    translate(random(-0.6, 0.6), random(-0.6, 0.6));

    if (this.phase === "WAIT") {
      this.displayWait();
    } else if (this.phase === "LOGGING") {
      this.displayLogging();
    } else if (this.phase === "TAUNT") {
      this.displayTaunt();
    } else if (this.phase === "BUTTON") {
      this.displayButton();
    } else if (this.phase === "VERDICT") {
      this.displayVerdict();
    } else if (this.phase === "BLACKOUT") {
      this.displayBlackout();
    }

    // Tiny one-frame micro text sometimes, in later phases
    if (this.phase === "TAUNT" || this.phase === "BUTTON") {
      if (random() < 0.004) {
        push();
        textAlign(LEFT, TOP);
        textSize(10);
        fill(200, 40, 40, 120);
        text("DON'T LOOK FOR ME.", random(20, width - 100), random(20, height - 40));
        pop();
      }
    }

// SCANLINES AND SUCH
    this.drawScanlines();


    if (this.flashMessage) {
      push();
      resetMatrix();
      textAlign(CENTER, CENTER);
      textSize(18);
      fill(200, 40, 40, 220);
      text(this.flashMessage, width / 2, height - 80);
      pop();
    }
  }


  displayWait() {
    textAlign(CENTER, TOP);
    textSize(16);
    fill(200, 40, 40, 180);
    text("CONTAINMENT FAILURE — MODULE 5", width / 2, 40);

    const t = this.phaseTime();

    textAlign(CENTER, CENTER);
    textSize(18);

    if (t > 5000) {
      text("STANDBY.", width / 2, height / 2 - 40);
    }
    if (t > 15000) {
      text("WAIT FOR INSTRUCTION.", width / 2, height / 2 + 5);
    }
    if (t > 25000) {
      text("DO NOT INTERRUPT.", width / 2, height / 2 + 50);
    }
  }


  displayLogging() {
    // Header
    textAlign(CENTER, TOP);
    textSize(16);
    fill(200, 40, 40, 180);
    text("OBSERVATION IN PROGRESS", width / 2, 40);

    textAlign(CENTER, CENTER);
    textSize(18);
    fill(200, 40, 40, 200);
    text("REMAIN STILL.", width / 2, height / 2 - 30);
    text("INPUT IS NOT REQUIRED.", width / 2, height / 2 + 10);
  }

  //CONTROLS THE TAUNTING PART OF M5
  displayTaunt() {

    textAlign(CENTER, TOP);
    textSize(16);
    fill(200, 40, 40, 180);
    text("REVIEWING COMPLIANCE", width / 2, 40);

    textAlign(CENTER, CENTER);
    textSize(20);
    fill(200, 40, 40, 230);

    let baseY = height / 2 - 70; 
    for (let i = 0; i < this.visibleTauntLines; i++) {
      text(this.tauntLines[i], width / 2, baseY + i * 34);
    }
  }


  displayButton() {
    // Header
    textAlign(CENTER, TOP);
    textSize(16);
    fill(200, 40, 40, 180);
    text("TERMINATION REQUEST CHANNEL", width / 2, 40);

  
    textAlign(CENTER, CENTER);
    textSize(18);
    fill(200, 40, 40, 220);
    text("YOU MAY REQUEST TO END THIS LINE.", width / 2, height / 2 - 60);

    // Button
    let hovering =
      mouseX > this.buttonX &&
      mouseX < this.buttonX + this.buttonW &&
      mouseY > this.buttonY &&
      mouseY < this.buttonY + this.buttonH;

    stroke(200, 40, 40);
    noFill();
    rect(this.buttonX, this.buttonY, this.buttonW, this.buttonH);

    textAlign(CENTER, CENTER);
    textSize(18);

    let label = "[ REQUEST TERMINATION ]";


    if (hovering && random() < 0.3) {
      label = "[ STAY ]";
    } else if (hovering && random() < 0.3) {
      label = "[ REQUEST DENIED ]";
    }

    fill(200, 40, 40, 230);
    text(label, width / 2, this.buttonY + this.buttonH / 2);
  }

  // THE VERDICT PART OF M5
  displayVerdict() {
    textAlign(CENTER, TOP);
    textSize(16);
    fill(200, 40, 40, 180);
    text("FINAL DETERMINATION", width / 2, 40);

    textAlign(CENTER, CENTER);
    textSize(22);

    if (this.verdictMainShown) {
      fill(200, 40, 40, 240);
      text("YOU STOPPED WHEN YOU WERE SUPPOSED TO.", width / 2, height / 2 - 10);
    }

    if (this.verdictSubShown) {
      textSize(18);
      fill(200, 40, 40, 220);
      text("THANK YOU FOR NOT MOVING.", width / 2, height / 2 + 40);
    }
  }

// THIS CONTROLS THE "BLACKOUT" PORTION OF THE MODULE
  displayBlackout() {
    resetMatrix();
    background(0);

    push();
    stroke(255, 12);
    for (let y = 0; y < height; y += 4) {
      line(0, y, width, y);
    }
    pop();

    // THIS PART ADDS A SMALL RED PRESENCE NEAR THE CENTRE
    let t = this.phaseTime();
    if (t > 1000) {
      let offsetX = random(-8, 8);
      let offsetY = random(-8, 8);
      noStroke();
      fill(200, 40, 40, 140);
      circle(width / 2 + offsetX, height / 2 + offsetY, 2);
    }
  }

  drawScanlines() {
    push();
    stroke(255, 15);
    for (let y = 0; y < height; y += 4) {
      let offset = sin(y * 0.02) * 1.5;
      line(-offset, y, width + offset, y);
    }
    pop();
  }

  checkClick(x, y) {
    this.clicks++;

    if (this.phase === "WAIT") {
      return;
    }

    if (this.phase === "LOGGING") {
      // Impulsive
      this.setFlash("IMPULSIVE RESPONSE LOGGED.");
      return;
    }

    if (this.phase === "TAUNT") {
      // THIS MEANS CLICKING JUST ACTIVATES THIS, TAUNTING USER
      this.setFlash("INPUT IS NO LONGER RELEVANT.");
      return;
    }

    if (this.phase === "BUTTON") {

      if (random() < 0.4) return;

      let inside =
        x > this.buttonX &&
        x < this.buttonX + this.buttonW &&
        y > this.buttonY &&
        y < this.buttonY + this.buttonH;

      if (inside) {
        // THIS ADDS A FREEZE, SO IT IGNORES CLICKS AND SUCH
        this.setFlash("REQUEST ACKNOWLEDGED.\nDENIED.", 1600);
      }
    }

    
  }
}
