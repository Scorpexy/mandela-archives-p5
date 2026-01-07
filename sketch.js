

// THIS IS REALLY THE GLOBAL GAME CONTROLLER, HANDLES ASSET LOADING AND ALL OF THAT ANYWAY, HAS THE PROGRESSION THROUGH ALL THE MODULES, DECIDES WHEN TO SPAWN QUESTIONS AND HIDDEN EVENTS. AND FINALLY MAKES SURE TO RESETS STATE AFGTER THE FINALE.


// GENERAL VARIABLE ASSIGNMENT
let ocrFont;
let currentScreen;
let loadingSound;
let ambience;
let correctBeep;
let knockSound;
let moduleAudio = {};

// DEBUG MENU STUFF
let DEV_MODE = true; // MAKE SURE TO TURN OFF FOR FINAL BUILD
let debugOverlay = false;

// THESE 3 BLOCKS CONTROL STATES AND SCORES AND SUCH
let module1Score = 0,
  module1Total = 4;
let module2Score = 0,
  module2Total = 4;
let module3Score = 0,
  module3Total = 4;
let module4Score = 0,
  module4Total = 3;

let interruptActive = false;
let interruptHasHappened = false;

let interruptStartTime = 0;
let interruptRevealDelay = 1000;

// VHS FREEZE
let freezeUntil = 0;

// CONTROLS A REPLICA WHICH APPEARS SUBTLY WHEN ANSWER IS INCORRECT
let replicaActive = false;
let replicaTimer = 0;
let replicaDuration = 30;

// THIS IS JUST THE IMAGES USED IN MODULE 4
let module4Pool = [
  { file: "norm1.png", alt: false },
  { file: "norm2.png", alt: false },
  { file: "norm3.png", alt: false },
  { file: "alt1.png", alt: true },
  { file: "alt2.png", alt: true },
  { file: "alt3.png", alt: true },
];

let module4Selection = [];
let module4Index = 0;

function preload() {
  // OTHER MIXED SOUNDS I.E. JUMPSCARES AND SUCH
  ocrFont = loadFont("OCRAEXT.TTF");
  ambience = loadSound("ambience.mp3");
  loadingSound = loadSound("loading.mp3");
  correctBeep = loadSound("beep.mp3");
  knockSound = loadSound("knock.mp3");

  // THESE SOUNDS ARE FOR THE MODULE INTRO NARRATION
  moduleAudio[1] = loadSound("M1Q.mp3");
  moduleAudio[2] = loadSound("M2Q.mp3");
  moduleAudio[3] = loadSound("M3Q.mp3");
  moduleAudio[4] = loadSound("M4Q.mp3");
  moduleAudio[5] = loadSound("M5Q.mp3");
}

function setup() {
  createCanvas(800, 600);
  currentScreen = new TitleScreen(ocrFont, loadingSound);

  ambience.setLoop(true);
  ambience.setVolume(0.7);
  ambience.play();
}

function keyPressed() {
  // THIS CONTROLS THE DEV MODE I ADDED, SO I COULD INDIVIDUALLY TEST MODULES BY JUMPING TO THEM, RATHER THAN GOING THROUGH THE WHOLE GAME AGAIN

  if (!DEV_MODE) return;

  if (key === "1")
    currentScreen = new TransitionScreen(
      "MODULE 1 — CONFIRM THE CALLER",
      "DEBUG JUMP",
      ocrFont,
      1
    );

  if (key === "2")
    currentScreen = new TransitionScreen(
      "MODULE 2 — ANOMALY RECOGNITION",
      "DEBUG JUMP",
      ocrFont,
      true,
      2
    );

  if (key === "3")
    currentScreen = new TransitionScreen(
      "MODULE 3 — CALLER CONTAINMENT",
      "DEBUG JUMP",
      ocrFont,
      3
    );

  if (key === "4")
    currentScreen = new TransitionScreen(
      "MODULE 4 — VISUAL VERIFICATION",
      "DEBUG JUMP",
      ocrFont,
      4
    );
  if (key === "5")
    currentScreen = new TransitionScreen(
      "MODULE 5 — FINAL ASSESSMENT",
      "DEBUG JUMP",
      ocrFont,
      5
    );

  // MORE DEV MODE STUFF, ALLOWED ME TO SKIP THE LONG-WINDED M5
  if (DEV_MODE && currentScreen instanceof ModuleFiveScreen) {
    if (key === "P") currentScreen.changePhase("LOGGING");
    if (key === "T") currentScreen.changePhase("TAUNT");
    if (key === "B") currentScreen.changePhase("BUTTON");
    if (key === "V") currentScreen.changePhase("VERDICT");
  }
}

