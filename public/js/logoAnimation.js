// Logo Animation Module
App.LogoAnimation = {
  isAnimating: false,
  originalText: "OPEN CHAT",

  init: function() {
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('click', App.LogoAnimation.startAnimation);
      logo.addEventListener('mouseenter', App.LogoAnimation.onHover);
      logo.addEventListener('mouseleave', App.LogoAnimation.onLeave);
    }
  },

  onHover: function() {
    if (!App.LogoAnimation.isAnimating) {
      const logo = document.querySelector('.logo');
      logo.classList.add('spin');
      setTimeout(() => {
        logo.classList.remove('spin');
      }, 600);
    }
  },

  onLeave: function() {
    // Remove hover effects when not animating
  },

  startAnimation: function() {
    if (App.LogoAnimation.isAnimating) return;

    App.LogoAnimation.isAnimating = true;
    const logo = document.querySelector('.logo');
    const title = document.querySelector('.title');

    logo.classList.add('animating');

    // First spin and text change
    App.LogoAnimation.spinAndType(logo, title, "Making things work.", () => {
      // Second spin and text change
      App.LogoAnimation.spinAndType(logo, title, "By Nitish", () => {
        // Third spin and return to original
        setTimeout(() => {
          App.LogoAnimation.spinAndType(logo, title, App.LogoAnimation.originalText, () => {
            logo.classList.remove('animating');
            App.LogoAnimation.isAnimating = false;
          });
        }, 1500);
      });
    });
  },

  spinAndType: function(logo, title, text, callback) {
    // Start spinning
    logo.classList.add('spin');

    // After spin completes, start typing
    setTimeout(() => {
      logo.classList.remove('spin');
      App.LogoAnimation.typewriterAnimation(title, text, callback);
    }, 600);
  },

  typewriterAnimation: function(element, text, callback) {
    element.classList.add('typewriter');
    element.textContent = '';

    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
        // Remove typewriter cursor after a brief pause
        setTimeout(() => {
          element.classList.remove('typewriter');
          if (callback) callback();
        }, 500);
      }
    }, 80); // Typing speed
  }
};