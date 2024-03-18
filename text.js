class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

$(document).ready(function () {
  $(".text").each(function () {
    const phrases = $(this).data("phrases").split(",");
    const fx = new TextScramble(this);

    // Hide the text initially
    $(this).css({
      visibility: "hidden",
      border: "1px solid #ccc",
      padding: "10px",
    });

    let animationRunning = false; // Track if animation is running

    $(this).hover(
      function () {
        if (!animationRunning) {
          // Check if animation is not running
          let counter = 0;
          const next = () => {
            // Hide the text immediately when animation starts for new text
            $(this).css("visibility", "hidden");
            fx.setText(phrases[counter]).then(() => {
              setTimeout(next, 1200);
            });
            counter = (counter + 1) % phrases.length;
          };
          next();
          $(this).css("cursor", "pointer"); // Change cursor style on hover
          animationRunning = true; // Set animation to running
        }
        // Show the text on hover
        $(this).css("visibility", "visible");
      },
      function () {
        // Immediately hide the text when mouse hovers away
        $(this).css("visibility", "hidden");
        animationRunning = false; // Reset animation status
      },
    );
  });
});