function mousePressed() {
  if (interruptActive) return;
  if (currentScreen.checkClick) currentScreen.checkClick(mouseX, mouseY);
}

function draw() {
  if (millis() < freezeUntil) return;
  if (random() < 0.001) freezeUntil = millis() + random(300, 600);

  if (interruptActive) {
    drawInterruptScreen();
    if (!knockSound.isPlaying()) endInterrupt();
    return;
  }

  currentScreen.update();
  currentScreen.display();

  // ================= MODULE 1 =================

  if (currentScreen.finished && currentScreen instanceof TitleScreen) {
    currentScreen = new TransitionScreen(
      "MODULE 1 — CONFIRM THE CALLER",
      "Do not acknowledge imitation attempts.",
      ocrFont,
      1
    );
    return;
  }

  if (transitionIs("MODULE 1 — CONFIRM THE CALLER")) {
    currentScreen = new QuestionScreen(
      "M1Q1. What’s the first thing you must confirm when receiving a call?",
      [
        "A) The caller’s phone number",
        "B) The caller’s name",
        "C) The caller’s location",
        "D) The caller’s reason for calling",
      ],
      1,
      ocrFont,
      correctBeep
    );
    return;
  }

  if (doneQ("M1Q1")) {
    if (currentScreen.wasCorrect) module1Score++;
    nextQ(
      "M1Q2. How do you confirm the caller’s identity?",
      [
        "A) Ask for their full name",
        "B) Request badge number",
        "C) Call-sign verification",
        "D) Ask who their supervisor is",
      ],
      2
    );
    return;
  }

  if (doneQ("M1Q2")) {
    if (currentScreen.wasCorrect) module1Score++;
    nextQ(
      "M1Q3. Which behaviour most suggests a potential impersonator?",
      [
        "A) Speaking quietly",
        "B) Rushing the conversation",
        "C) Asking for repeated clarifications",
        "D) Providing inconsistent identifiers",
      ],
      3
    );
    return;
  }

  if (doneQ("M1Q3")) {
    if (currentScreen.wasCorrect) module1Score++;
    nextQ(
      "M1Q4. If caller identity remains uncertain, what is the correct action?",
      [
        "A) Terminate",
        "B) Request secondary authentication",
        "C) Ask for personal details",
        "D) Transfer the call",
      ],
      1
    );
    return;
  }

  if (doneQ("M1Q4")) {
    if (currentScreen.wasCorrect) module1Score++;
    let passed = module1Score > module1Total * 0.6;

    currentScreen = new TransitionScreen(
      "MODULE 1 COMPLETE",
      passed
        ? `PASSED — ${module1Score}/${module1Total}`
        : `FAILED — ${module1Score}/${module1Total}`,
      ocrFont
    );
    return;
  }

  // ================= MODULE 2 =================

  if (transitionIs("MODULE 1 COMPLETE")) {
    module1Score = 0;
    currentScreen = new TransitionScreen(
      "MODULE 2 — ANOMALY RECOGNITION",
      "Document irregularities. Stay alert.",
      ocrFont,
      true,
      2
    );
    return;
  }

  if (transitionIs("MODULE 2 — ANOMALY RECOGNITION")) {
    nextQ(
      "M2Q1. Which factor is MOST likely to indicate an emerging anomaly?",
      [
        "A) Environmental noise decreasing",
        "B) Caller breathing rate increasing",
        "C) Equipment interference stabilising",
        "D) Reports matching prior incidents",
      ],
      0
    );
    return;
  }

  if (doneQ("M2Q1")) {
    if (currentScreen.wasCorrect) module2Score++;
    nextQ(
      "M2Q2. A caller repeats the same phrase with identical timing. What is this?",
      [
        "A) Emotional shock",
        "B) Cognitive looping",
        "C) External manipulation",
        "D) Audio compression",
      ],
      2
    );
    return;
  }

  if (doneQ("M2Q2")) {
    if (currentScreen.wasCorrect) module2Score++;
    nextQ(
      "M2Q3. When assessing distortion, what detail matters MOST?",
      [
        "A) Volume consistency",
        "B) Identifiable peaks",
        "C) Pattern repetition intervals",
        "D) Warm background frequencies",
      ],
      2
    );
    return;
  }

  if (doneQ("M2Q3")) {
    if (currentScreen.wasCorrect) module2Score++;
    nextQ(
      "M2Q4. A second voice repeats with ~0.3s delay. Procedure?",
      [
        "A) Ignore",
        "B) Slow caller",
        "C) Terminate",
        "D) Activate protocol Δ-4",
      ],
      3
    );
    return;
  }

  if (doneQ("M2Q4")) {
    if (currentScreen.wasCorrect) module2Score++;
    let passed = module2Score > module2Total * 0.6;

    currentScreen = new TransitionScreen(
      "MODULE 2 COMPLETE",
      passed
        ? `PASSED — ${module2Score}/${module2Total}`
        : `FAILED — ${module2Score}/${module2Total}`,
      ocrFont,
      true
    );
    return;
  }

  // ================= MODULE 3 =================

  if (transitionIs("MODULE 2 COMPLETE")) {
    module2Score = 0;
    currentScreen = new TransitionScreen(
      "MODULE 3 — CALLER CONTAINMENT",
      "Maintain control. Do not respond to imitation.",
      ocrFont,
      3
    );
    return;
  }

  if (transitionIs("MODULE 3 — CALLER CONTAINMENT")) {
    nextQ(
      "M3Q1. What is the FIRST sign containment may be failing?",
      [
        "A) Background noise rising",
        "B) Caller hesitation increasing",
        "C) Line latency decreasing",
        "D) Operator discomfort",
      ],
      2
    );
    return;
  }

  if (doneQ("M3Q1")) {
    if (currentScreen.wasCorrect) module3Score++;
    nextQ(
      "M3Q2. Caller begins mirroring YOUR speech. Action?",
      [
        "A) Terminate",
        "B) Observe timing",
        "C) Increase verification prompts",
        "D) Lower sensitivity",
      ],
      2
    );
    return;
  }

  if (doneQ("M3Q2") && !interruptHasHappened) {
    if (currentScreen.wasCorrect) module3Score++;
    interruptHasHappened = true;
    triggerInterrupt();
    return;
  }

  if (doneQ("M3Q3")) {
    if (currentScreen.wasCorrect) module3Score++;
    nextQ(
      "M3Q4. Final step when breach is confirmed:",
      [
        "A) Disconnect",
        "B) Switch operator",
        "C) Follow protocol E-9",
        "D) Reassure caller",
      ],
      2
    );
    return;
  }

  if (doneQ("M3Q4")) {
    if (currentScreen.wasCorrect) module3Score++;
    let passed = module3Score > module3Total * 0.6;

    currentScreen = new TransitionScreen(
      "MODULE 3 COMPLETE",
      passed
        ? `PASSED — ${module3Score}/${module3Total}`
        : `FAILED — ${module3Score}/${module3Total}`,
      ocrFont
    );
    return;
  }

  // ================= MODULE 4 =================

  if (transitionIs("MODULE 3 COMPLETE")) {
    module4Selection = shuffle([...module4Pool]).slice(0, 3);
    module4Index = 0;
    module4Score = 0;

    currentScreen = new TransitionScreen(
      "MODULE 4 — VISUAL VERIFICATION",
      "Determine whether the subject is NORMAL or an ALTERNATE.",
      ocrFont,
      4
    );
    return;
  }

  if (transitionIs("MODULE 4 — VISUAL VERIFICATION")) {
    currentScreen = new AlternateQuestionScreen(
      module4Index,
      ocrFont,
      correctBeep,
      module4Selection[module4Index]
    );

    return;
  }

  if (currentScreen.done && currentScreen instanceof AlternateQuestionScreen) {
    if (currentScreen.wasCorrect) module4Score++;

    module4Index++;

    if (module4Index < 3) {
      currentScreen = new AlternateQuestionScreen(
        module4Index,
        ocrFont,
        correctBeep,
        module4Selection[module4Index]
      );
    } else {
      currentScreen = new TransitionScreen(
        "MODULE -1 — UNAUTHORISED ACCESS",
        "Identity verification required.",
        ocrFont
      );
      currentScreen.isModuleMinusOneIntro = true;
    }
    return;
  }

  // ================= MODULE -1 =================  (MIGHT SCRAP???)

  if (
    currentScreen.done &&
    currentScreen instanceof TransitionScreen &&
    currentScreen.isModuleMinusOneIntro
  ) {
    currentScreen = new ModuleMinusOne(ocrFont);
    return;
  }

  // ================= MODULE 5 =================

  if (currentScreen.done && currentScreen instanceof ModuleMinusOne) {
    currentScreen = new TransitionScreen(
      "MODULE 5 — FINAL ASSESSMENT",
      "WHO ARE YOU?",
      ocrFont,
      5

    );
    return;
  }

  if (transitionIs("MODULE 5 — FINAL ASSESSMENT")) {
    currentScreen = new ModuleFiveScreen(ocrFont);
    return;
  }

  if (currentScreen.done && currentScreen instanceof ModuleFiveScreen) {
    // THIS PART RESETS THE GAME AFTER THE END OF M5 (FINALE), I.E. RESETING SCORES ETC
    ambience.stop();

    module1Score = 0;
    module2Score = 0;
    module3Score = 0;
    module4Score = 0;

    interruptActive = false;
    interruptHasHappened = false;
    freezeUntil = 0;
    replicaActive = false;

    currentScreen = new TitleScreen(ocrFont, loadingSound);

    ambience.setLoop(true);
    ambience.setVolume(0.7);
    ambience.play();
    return;
  }
}

