// THIS IS THE TYPEWRITE CLASS, IT ESSENTIALLY WAS ADDED BECAUSE I THOUGHT
// THE QUESTIONS WERE A BIT DULL, JUST ADDS A MORE CRUDE AND HOMEMADE FEEL
// TO THE VHS TAPE, ALMOST AS IF ITS NOT AN OFFICIAL TAPE.

const TYPE_SPEED_MULTIPLIER = 1.5; 
// CONTROLS THE TYPING SPEED, NORMALLY 1.0, BUT TRYING TO SEE A CHANGE
// IN MODULE 5 AND GOING THROUGH ALL WAS A PAIN

class Typewriter {
  constructor(text, charDelay = 35) {
    this.full = (text ?? "").toString(); // THIS MAKES SURE TEXT IS ALWAYS A STRING
    this.current = "";                  
    this.charDelay = charDelay * TYPE_SPEED_MULTIPLIER;

    this.index = 0;
    this.lastTime = millis();
    this.done = false;
  }

  update() {
    if (this.done) return;

    let now = millis();

    while (now - this.lastTime >= this.charDelay && !this.done) {
      this.current += this.full[this.index] || "";
      this.index++;
      this.lastTime += this.charDelay;

      if (this.index >= this.full.length) {
        this.done = true;
      }
    }
  }

  getText() {
    return this.current; 
  }

  isDone() {
    return this.done;
  }
}
