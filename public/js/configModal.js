// Configuration Modal Module
App.Config = {
  open: function () {
    const S = App.State;
    const E = App.Elements;

    // Populate provider select
    E.providerSelect.innerHTML = "";
    Object.keys(S.providers).forEach((providerId) => {
      const provider = S.providers[providerId];
      const option = document.createElement("option");
      option.value = providerId;
      option.textContent = provider.name;
      E.providerSelect.appendChild(option);
    });

    E.userSystemPromptInput.value = S.userSystemPrompt;
    App.UI.updateAutoScrollToggleUI();
    App.DarkMode.updateToggleUI();
    App.Config.updateCustomSystemPromptUI();
    App.Provider.updateUI();
    App.Styles.init();
    E.configModal.style.display = "block";
  },

  close: function () {
    App.Elements.configModal.style.display = "none";
  },

  save: function () {
    const S = App.State;
    const E = App.Elements;

    // Save current provider's API key
    const currentProvider = App.Provider.getCurrentProvider();
    const apiKey = E.apiKeyInput.value.trim();
    App.Provider.saveApiKey(S.currentProvider, apiKey);

    S.userSystemPrompt = E.userSystemPromptInput.value.trim();

    localStorage.setItem("openrouter_user_system_prompt", S.userSystemPrompt);
    localStorage.setItem("openrouter_auto_scroll", S.autoScrollEnabled);
    localStorage.setItem("openrouter_dark_mode", S.darkMode);

    App.Config.close();
    if (currentProvider.apiKey) App.MainLogic.refreshModels();
  },

  toggleAutoScroll: function () {
    App.State.autoScrollEnabled = !App.State.autoScrollEnabled;
    App.UI.updateAutoScrollToggleUI();
  },

  toggleCustomSystemPrompt: function () {
    App.State.customSystemPromptEnabled = !App.State.customSystemPromptEnabled;
    App.Config.updateCustomSystemPromptUI();
    localStorage.setItem("openrouter_custom_system_prompt_enabled", App.State.customSystemPromptEnabled);
  },

  updateCustomSystemPromptUI: function () {
    const E = App.Elements;
    const S = App.State;

    if (E.customSystemPromptToggle) {
      E.customSystemPromptToggle.classList.toggle("active", S.customSystemPromptEnabled);
    }

    if (E.customSystemPromptSection) {
      if (S.customSystemPromptEnabled) {
        E.customSystemPromptSection.classList.remove("hidden");
      } else {
        E.customSystemPromptSection.classList.add("hidden");
      }
    }
  },
};