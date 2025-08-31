// Dark Mode Module
App.DarkMode = {
  init: function () {
    App.DarkMode.apply();
    App.DarkMode.updateToggleUI();
  },

  apply: function () {
    if (App.State.darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  },

  toggle: function () {
    App.State.darkMode = !App.State.darkMode;
    localStorage.setItem("openrouter_dark_mode", App.State.darkMode);
    App.DarkMode.apply();
    App.DarkMode.updateToggleUI();
  },

  updateToggleUI: function () {
    App.Elements.darkModeToggleInput?.classList.toggle(
      "active",
      App.State.darkMode
    );
  },
};