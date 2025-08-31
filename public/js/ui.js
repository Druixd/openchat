// User Interface Module
App.UI = {
  init: function () {
    const E = App.Elements;
    E.saveChatBtn = document.getElementById("saveChatBtn");

    E.saveChatBtn?.addEventListener(
      "click",
      App.MainLogic.saveChatAsMarkdown
    );
    E.header = document.querySelector(".header");
    E.configBtn = document.getElementById("configBtn");
    E.mobileConfigBtn = document.getElementById("mobileConfigBtn");
    E.clearBtn = document.getElementById("clearBtn");
    E.mobileClearBtn = document.getElementById("mobileClearBtn");
    E.customModelSelectWrapper = document.getElementById(
      "customModelSelectWrapper"
    );
    E.customModelSelectDisplay = document.getElementById(
      "customModelSelectDisplay"
    );
    E.customModelSelectDisplayText = document.getElementById(
      "customModelSelectDisplayText"
    );
    E.customModelSelectDropdown = document.getElementById(
      "customModelSelectDropdown"
    );
    E.customModelSearchInput = document.getElementById(
      "customModelSearchInput"
    );
    E.customModelList = document.getElementById("customModelList");
    E.modelSelect = document.getElementById("modelSelect");
    E.refreshBtn = document.getElementById("refreshBtn");
    E.mobileRefreshBtn = document.getElementById("mobileRefreshBtn");
    E.freeToggle = document.getElementById("freeToggle");
    E.mobileFreeToggle = document.getElementById("mobileFreeToggle");
    E.messages = document.getElementById("messages");
    E.statusLoading = document.getElementById("statusLoading");
    E.statusText = document.getElementById("statusText");
    E.messageInput = document.getElementById("messageInput");
    E.sendBtn = document.getElementById("sendBtn");
    E.sendBtnText = document.getElementById("sendBtnText");
    E.sendBtnLoading = document.getElementById("sendBtnLoading");
    E.configModal = document.getElementById("configModal");
    E.closeConfigBtn = document.getElementById("closeConfigBtn");

    // Provider elements
    E.providerSelect = document.getElementById("providerSelect");
    E.apiKeyInput = document.getElementById("apiKeyInput");

    E.userSystemPromptInput = document.getElementById(
      "userSystemPromptInput"
    );
    E.autoScrollToggleInput = document.getElementById(
      "autoScrollToggleInput"
    );
    E.saveConfigBtn = document.getElementById("saveConfigBtn");
    E.rateLimitStatus = document.getElementById("rateLimitStatus");
    E.writingStyleSelect = document.getElementById("writingStyleSelect");
    E.writingStyleContent = document.getElementById("writingStyleContent");
    E.deleteStyleBtn = document.getElementById("deleteStyleBtn");
    E.analyzeStyleModal = document.getElementById("analyzeStyleModal");
    E.openAnalyzeModalBtn = document.getElementById("openAnalyzeModalBtn");
    E.closeAnalyzeModalBtn = document.getElementById("closeAnalyzeModalBtn");
    E.styleSampleText = document.getElementById("styleSampleText");
    E.analyzedStyleName = document.getElementById("analyzedStyleName");
    E.analysisStatus = document.getElementById("analysisStatus");
    E.analysisStatusText = document.getElementById("analysisStatusText");
    E.analyzeAndCreateBtn = document.getElementById("analyzeAndCreateBtn");
    E.mobileModelBtn = document.getElementById("mobileModelBtn");
    E.mobileModelSection = document.getElementById("mobileModelSection");
    E.mobileModelSearchInput = document.getElementById(
      "mobileModelSearchInput"
    );
    E.mobileModelList = document.getElementById("mobileModelList");
    E.darkModeToggleInput = document.getElementById("darkModeToggleInput");
    E.customSystemPromptToggle = document.getElementById("customSystemPromptToggle");
    E.customSystemPromptSection = document.getElementById("customSystemPromptSection");
    E.providerQuickSwitchWrapper = document.getElementById(
      "providerQuickSwitchWrapper"
    );
    E.providerQuickSwitchBtn = document.getElementById(
      "providerQuickSwitchBtn"
    );
    E.providerFabMenu = document.getElementById("providerFabMenu");
    E.providerQuickSwitchLogo = document.getElementById(
      "providerQuickSwitchLogo"
    );

    App.UI.updateAutoScrollToggleUI();
    App.UI.updateFreeOnlyToggleUI();
    App.UI.updateRateLimitStatus();
    App.DarkMode.init();
    App.Config.updateCustomSystemPromptUI();
    App.Provider.updateUI();
    App.UI.updateProviderQuickSwitchLogo();

    // Auto-update rate limit status every 10 seconds
    setInterval(() => {
      App.UI.updateRateLimitStatus();
    }, 10000);

    // Message input auto-resize
    E.messageInput.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 120) + "px";
    });

    // Send message on Enter (not Shift+Enter), but on mobile Enter adds new line
    E.messageInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        const isMobile = window.innerWidth < 768; // Simple mobile detection
        if (isMobile) {
          // On mobile, insert new line instead of sending
          e.preventDefault();
          const start = this.selectionStart;
          const end = this.selectionEnd;
          this.value = this.value.substring(0, start) + "\n" + this.value.substring(end);
          this.selectionStart = this.selectionEnd = start + 1;
          // Trigger input event to resize textarea
          this.dispatchEvent(new Event('input'));
        } else {
          // On desktop, send message
          e.preventDefault();
          App.MainLogic.sendMessage();
        }
      }
    });

    // All your existing event listeners...
    E.configBtn?.addEventListener("click", function (e) {
      e.stopPropagation();
      App.Config.open();
    });
    E.mobileConfigBtn?.addEventListener("click", function (e) {
      e.stopPropagation();
      App.Config.open();
    });
    E.closeConfigBtn?.addEventListener("click", function (e) {
      e.stopPropagation();
      App.Config.close();
    });
    E.clearBtn?.addEventListener("click", App.MainLogic.clearChat);
    E.mobileClearBtn?.addEventListener("click", App.MainLogic.clearChat);
    E.refreshBtn?.addEventListener("click", App.MainLogic.refreshModels);
    E.mobileRefreshBtn?.addEventListener(
      "click",
      App.MainLogic.refreshModels
    );
    E.freeToggle?.addEventListener("click", App.MainLogic.toggleFreeOnly);
    E.mobileFreeToggle?.addEventListener(
      "click",
      App.MainLogic.toggleFreeOnly
    );
    E.sendBtn?.addEventListener("click", App.MainLogic.sendMessage);
    E.autoScrollToggleInput?.addEventListener(
      "click",
      App.Config.toggleAutoScroll
    );
    E.saveConfigBtn?.addEventListener("click", App.Config.save);
    E.darkModeToggleInput?.addEventListener("click", App.DarkMode.toggle);
    E.customSystemPromptToggle?.addEventListener("click", App.Config.toggleCustomSystemPrompt);

    // Provider event listeners
    E.providerSelect?.addEventListener(
      "change",
      App.Provider.handleProviderChange
    );

    // All your existing model select, mobile, and style event listeners...
    E.customModelSelectDisplay?.addEventListener(
      "click",
      App.UI.toggleCustomModelSelect
    );
    E.customModelSearchInput?.addEventListener(
      "input",
      App.UI.filterCustomModelOptions
    );
    E.customModelList?.addEventListener(
      "click",
      App.UI.handleCustomModelOptionSelect
    );
    E.mobileModelBtn?.addEventListener(
      "click",
      App.UI.toggleMobileModelSection
    );
    E.mobileModelSearchInput?.addEventListener(
      "input",
      App.UI.filterMobileModelOptions
    );
    E.mobileModelList?.addEventListener(
      "click",
      App.UI.handleMobileModelOptionSelect
    );
    E.writingStyleSelect?.addEventListener(
      "change",
      App.Styles.handleStyleSelectChange
    );
    E.deleteStyleBtn?.addEventListener("click", App.Styles.delete);
    E.openAnalyzeModalBtn?.addEventListener("click", () => {
      E.analyzeStyleModal.style.display = "block";
    });
    E.closeAnalyzeModalBtn?.addEventListener("click", () => {
      E.analyzeStyleModal.style.display = "none";
    });
    E.analyzeAndCreateBtn?.addEventListener(
      "click",
      App.Styles.analyzeFromText
    );

    // Close dropdowns when clicking outside
    document.addEventListener("click", function (event) {
      if (
        App.State.isCustomSelectOpen &&
        E.customModelSelectWrapper &&
        !E.customModelSelectWrapper.contains(event.target)
      ) {
        App.UI.closeCustomModelSelect();
      }
      if (
        App.State.mobileModelSectionOpen &&
        E.mobileModelSection &&
        E.mobileModelBtn &&
        !E.mobileModelSection.contains(event.target) &&
        !E.mobileModelBtn.contains(event.target)
      ) {
        App.UI.closeMobileModelSection();
      }
      if (event.target === E.analyzeStyleModal) {
        E.analyzeStyleModal.style.display = "none";
      }
      if (event.target === E.configModal) {
        E.configModal.style.display = "none";
      }
    });

    // Provider quick switch event listeners
    if (E.providerQuickSwitchBtn && E.providerQuickSwitchWrapper) {
      E.providerQuickSwitchBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        E.providerQuickSwitchWrapper.classList.toggle("open");
        const menu = E.providerFabMenu;
        if (menu) {
          // Reset
          menu.style.left = "0";
          menu.style.right = "auto";
          menu.style.flexDirection = "row";
          menu.style.top = "48px";
          // Get bounding rect
          const rect = menu.getBoundingClientRect();
          const winWidth = window.innerWidth;
          if (rect.right > winWidth - 8) {
            // If it overflows right, pop to left
            menu.style.left = "auto";
            menu.style.right = "0";
            menu.style.flexDirection = "row-reverse";
          }
          // If not enough width for horizontal, stack vertically
          if (winWidth < 400) {
            menu.style.flexDirection = "column";
            menu.style.minWidth = "48px";
            menu.style.left = "0";
            menu.style.right = "auto";
          }
        }
      });
      // FAB button clicks
      [
        "openrouter",
        "googleaistudio",
        "siliconflow",
        "huggingface",
        "cohere",
        "moonshot",
      ].forEach((providerId) => {
        const btn = document.getElementById(`providerFabBtn-${providerId}`);
        if (btn) {
          btn.addEventListener("click", function (e) {
            e.stopPropagation();
            if (App.State.currentProvider !== providerId) {
              App.Provider.setCurrentProvider(providerId);

              // Clear current models and refresh for new provider
              App.State.models = [];
              App.UI.populateCustomModelSelect();

              // Automatically refresh models if API key is available
              const provider = App.Provider.getCurrentProvider();
              if (provider.apiKey) {
                setTimeout(() => {
                  App.Elements.refreshBtn?.click();
                }, 100);
              }
            }
            E.providerQuickSwitchWrapper.classList.remove("open");
            App.UI.updateProviderQuickSwitchLogo();
          });
        }
      });
      // Close FAB menu when clicking outside
      document.addEventListener("click", function (event) {
        if (
          E.providerQuickSwitchWrapper.classList.contains("open") &&
          !E.providerQuickSwitchWrapper.contains(event.target)
        ) {
          E.providerQuickSwitchWrapper.classList.remove("open");
        }
      });
    }
  },

  updateProviderQuickSwitchLogo: function () {
    const E = App.Elements;
    if (!E.providerQuickSwitchLogo) return;
  },

  populateCustomModelSelect: function () {
    const S = App.State;
    const E = App.Elements;

    if (!E.customModelList || !E.mobileModelList) {
      console.error("Model list elements not found");
      return;
    }

    E.customModelList.innerHTML = "";
    E.mobileModelList.innerHTML = "";
    const currentProvider = App.Provider.getCurrentProvider();
    const placeholderText = `Select a ${currentProvider.name} model...`;
    let modelsToDisplay = S.models;
    if (
      (S.currentProvider === "huggingface" ||
        S.currentProvider === "googleaistudio") &&
      S.models.length === 0 &&
      currentProvider.predefinedModels
    ) {
      modelsToDisplay = currentProvider.predefinedModels;
    }
    if (S.freeOnly && S.currentProvider === "openrouter") {
      modelsToDisplay = modelsToDisplay.filter((model) =>
        model.id.includes(":free")
      );
    }
    E.modelSelect.innerHTML = `<option value="">${placeholderText}</option>`;
    if (modelsToDisplay.length === 0) {
      const noModelsText = currentProvider.apiKey
        ? "No models available."
        : `Set ${currentProvider.name} API Key`;
      E.customModelList.innerHTML = `<li class="no-models">${noModelsText}</li>`;
      E.mobileModelList.innerHTML = `<li class="no-models">${noModelsText}</li>`;
      E.customModelSelectDisplayText.textContent = currentProvider.apiKey
        ? "No models"
        : `Set ${currentProvider.name} API Key`;
      App.UI.setStatus(`0 ${currentProvider.name} models available`);
      App.UI.filterCustomModelOptions();
      App.UI.filterMobileModelOptions();
      return;
    }
    modelsToDisplay.forEach((model) => {
      const displayText = `${model.id} - ${model.name || "Unknown"}`;
      // Desktop dropdown
      const li = document.createElement("li");
      li.textContent = displayText;
      li.dataset.value = model.id;
      E.customModelList.appendChild(li);
      // Mobile dropdown
      const mobileLi = document.createElement("li");
      mobileLi.textContent = displayText;
      mobileLi.dataset.value = model.id;
      E.mobileModelList.appendChild(mobileLi);
      // Native select
      const option = document.createElement("option");
      option.value = model.id;
      option.textContent = displayText;
      E.modelSelect.appendChild(option);
    });
    // Always prioritize last selected model from localStorage
    const providerId = App.State.currentProvider;
    const lastSelectedModel = localStorage.getItem(`lastModel_${providerId}`);
    let selectedModel = null;
    if (
      lastSelectedModel &&
      modelsToDisplay.some((m) => m.id === lastSelectedModel)
    ) {
      E.modelSelect.value = lastSelectedModel;
      selectedModel = modelsToDisplay.find((m) => m.id === lastSelectedModel);
    } else if (modelsToDisplay.length > 0) {
      // Auto-select first model if no previous selection
      selectedModel = modelsToDisplay[0];
      E.modelSelect.value = selectedModel.id;
      localStorage.setItem(`lastModel_${providerId}`, selectedModel.id);
    } else {
      E.modelSelect.value = "";
    }
    // Set display text and highlight selected option
    let displayText = placeholderText;
    if (selectedModel) {
      displayText = `${selectedModel.id} - ${
        selectedModel.name || "Unknown"
      }`;
      // Highlight in customModelList
      const li = Array.from(E.customModelList.children).find(
        (el) => el.dataset.value === selectedModel.id
      );
      if (li) li.classList.add("selected-option");
      // Highlight in mobileModelList
      const mobileLi = Array.from(E.mobileModelList.children).find(
        (el) => el.dataset.value === selectedModel.id
      );
      if (mobileLi) mobileLi.classList.add("selected-option");
    }
    E.customModelSelectDisplayText.textContent = displayText;
    App.UI.filterCustomModelOptions();
    App.UI.filterMobileModelOptions();
    App.UI.setStatus(
      `${modelsToDisplay.length} ${currentProvider.name} models available`
    );
  },

  // Keep all your other existing UI methods unchanged...
  sortModelsTrending: function (models) {
    return models.slice().sort((a, b) => {
      if (a.trending_rank != null && b.trending_rank != null) {
        return a.trending_rank - b.trending_rank;
      }
      if (a.trending_rank != null) return -1;
      if (b.trending_rank != null) return 1;
      return a.id.localeCompare(b.id);
    });
  },

  updateRateLimitStatus: function () {
    const S = App.State;
    const E = App.Elements;
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    S.requestTimestamps = S.requestTimestamps.filter((t) => t > oneMinuteAgo);

    if (E.rateLimitStatus) {
      E.rateLimitStatus.textContent = `${S.requestTimestamps.length}/10 per minute`;
    }
  },

  toggleCustomModelSelect: function () {
    const S = App.State;
    const E = App.Elements;
    S.isCustomSelectOpen = !S.isCustomSelectOpen;
    E.customModelSelectWrapper.classList.toggle("open", S.isCustomSelectOpen);
    if (S.isCustomSelectOpen) {
      E.customModelSearchInput.value = "";
      App.UI.filterCustomModelOptions();
      E.customModelSearchInput.focus();
    }
  },

  closeCustomModelSelect: function () {
    App.State.isCustomSelectOpen = false;
    App.Elements.customModelSelectWrapper.classList.remove("open");
  },

  toggleMobileModelSection: function () {
    const S = App.State;
    const E = App.Elements;
    S.mobileModelSectionOpen = !S.mobileModelSectionOpen;
    if (S.mobileModelSectionOpen) {
      E.mobileModelSection.classList.remove("hidden");
      E.mobileModelSearchInput.value = "";
      App.UI.filterMobileModelOptions();
      E.mobileModelSearchInput.focus();
    } else {
      E.mobileModelSection.classList.add("hidden");
    }
  },

  closeMobileModelSection: function () {
    App.State.mobileModelSectionOpen = false;
    App.Elements.mobileModelSection.classList.add("hidden");
  },

  filterCustomModelOptions: function () {
    const E = App.Elements;
    const searchTerm = E.customModelSearchInput.value.toLowerCase().trim();
    const listItems = E.customModelList.getElementsByTagName("li");
    let hasVisibleOptions = false;

    Array.from(listItems).forEach((item) => {
      if (item.classList.contains("no-models")) {
        return;
      }

      const itemText = item.textContent.toLowerCase();
      if (itemText.includes(searchTerm)) {
        item.classList.remove("hidden-option");
        hasVisibleOptions = true;
      } else {
        item.classList.add("hidden-option");
      }
    });

    let noModelsLi = E.customModelList.querySelector(".no-models");
    if (!noModelsLi && !hasVisibleOptions && listItems.length > 0) {
      noModelsLi = document.createElement("li");
      noModelsLi.className = "no-models";
      noModelsLi.textContent = "No models match search.";
      E.customModelList.appendChild(noModelsLi);
    } else if (noModelsLi) {
      if (hasVisibleOptions) {
        noModelsLi.remove();
      } else {
        noModelsLi.textContent = searchTerm
          ? "No models match search."
          : "No models available.";
      }
    }
  },

  filterMobileModelOptions: function () {
    const E = App.Elements;
    const searchTerm = E.mobileModelSearchInput.value.toLowerCase().trim();
    const listItems = E.mobileModelList.getElementsByTagName("li");
    let hasVisibleOptions = false;

    Array.from(listItems).forEach((item) => {
      if (item.classList.contains("no-models")) {
        return;
      }

      const itemText = item.textContent.toLowerCase();
      if (itemText.includes(searchTerm)) {
        item.classList.remove("hidden-option");
        hasVisibleOptions = true;
      } else {
        item.classList.add("hidden-option");
      }
    });

    let noModelsLi = E.mobileModelList.querySelector(".no-models");
    if (!noModelsLi && !hasVisibleOptions && listItems.length > 0) {
      noModelsLi = document.createElement("li");
      noModelsLi.className = "no-models";
      noModelsLi.textContent = "No models match search.";
      E.mobileModelList.appendChild(noModelsLi);
    } else if (noModelsLi) {
      if (hasVisibleOptions) {
        noModelsLi.remove();
      } else {
        noModelsLi.textContent = searchTerm
          ? "No models match search."
          : "No models available.";
      }
    }
  },

  handleCustomModelOptionSelect: function (event) {
    const E = App.Elements;
    if (
      event.target.tagName === "LI" &&
      !event.target.classList.contains("no-models")
    ) {
      const selectedValue = event.target.dataset.value;
      const selectedText = event.target.textContent;

      E.customModelSelectDisplayText.textContent = selectedText;
      E.modelSelect.value = selectedValue;

      const currentlySelected =
        E.customModelList.querySelector(".selected-option");
      if (currentlySelected)
        currentlySelected.classList.remove("selected-option");
      event.target.classList.add("selected-option");

      App.UI.closeCustomModelSelect();
      App.UI.syncMobileModelSelection(selectedValue);

      const providerId = App.State.currentProvider;
      localStorage.setItem(`lastModel_${providerId}`, selectedValue);
    }
  },

  handleMobileModelOptionSelect: function (event) {
    const E = App.Elements;
    if (
      event.target.tagName === "LI" &&
      !event.target.classList.contains("no-models")
    ) {
      const selectedValue = event.target.dataset.value;
      const selectedText = event.target.textContent;

      E.customModelSelectDisplayText.textContent = selectedText;
      E.modelSelect.value = selectedValue;

      const currentlySelected =
        E.mobileModelList.querySelector(".selected-option");
      if (currentlySelected)
        currentlySelected.classList.remove("selected-option");
      event.target.classList.add("selected-option");

      App.UI.closeMobileModelSection();
      App.UI.syncDesktopModelSelection(selectedValue);
      const providerId = App.State.currentProvider;
      localStorage.setItem(`lastModel_${providerId}`, selectedValue);
    }
  },

  syncMobileModelSelection: function (selectedValue) {
    const E = App.Elements;
    const mobileItems = E.mobileModelList.getElementsByTagName("li");
    Array.from(mobileItems).forEach((item) => {
      item.classList.remove("selected-option");
      if (item.dataset.value === selectedValue) {
        item.classList.add("selected-option");
      }
    });
  },

  syncDesktopModelSelection: function (selectedValue) {
    const E = App.Elements;
    const desktopItems = E.customModelList.getElementsByTagName("li");
    Array.from(desktopItems).forEach((item) => {
      item.classList.remove("selected-option");
      if (item.dataset.value === selectedValue) {
        item.classList.add("selected-option");
      }
    });
  },

  updateAutoScrollToggleUI: function () {
    App.Elements.autoScrollToggleInput.classList.toggle(
      "active",
      App.State.autoScrollEnabled
    );
  },

  updateFreeOnlyToggleUI: function () {
    App.Elements.freeToggle.classList.toggle("active", App.State.freeOnly);
    App.Elements.mobileFreeToggle.classList.toggle(
      "active",
      App.State.autoScrollEnabled
    );
  },

  setStatus: function (message, loading = false) {
    App.Elements.statusText.textContent = message;
    if (loading) {
      App.Elements.statusLoading.classList.remove("hidden");
    } else {
      App.Elements.statusLoading.classList.add("hidden");
    }
  },

  showLoadingMessage: function () {
    const E = App.Elements;
    App.State.loadingMessageDiv = document.createElement("div");
    App.State.loadingMessageDiv.className = "loading-message";
    App.State.loadingMessageDiv.innerHTML = `
      <span>Generating response</span>
      <div class="loading-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>`;
    E.messages.appendChild(App.State.loadingMessageDiv);
    E.messages.scrollTop = E.messages.scrollHeight;
  },

  hideLoadingMessage: function () {
    if (App.State.loadingMessageDiv) {
      App.State.loadingMessageDiv.remove();
      App.State.loadingMessageDiv = null;
    }
  },

  addThinkingBlock: function () {
    const E = App.Elements;
    const S = App.State;

    const thinkingContainer = document.createElement("div");
    thinkingContainer.className = "thinking-container";
    thinkingContainer.innerHTML = `
      <div class="thinking-header">
        <div class="thinking-icon"></div>
        <span>Thinking...</span>
      </div>
      <div class="thinking-content"></div>`;

    E.messages.appendChild(thinkingContainer);
    S.currentThinkingDiv =
      thinkingContainer.querySelector(".thinking-content");

    if (S.autoScrollEnabled) E.messages.scrollTop = E.messages.scrollHeight;
  },

  updateThinkingContent: function (newThinkingText) {
    const S = App.State;
    if (S.currentThinkingDiv) {
      S.currentThinkingDiv.textContent = newThinkingText;
      S.currentThinkingDiv.scrollTop = S.currentThinkingDiv.scrollHeight;
    }
  },

  // Update the UI.addMessage function to be more defensive:
  addMessage: function (rawContent, role, options = {}) {
    const E = App.Elements;
    const S = App.State;

    if (!E.messages) {
      console.error("Messages container not found");
      return null;
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${role}`;
    messageDiv.dataset.rawContent = rawContent;
    messageDiv.dataset.role = role;
    // Show save button if at least one message exists
    if (App.Elements.saveChatBtn) {
      App.Elements.saveChatBtn.style.display = "inline-flex";
    }
    // If this is a user message and options.attachment is set, show attachment tag
    if (role === "user" && options.attachment) {
      const attachmentDiv = document.createElement("div");
      attachmentDiv.className = "message-attachment";
      attachmentDiv.innerHTML = `
        <span class="attachment-icon" aria-label="Attachment">
          <svg width="16px" height="16px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.5 6.5V6H2V6.5H2.5ZM6.5 6.5V6H6V6.5H6.5ZM6.5 10.5H6V11H6.5V10.5ZM13.5 3.5H14V3.29289L13.8536 3.14645L13.5 3.5ZM10.5 0.5L10.8536 0.146447L10.7071 0H10.5V0.5ZM2.5 7H3.5V6H2.5V7ZM3 11V8.5H2V11H3ZM3 8.5V6.5H2V8.5H3ZM3.5 8H2.5V9H3.5V8ZM4 7.5C4 7.77614 3.77614 8 3.5 8V9C4.32843 9 5 8.32843 5 7.5H4ZM3.5 7C3.77614 7 4 7.22386 4 7.5H5C5 6.67157 4.32843 6 3.5 6V7ZM6 6.5V10.5H7V6.5H6ZM6.5 11H7.5V10H6.5V11ZM9 9.5V7.5H8V9.5H9ZM7.5 6H6.5V7H7.5V6ZM9 7.5C9 6.67157 8.32843 6 7.5 6V7C7.77614 7 8 7.22386 8 7.5H9ZM7.5 11C8.32843 11 9 10.3284 9 9.5H8C8 9.77614 7.77614 10 7.5 10V11ZM10 6V11H11V6H10ZM10.5 7H13V6H10.5V7ZM10.5 9H12V8H10.5V9ZM2 5V1.5H1V5H2ZM13 3.5V5H14V3.5H13ZM2.5 1H10.5V0H2.5V1ZM10.1464 0.853553L13.1464 3.85355L13.8536 3.14645L10.8536 0.146447L10.1464 0.853553ZM2 1.5C2 1.22386 2.22386 1 2.5 1V0C1.67157 0 1 0.671573 1 1.5H2ZM1 12V13.5H2V12H1ZM2.5 15H12.5V14H2.5V15ZM14 13.5V12H13V13.5H14ZM12.5 15C13.3284 15 14 14.3284 14 13.5H13C13 13.7761 12.7761 14 12.5 14V15ZM1 13.5C1 14.3284 1.67157 15 2.5 15V14C2.22386 14 2 13.7761 2 13.5H1Z" fill="#000000"/>
</svg>

        </span>
        <span class="attachment-name">${options.attachment}</span>
      `;
      messageDiv.appendChild(attachmentDiv);
    }

    const messageTextContentDiv = document.createElement("div");
    messageTextContentDiv.className =
      "message-text-content" + (role === "assistant" ? " assistant" : "");

    if (role === "assistant") {
      messageTextContentDiv.innerHTML = marked.parse(rawContent);
    } else {
      messageTextContentDiv.textContent = rawContent;
    }
    messageDiv.appendChild(messageTextContentDiv);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "message-actions";
    ["MD", "TXT"].forEach((type) => {
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.textContent = type;
      btn.title = `Copy as ${type === "MD" ? "Markdown" : "Plain Text"}`;
      btn.onclick = (e) => {
        e.stopPropagation();
        App.UI.handleCopy(
          btn,
          messageDiv.dataset.rawContent,
          type.toLowerCase(),
          role
        );
      };
      actionsDiv.appendChild(btn);
    });
    // Add retry button for assistant messages
    if (role === "assistant") {
      const retryBtn = document.createElement("button");
      retryBtn.className = "copy-btn retry-btn";
      retryBtn.title = "Retry generating response";
      retryBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
      `;
      retryBtn.onclick = (e) => {
        e.stopPropagation();
        App.MainLogic.retryLastMessage();
      };
      actionsDiv.appendChild(retryBtn);
    }
    messageDiv.appendChild(actionsDiv);

    E.messages.appendChild(messageDiv);

    if (S.autoScrollEnabled || role === "user") {
      E.messages.scrollTop = E.messages.scrollHeight;
    }

    return messageDiv;
  },

  handleCopy: function (button, rawContent, format, role) {
    let textToCopy;
    if (format === "md") {
      textToCopy = rawContent;
    } else {
      if (role === "assistant") {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = marked.parse(rawContent);
        textToCopy = tempDiv.textContent || tempDiv.innerText || "";
      } else {
        textToCopy = rawContent;
      }
    }
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        const originalText = button.textContent;
        button.textContent = "Copied!";
        setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy text.");
      });
  },

  renderFoldableQuote: function (content) {
    const id = "fold-" + Math.random().toString(36).slice(2, 10);
    return `<div class="foldable-quote" id="${id}">
      <button class="fold-toggle" onclick="document.getElementById('${id}').classList.toggle('open')">[+]</button>
      <div class="foldable-quote-content">${content}</div>
      <span style="font-size:12px;color:var(--color-purple);">(Click to expand/collapse)</span>
    </div>`;
  },
};