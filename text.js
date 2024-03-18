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

    // Initialize animationRunning to false outside of hover function
    let animationRunning = false;
    let timeoutId; // Store the timeout ID

    $(this).hover(
      function () {
        // When mouse enters, start animation only if it's not already running
        if (!animationRunning) {
          let counter = 0;
          const next = () => {
            // Hide the text immediately when animation starts for new text
            $(this).css("visibility", "hidden");
            fx.setText(phrases[counter]).then(() => {
              timeoutId = setTimeout(next, 1200);
            });
            counter = (counter + 1) % phrases.length;
          };
          next();
          $(this).css("cursor", "pointer");
          animationRunning = true;
        }
        // Show the text on hover
        $(this).css("visibility", "visible");
      },
      function () {
        // When mouse leaves, reset text and stop animation
        clearTimeout(timeoutId); // Clear the timeout
        fx.setText(""); // Reset text immediately
        $(this).css({
          cursor: "default", // Reset cursor style when mouse leaves
          visibility: "hidden", // Hide the text when not hovering
        });
        animationRunning = false;
      },
    );
  });
});