// THESE ARE A SERIES OF HELPERS, WHICH HELP GAME PROGRESS QUESTIONS, EASIER AND MORE EFFIENTLY

function nextQ(text, answers, correct) {
  currentScreen = new QuestionScreen(
    text,
    answers,
    correct,
    ocrFont,
    correctBeep
  );
}

function doneQ(prefix) {
  return (
    currentScreen.done &&
    currentScreen instanceof QuestionScreen &&
    currentScreen.questionText.startsWith(prefix)
  );
}

function transitionIs(name) {
  return (
    currentScreen.done &&
    currentScreen instanceof TransitionScreen &&
    currentScreen.title === name
  );
}

// CONTROLS THE SPOOKY INTERRUPT AFTER M3Q2

function triggerInterrupt() {
  interruptActive = true;
  interruptStartTime = millis();
  knockSound.play();
}

function endInterrupt() {
  interruptActive = false;

  currentScreen = new QuestionScreen(
    "M3Q3. Which behaviour confirms containment breach?",
    [
      "A) Caller goes silent",
      "B) Caller asks unrelated questions",
      "C) Voice shifts pitch mid-sentence",
      "D) Breathing becomes irregular",
    ],
    2,
    ocrFont,
    correctBeep
  );
}

function drawInterruptScreen() {
  // THE GUTS OF THE JUMPSCARE, JUST PROPERTIES MOSTLY, AND THE JITTERING RED SCANLINES, TEXT ETC
  currentScreen.display();

  push();
  blendMode(ADD);
  stroke(255, 20);
  for (let i = 0; i < height; i += 4) {
    line(0, i + random(-1, 1), width, i + random(-1, 1));
  }
  pop();

  fill(0, 150);
  rect(0, 0, width, height);

  textFont(ocrFont);
  textAlign(CENTER, CENTER);
  textSize(48);

  let elapsed = millis() - interruptStartTime;

  if (elapsed >= interruptRevealDelay) {
    fill(255, 0, 0, random(180, 255));
    text(
      "OPEN THE DOOR",
      width / 2 + random(-4, 4),
      height / 2 + random(-4, 4)
    );
  }

  if (elapsed >= interruptRevealDelay) {
    for (let i = 0; i < 3; i++) {
      fill(255, 0, 0, random(30, 120));
      rect(0, random(height), width, random(2, 6));
    }
  }
}
