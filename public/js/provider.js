// Provider Management Module
App.Provider = {
  getCurrentProvider: function () {
    return App.State.providers[App.State.currentProvider];
  },

  getCurrentApiKey: function () {
    return App.Provider.getCurrentProvider().apiKey;
  },

  setCurrentProvider: function (providerId) {
    App.State.currentProvider = providerId;
    localStorage.setItem("openrouter_current_provider", providerId);
    App.Provider.updateUI();
  },

  updateUI: function () {
    const E = App.Elements;
    const currentProvider = App.Provider.getCurrentProvider();

    // Update provider select
    if (E.providerSelect) {
      E.providerSelect.value = App.State.currentProvider;
    }

    // Update API key input to show current provider's key
    if (E.apiKeyInput) {
      E.apiKeyInput.value = currentProvider.apiKey;
      E.apiKeyInput.placeholder = `Enter your ${currentProvider.name} API key`;
    }

    // Update model display text
    if (E.customModelSelectDisplayText) {
      const hasApiKey = currentProvider.apiKey;
      if (!hasApiKey) {
        E.customModelSelectDisplayText.textContent = `Set ${currentProvider.name} API Key`;
      }
    }

    // Hide/show free toggle for providers that don't support it
    const supportsFreeToggle = App.State.currentProvider === "openrouter";
    if (E.freeToggle)
      E.freeToggle.style.display = supportsFreeToggle ? "flex" : "none";
    if (E.mobileFreeToggle)
      E.mobileFreeToggle.style.display = supportsFreeToggle ? "flex" : "none";
  },

  saveApiKey: function (providerId, apiKey) {
    App.State.providers[providerId].apiKey = apiKey;
    localStorage.setItem(`${providerId}_api_key`, apiKey);
  },

  handleProviderChange: function () {
    const newProvider = App.Elements.providerSelect.value;
    App.Provider.setCurrentProvider(newProvider);

    // Clear current models and UI
    App.State.models = [];
    App.UI.populateCustomModelSelect();

    // Always fetch models for new provider, then load last used model for that provider
    const provider = App.Provider.getCurrentProvider();
    if (provider.apiKey) {
      // Automatically trigger refresh and selection
      setTimeout(() => {
        App.Elements.refreshBtn?.click();
      }, 100);
    }
  },
};