// ATMOSPHERE-SETTING SCREEN WHICH IS MEANT TO INTRODUCE THE CONTROLLED PACING BEFORE THE ACTUAL GAMEPLAY BEGINS, AUTOMATICALLY STARTS THE AUDIO TTRACK AND PREVENTS PROGRESSION UNTIL THE AUDIO FINISHED PLAYING, SUBTLE CRT-STYLE JITTER TO ESTABLISH TONE ETC ETC, SCREEN MARKS ITSELF AS FINISHED AND HANDS CONTROL BACK TO MAIN FLOW, USED AS A CINEMATIC ENTRY POINT RATHER THAN A GAMEPLAY ELEMENT

class ModuleIntroScreen extends Screen {
  constructor(title, subtitle, font, audio) { // STANDARD CONSTRUCTOR THINGS
    super();
    this.title = title;
    this.subtitle = subtitle;
    this.font = font;
    this.audio = audio;

    this.started = false;
    this.done = false;
  }

  update() {
    // THIS STARTS THE AUDIO
    if (!this.started) {
      this.started = true;
      if (this.audio && !this.audio.isPlaying()) {
        this.audio.play();
      }
    }

    // ALLOWS THE PROGRESSION OF THE GAME ONCE THE AUDIO HAS FINISHED
    if (this.started && this.audio && !this.audio.isPlaying()) {
      this.done = true;
    }
  }

  display() {
    background(0);
    textFont(this.font);

    // THIS ADDS THE SCARY CRT JITTER USING TRANSLATIONS (WOO SCARY)
    translate(random(-0.6, 0.6), random(-0.6, 0.6));

    textAlign(CENTER, CENTER);
    fill(200, 40, 40);

    textSize(26);
    text(this.title, width / 2, height / 2 - 40);

    textSize(16);
    text(this.subtitle, width / 2, height / 2 + 20);
  }
}
