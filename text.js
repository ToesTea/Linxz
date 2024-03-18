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

    // Add gray box as indication of where to hover
    $(this).css({
      border: "1px solid #ccc",
      padding: "10px",
    });

    // Initialize animationRunning to false
    let animationRunning = false;

    // Function to start animation
    const startAnimation = () => {
      let counter = 0;
      const next = () => {
        if (animationRunning) {
          fx.setText(phrases[counter]).then(() => {
            setTimeout(next, 1200);
          });
          counter = (counter + 1) % phrases.length;
        }
      };
      next();
    };

    // Start animation when mouse enters
    $(this).mouseenter(function () {
      if (!animationRunning) {
        animationRunning = true;
        startAnimation();
      }
    });

    // Stop animation when mouse leaves
    $(this).mouseleave(function () {
      animationRunning = false;
      fx.setText(""); // Reset text
    });
  });
});

document.querySelectorAll(".text").forEach((item) => {
  item.addEventListener("mouseenter", (event) => {
    event.target.setAttribute("data-hovered", "true");
  });

  item.addEventListener("mouseleave", (event) => {
    event.target.setAttribute("data-hovered", "false");
  });
});
