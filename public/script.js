const App = {
  State: {
    openrouterDailyMessages:
      JSON.parse(localStorage.getItem("openrouter_daily_messages")) || 0,
    openrouterFirstMessageDate:
      localStorage.getItem("openrouter_first_message_date") || null,
    // Provider management
    currentProvider:
      localStorage.getItem("openrouter_current_provider") || "openrouter",

    providers: {
      openrouter: {
        name: "OpenRouter",
        apiKey: localStorage.getItem("openrouter_api_key") || "",
        baseUrl: "https://openrouter.ai/api/v1",
        headers: {
          "HTTP-Referer": window.location.href,
          "X-Title": "OpenRouter Chat Tool",
        },
        chatEndpoint: "/chat/completions",
        modelsEndpoint: "/models",
        authHeader: "Bearer",
      },
      googleaistudio: {
        name: "Google AI Studio",
        apiKey: localStorage.getItem("googleaistudio_api_key") || "",
        baseUrl: "https://generativelanguage.googleapis.com",
        headers: {},
        chatEndpoint: "/v1beta/models", // Base endpoint, we'll append model and action
        modelsEndpoint: "/v1beta/models",
        authHeader: "", // Google uses API key in URL
        useGeminiFormat: true,
        predefinedModels: [
          { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite" },
          {
            id: "gemini-2.5-flash-lite-preview-06-17",
            name: "Gemini 2.5 Flash Lite",
          },
          { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
          { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
        ],
      },
      siliconflow: {
        name: "SiliconFlow",
        apiKey: localStorage.getItem("siliconflow_api_key") || "",
        baseUrl: "https://api.ap.siliconflow.com/v1",
        headers: {},
        chatEndpoint: "/chat/completions",
        modelsEndpoint: "/models",
        authHeader: "Bearer",
      },
      huggingface: {
        name: "Hugging Face",
        apiKey: localStorage.getItem("huggingface_api_key") || "",
        baseUrl: "https://api-inference.huggingface.co",
        headers: {},
        chatEndpoint: "/v1/chat/completions",
        modelsEndpoint: null, // HF doesn't have a standard models endpoint
        authHeader: "Bearer",
        predefinedModels: [
          { id: "microsoft/phi-4", name: "Microsoft Phi-4" },
          {
            id: "meta-llama/Meta-Llama-3.1-8B-Instruct",
            name: "Llama 3.1 8B Instruct",
          },
          { id: "google/gemma-2-2b-it", name: "Gemma 2 2B IT" },
          {
            id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
            name: "DeepSeek R1 Distill Qwen 1.5B",
          },
          {
            id: "Qwen/Qwen2.5-7B-Instruct-1M",
            name: "Qwen 2.5 7B Instruct 1M",
          },
          {
            id: "Qwen/Qwen2.5-Coder-32B-Instruct",
            name: "Qwen 2.5 Coder 32B Instruct",
          },
          { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1" },
          {
            id: "Qwen/Qwen2.5-VL-7B-Instruct",
            name: "Qwen 2.5 VL 7B Instruct",
          },
        ],
      },
      cohere: {
        name: "Cohere",
        apiKey: localStorage.getItem("cohere_api_key") || "",
        baseUrl: "https://api.cohere.com/v2",
        headers: {},
        chatEndpoint: "/chat",
        modelsEndpoint: "/models",
        authHeader: "Bearer",
        useV2Format: true, // Cohere uses different request/response format
      },
    },

    // Existing state properties
    userSystemPrompt:
      localStorage.getItem("openrouter_user_system_prompt") || "",
    autoScrollEnabled:
      localStorage.getItem("openrouter_auto_scroll") === null
        ? true
        : localStorage.getItem("openrouter_auto_scroll") === "true",
    darkMode: localStorage.getItem("openrouter_dark_mode") === "true",
    freeOnly: true,
    models: [],
    isGenerating: false,
    isAnalyzingStyle: false,
    loadingMessageDiv: null,
    currentThinkingDiv: null,
    DEFAULT_SYSTEM_PROMPT: "You should use simple words and no emojis.",
    OVERRIDE_COMMAND: "@override",
    isCustomSelectOpen: false,
    requestTimestamps: [],
    writingStyles: [],
    selectedStyleName:
      localStorage.getItem("openrouter_selected_style") || "Default",
    mobileModelSectionOpen: false,
  },

  Elements: {
    // Add provider elements
    providerSelect: null,

    // Existing elements (keeping all your existing element definitions)
    header: null,
    configBtn: null,
    mobileConfigBtn: null,
    clearBtn: null,
    mobileClearBtn: null,
    modelSelect: null,
    customModelSelectWrapper: null,
    customModelSelectDisplay: null,
    customModelSelectDisplayText: null,
    customModelSelectDropdown: null,
    customModelSearchInput: null,
    customModelList: null,
    refreshBtn: null,
    mobileRefreshBtn: null,
    freeToggle: null,
    mobileFreeToggle: null,
    messages: null,
    statusLoading: null,
    statusText: null,
    messageInput: null,
    sendBtn: null,
    sendBtnText: null,
    sendBtnLoading: null,
    configModal: null,
    closeConfigBtn: null,
    apiKeyInput: null,
    userSystemPromptInput: null,
    autoScrollToggleInput: null,
    saveConfigBtn: null,
    rateLimitStatus: null,
    writingStyleSelect: null,
    writingStyleContent: null,
    deleteStyleBtn: null,
    analyzeStyleModal: null,
    openAnalyzeModalBtn: null,
    closeAnalyzeModalBtn: null,
    styleSampleText: null,
    analyzedStyleName: null,
    analysisStatus: null,
    analysisStatusText: null,
    analyzeAndCreateBtn: null,
    mobileModelBtn: null,
    mobileModelSection: null,
    mobileModelSearchInput: null,
    mobileModelList: null,
    darkModeToggleInput: null,
  },

  Constants: {
    DEFAULT_STYLES: [
      { name: "Default", content: "" },
      {
        name: "Professional & Formal",
        content:
          "Your writing style is professional and formal. Use clear, concise language, proper grammar, and a respectful tone. Avoid slang, contractions, and overly casual phrasing.",
      },
      {
        name: "Casual & Conversational",
        content:
          "Your writing style is casual and conversational. Feel free to use contractions, everyday language, and a friendly, approachable tone. Keep it light and easy to read.",
      },
      {
        name: "Humorous & Witty",
        content:
          "Your writing style is humorous and witty. Incorporate clever remarks, puns, and light-hearted jokes where appropriate. Your goal is to be engaging and amusing.",
      },
      {
        name: "Persuasive & Inspiring",
        content:
          "Your writing style is persuasive and inspiring. Use powerful words, rhetorical questions, and a confident tone to motivate and convince the reader. Appeal to emotions and logic.",
      },
      {
        name: "Descriptive & Creative",
        content:
          "Your writing style is descriptive and creative. Use vivid imagery, sensory details, and metaphors to paint a picture with your words. Be imaginative and artistic in your language.",
      },
    ],
  },

  // Provider management
  Provider: {
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

      // Clear current models and refresh
      App.State.models = [];
      App.UI.populateCustomModelSelect();

      // Refresh models for new provider
      const provider = App.Provider.getCurrentProvider();
      if (provider.apiKey) {
        App.MainLogic.refreshModels();
      }
    },
  },

  // Keep all your existing UI methods...
  UI: {
    init: function () {
      const E = App.Elements;
      // ... (all your existing element assignments) ...
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

      App.UI.updateAutoScrollToggleUI();
      App.UI.updateFreeOnlyToggleUI();
      App.UI.updateRateLimitStatus();
      App.DarkMode.init();
      App.Provider.updateUI();

      // Auto-update rate limit status every 10 seconds
      setInterval(() => {
        App.UI.updateRateLimitStatus();
      }, 10000);

      // Message input auto-resize
      E.messageInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = Math.min(this.scrollHeight, 120) + "px";
      });

      // Send message on Enter (not Shift+Enter)
      E.messageInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          App.MainLogic.sendMessage();
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
      let currentSelectedNativeValue = E.modelSelect.value;
      let currentDisplayText = placeholderText;
      let foundSelectedInNewList = false;

      // For providers with predefined models, use them if no API models available
      let modelsToDisplay = S.models;
      if (
        (S.currentProvider === "huggingface" ||
          S.currentProvider === "googleaistudio") &&
        S.models.length === 0 &&
        currentProvider.predefinedModels
      ) {
        modelsToDisplay = currentProvider.predefinedModels;
      }

      // Apply free filter only for OpenRouter
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

        const option = document.createElement("option");
        option.value = model.id;
        option.textContent = displayText;
        E.modelSelect.appendChild(option);

        if (model.id === currentSelectedNativeValue) {
          currentDisplayText = displayText;
          li.classList.add("selected-option");
          mobileLi.classList.add("selected-option");
          E.modelSelect.value = currentSelectedNativeValue;
          foundSelectedInNewList = true;
        }
      });

      const providerId = App.State.currentProvider;
      const lastSelectedModel = localStorage.getItem(`lastModel_${providerId}`);
      if (
        lastSelectedModel &&
        modelsToDisplay.some((m) => m.id === lastSelectedModel)
      ) {
        E.modelSelect.value = lastSelectedModel;
        const selectedModel = modelsToDisplay.find(
          (m) => m.id === lastSelectedModel
        );
        if (selectedModel) {
          E.customModelSelectDisplayText.textContent = `${selectedModel.id} - ${
            selectedModel.name || "Unknown"
          }`;
        }
      } else {
        E.modelSelect.value = "";
        E.customModelSelectDisplayText.textContent = placeholderText;
      }

      if (!foundSelectedInNewList) {
        E.modelSelect.value = "";
        currentDisplayText = placeholderText;
      }
      E.customModelSelectDisplayText.textContent = currentDisplayText;

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
        App.State.freeOnly
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
    addMessage: function (rawContent, role) {
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

      const messageTextContentDiv = document.createElement("div");
      messageTextContentDiv.className = "message-text-content";

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
  },

  API: {
    fetchModels: async function () {
      const provider = App.Provider.getCurrentProvider();
      if (!provider.apiKey) return null;

      // Hugging Face doesn't have a standard models endpoint, use predefined models
      if (App.State.currentProvider === "huggingface") {
        return { data: provider.predefinedModels || [] };
      }
      // Google AI Studio - use predefined models for now since the API has complex model listing
      if (App.State.currentProvider === "googleaistudio") {
        return { data: provider.predefinedModels || [] };
      }
      // Cohere uses different endpoint for models
      const endpoint = provider.modelsEndpoint || "/models";

      const response = await fetch(`${provider.baseUrl}${endpoint}`, {
        headers: {
          Authorization: `${provider.authHeader} ${provider.apiKey}`,
          "Content-Type": "application/json",
          ...provider.headers,
        },
      });
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    },

    fetchChatCompletion: async function (payload) {
      const provider = App.Provider.getCurrentProvider();

      let requestPayload = payload;
      let endpoint = provider.chatEndpoint;
      let url;

      // Handle Google AI Studio's different format
      if (provider.useGeminiFormat) {
        requestPayload = App.API.convertToGemini(payload);
        const modelId = payload.model;

        if (!modelId) {
          throw new Error("No model selected for Google AI Studio");
        }

        // Google AI Studio doesn't really stream tokens, so use non-streaming endpoint
        const action = "generateContent";
        url = `${provider.baseUrl}/v1beta/models/${modelId}:${action}?key=${provider.apiKey}`;

        return await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...provider.headers,
          },
          body: JSON.stringify(requestPayload),
        });
      }

      // Handle Cohere's different format
      if (provider.useV2Format) {
        requestPayload = App.API.convertToCohere(payload);
      }

      // Standard OpenAI-compatible format
      const headers = {
        "Content-Type": "application/json",
        ...provider.headers,
      };

      if (provider.authHeader) {
        headers.Authorization = `${provider.authHeader} ${provider.apiKey}`;
      }

      url = `${provider.baseUrl}${endpoint}`;

      return await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestPayload),
      });
    },

    convertToCohere: function (openAIPayload) {
      // Convert OpenAI format to Cohere v2 format
      const coherePayload = {
        model: openAIPayload.model,
        messages: openAIPayload.messages,
        stream: openAIPayload.stream || false,
      };

      // Map OpenAI parameters to Cohere parameters
      if (openAIPayload.max_tokens)
        coherePayload.max_tokens = openAIPayload.max_tokens;
      if (openAIPayload.temperature)
        coherePayload.temperature = openAIPayload.temperature;
      if (openAIPayload.top_p) coherePayload.p = openAIPayload.top_p;
      if (openAIPayload.frequency_penalty)
        coherePayload.frequency_penalty = openAIPayload.frequency_penalty;
      if (openAIPayload.presence_penalty)
        coherePayload.presence_penalty = openAIPayload.presence_penalty;
      if (openAIPayload.stop) coherePayload.stop_sequences = openAIPayload.stop;

      return coherePayload;
    },
    convertToGemini: function (openAIPayload) {
      // Convert OpenAI format to Gemini format
      const contents = [];
      let systemPrompt = "";

      openAIPayload.messages.forEach((message) => {
        if (message.role === "system") {
          systemPrompt = message.content;
          return;
        }

        contents.push({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        });
      });

      // Prepend system message to first user message if exists
      if (systemPrompt && contents.length > 0 && contents[0].role === "user") {
        contents[0].parts[0].text = `${systemPrompt}\n\n${contents[0].parts[0].text}`;
      }

      const geminiPayload = {
        contents: contents,
        generationConfig: {
          temperature: openAIPayload.temperature || 0.7,
          maxOutputTokens: openAIPayload.max_tokens || 2048,
          topP: openAIPayload.top_p || 0.8,
        },
      };

      if (openAIPayload.stop) {
        geminiPayload.generationConfig.stopSequences = Array.isArray(
          openAIPayload.stop
        )
          ? openAIPayload.stop
          : [openAIPayload.stop];
      }

      return geminiPayload;
    },
  },

  // Keep all your existing modules (Styles, DarkMode, Config) unchanged...
  Styles: {
    init: function () {
      App.Styles.load();
      App.Styles.populateSelect();
    },

    load: function () {
      const S = App.State;
      const C = App.Constants;
      const savedStyles =
        JSON.parse(localStorage.getItem("openrouter_writing_styles")) || [];
      const customStyles = savedStyles.filter(
        (saved) => !C.DEFAULT_STYLES.some((def) => def.name === saved.name)
      );
      S.writingStyles = [...C.DEFAULT_STYLES, ...customStyles];
    },

    populateSelect: function () {
      const E = App.Elements;
      const S = App.State;
      E.writingStyleSelect.innerHTML = "";
      S.writingStyles.forEach((style) => {
        const option = document.createElement("option");
        option.value = style.name;
        option.textContent = style.name;
        E.writingStyleSelect.appendChild(option);
      });
      E.writingStyleSelect.value = S.selectedStyleName;
      App.Styles.handleStyleSelectChange();
    },

    handleStyleSelectChange: function () {
      const S = App.State;
      const E = App.Elements;
      const selectedName = E.writingStyleSelect.value;
      const selectedStyle = S.writingStyles.find(
        (s) => s.name === selectedName
      );

      if (selectedStyle) {
        E.writingStyleContent.value = selectedStyle.content;
        S.selectedStyleName = selectedName;
        localStorage.setItem("openrouter_selected_style", selectedName);
      }
    },

    delete: function () {
      const E = App.Elements;
      const S = App.State;
      const selectedName = E.writingStyleSelect.value;

      const isDefault = App.Constants.DEFAULT_STYLES.some(
        (s) => s.name === selectedName
      );
      if (isDefault) {
        alert("You cannot delete a default style.");
        return;
      }

      if (
        confirm(`Are you sure you want to delete the style '${selectedName}'?`)
      ) {
        S.writingStyles = S.writingStyles.filter(
          (s) => s.name !== selectedName
        );
        App.Styles.persist();
        S.selectedStyleName = "Default";
        localStorage.setItem("openrouter_selected_style", "Default");
        App.Styles.populateSelect();
      }
    },

    persist: function () {
      const customStyles = App.State.writingStyles.filter(
        (style) =>
          !App.Constants.DEFAULT_STYLES.some((def) => def.name === style.name)
      );
      localStorage.setItem(
        "openrouter_writing_styles",
        JSON.stringify(customStyles)
      );
    },

    analyzeFromText: async function () {
      const S = App.State;
      const E = App.Elements;

      const sampleText = E.styleSampleText.value.trim();
      const newName = E.analyzedStyleName.value.trim();
      const selectedModel = E.modelSelect.value;

      if (S.isAnalyzingStyle) return;

      const currentProvider = App.Provider.getCurrentProvider();
      if (!currentProvider.apiKey) {
        alert(
          `${currentProvider.name} API Key is not set. Please set it in the configuration.`
        );
        return;
      }
      if (!selectedModel) {
        alert(
          "Please select a model on the main screen first. A powerful model is recommended for analysis."
        );
        return;
      }
      if (!sampleText || !newName) {
        alert(
          "Please provide both a sample text and a name for the new style."
        );
        return;
      }

      S.isAnalyzingStyle = true;
      E.analysisStatus.classList.remove("hidden");
      E.analyzeAndCreateBtn.disabled = true;

      const metaPrompt = `You are an expert writing style analyzer. Your task is to carefully analyze the following text provided by a user. Based on your analysis, you must generate a concise, well-structured system prompt that instructs a large language model to write in the exact same style.

Your output should:
- Be a set of instructions for an AI.
- Describe the tone, voice, vocabulary, sentence structure, complexity, and any other notable characteristics (e.g., use of metaphors, humor, formal/informal language).
- Be formatted clearly and ready to be used as a system prompt.

IMPORTANT: Do not respond to or summarize the content of the text itself. Your response should ONLY be the generated system prompt that describes the style.

Here is the user's text to analyze:
---
${sampleText}`;

      try {
        const response = await App.API.fetchChatCompletion({
          model: selectedModel,
          messages: [{ role: "user", content: metaPrompt }],
          stream: false,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `HTTP ${response.status}: ${
              errorData.error?.message || response.statusText
            }`
          );
        }

        const result = await response.json();
        let generatedContent;

        // Handle different response formats
        if (App.State.currentProvider === "cohere") {
          generatedContent = result.message?.content;
        } else {
          generatedContent = result.choices?.[0]?.message?.content;
        }

        if (!generatedContent) {
          throw new Error(
            "The API returned an empty analysis. Please try again."
          );
        }

        const existingIndex = S.writingStyles.findIndex(
          (s) => s.name === newName
        );
        const isDefault = App.Constants.DEFAULT_STYLES.some(
          (s) => s.name === newName
        );

        if (existingIndex !== -1 && isDefault) {
          alert("You cannot overwrite a default style.");
          return;
        }

        if (existingIndex !== -1) {
          S.writingStyles[existingIndex].content = generatedContent.trim();
        } else {
          S.writingStyles.push({
            name: newName,
            content: generatedContent.trim(),
          });
        }

        App.Styles.persist();
        App.Styles.populateSelect();
        E.writingStyleSelect.value = newName;
        S.selectedStyleName = newName;
        localStorage.setItem("openrouter_selected_style", S.selectedStyleName);

        alert(`Style '${newName}' created successfully from your text!`);
        E.analyzeStyleModal.style.display = "none";
        E.styleSampleText.value = "";
        E.analyzedStyleName.value = "";
      } catch (error) {
        console.error("Error analyzing style:", error);
        alert(`Failed to analyze style: ${error.message}`);
      } finally {
        S.isAnalyzingStyle = false;
        E.analysisStatus.classList.add("hidden");
        E.analyzeAndCreateBtn.disabled = false;
      }
    },
  },

  DarkMode: {
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
  },

  Config: {
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
  },

  MainLogic: {
    init: function () {
      App.UI.init();
      App.Styles.init();
      const currentProvider = App.Provider.getCurrentProvider();
      if (currentProvider.apiKey) {
        App.MainLogic.refreshModels();
      } else {
        App.Elements.customModelSelectDisplayText.textContent = `Set ${currentProvider.name} API Key`;
        App.Elements.customModelList.innerHTML = `<li class="no-models">Set ${currentProvider.name} API Key to load models.</li>`;
        if (App.Elements.mobileModelList) {
          App.Elements.mobileModelList.innerHTML = `<li class="no-models">Set ${currentProvider.name} API Key to load models.</li>`;
        }
      }
    },

    toggleFreeOnly: function () {
      // Only applies to OpenRouter
      if (App.State.currentProvider !== "openrouter") return;

      App.State.freeOnly = !App.State.freeOnly;
      App.UI.updateFreeOnlyToggleUI();
      App.UI.populateCustomModelSelect();
    },

    refreshModels: async function () {
      const S = App.State;
      const E = App.Elements;
      const UI = App.UI;
      const currentProvider = App.Provider.getCurrentProvider();

      if (!currentProvider.apiKey) {
        alert(`Please set your ${currentProvider.name} API key first`);
        App.Config.open();
        E.customModelSelectDisplayText.textContent = `Set ${currentProvider.name} API Key`;
        E.customModelList.innerHTML = `<li class="no-models">Set ${currentProvider.name} API Key to load models.</li>`;
        if (E.mobileModelList) {
          E.mobileModelList.innerHTML = `<li class="no-models">Set ${currentProvider.name} API Key to load models.</li>`;
        }
        return;
      }

      E.refreshBtn.disabled = true;
      if (E.mobileRefreshBtn) E.mobileRefreshBtn.disabled = true;
      UI.setStatus(`Fetching ${currentProvider.name} models...`, true);
      E.customModelSelectDisplayText.textContent = "Loading...";

      try {
        const data = await App.API.fetchModels();

        // Handle different response formats
        if (S.currentProvider === "cohere") {
          S.models = data.models || [];
        } else if (S.currentProvider === "huggingface") {
          S.models = data.data || currentProvider.predefinedModels || [];
        } else {
          S.models = data.data || [];
        }

        UI.populateCustomModelSelect();
      } catch (error) {
        console.error("Error fetching models:", error);
        UI.setStatus(`Error: ${error.message}`);
        alert(
          `Failed to fetch ${currentProvider.name} models. Please check your API key.`
        );
        E.customModelSelectDisplayText.textContent = "Error";
        E.customModelList.innerHTML =
          '<li class="no-models">Error loading models.</li>';
        if (E.mobileModelList) {
          E.mobileModelList.innerHTML =
            '<li class="no-models">Error loading models.</li>';
        }
      } finally {
        E.refreshBtn.disabled = false;
        if (E.mobileRefreshBtn) E.mobileRefreshBtn.disabled = false;
      }
    },

    sendMessage: async function () {
      const S = App.State;
      const E = App.Elements;
      const UI = App.UI;
      const currentProvider = App.Provider.getCurrentProvider();

      UI.updateRateLimitStatus();

      if (currentProvider.id === "openrouter") {
        // Assuming you add an 'id' property or use the key
        const today = new Date().toDateString(); // e.g., "Mon Jun 24 2025"
        if (S.openrouterFirstMessageDate !== today) {
          // New day, reset count
          S.openrouterDailyMessages = 0;
          S.openrouterFirstMessageDate = today;
          localStorage.setItem("openrouter_daily_messages", 0);
          localStorage.setItem("openrouter_first_message_date", today);
        }

        if (S.openrouterDailyMessages >= 50) {
          alert(
            "Daily limit reached for OpenRouter (50 messages). Try again tomorrow."
          );
          UI.setStatus("OpenRouter daily limit exceeded.");
          return;
        }

        // Increment count after successful send
        S.openrouterDailyMessages += 1;
        localStorage.setItem(
          "openrouter_daily_messages",
          S.openrouterDailyMessages
        );
      }

      const selectedModel = E.modelSelect.value;
      const message = E.messageInput.value.trim();

      if (!message || !currentProvider.apiKey || S.isGenerating) return;
      if (!selectedModel) {
        alert("Please select a model from the dropdown.");
        return;
      }

      S.isGenerating = true;
      E.sendBtn.disabled = true;
      E.messageInput.disabled = true;
      E.sendBtnText.classList.add("hidden");
      E.sendBtnLoading.classList.remove("hidden");

      UI.addMessage(message, "user");
      E.messageInput.value = "";
      E.messageInput.style.height = "auto";

      UI.setStatus("Waiting for response...", true);
      UI.showLoadingMessage();

      let assistantMessageDiv = null;
      let assistantContent = "";
      let thinkingContent = "";

      const selectedStyle = S.writingStyles.find(
        (s) => s.name === S.selectedStyleName
      );
      const styleContent = selectedStyle ? selectedStyle.content : "";

      let customPromptPart = "";
      const userPromptLower = S.userSystemPrompt.toLowerCase();
      const overrideCmdLower = S.OVERRIDE_COMMAND.toLowerCase();

      if (userPromptLower.startsWith(overrideCmdLower)) {
        customPromptPart = S.userSystemPrompt
          .substring(S.OVERRIDE_COMMAND.length)
          .trim();
      } else {
        customPromptPart = S.DEFAULT_SYSTEM_PROMPT;
        if (S.userSystemPrompt) {
          customPromptPart += " " + S.userSystemPrompt;
        }
      }

      let finalSystemPrompt = styleContent;
      if (styleContent && customPromptPart) {
        finalSystemPrompt += "\n\n---\n\n" + customPromptPart.trim();
      } else if (customPromptPart) {
        finalSystemPrompt = customPromptPart.trim();
      }
      finalSystemPrompt = finalSystemPrompt.trim();

      const messagesPayload = [];
      if (finalSystemPrompt) {
        messagesPayload.push({ role: "system", content: finalSystemPrompt });
      }

      const allMessageElements = E.messages.querySelectorAll(".message");
      allMessageElements.forEach((el) => {
        messagesPayload.push({
          role: el.classList.contains("user") ? "user" : "assistant",
          content: el.dataset.rawContent,
        });
      });

      const now = Date.now();
      S.requestTimestamps.push(now);
      UI.updateRateLimitStatus();

      try {
        const response = await App.API.fetchChatCompletion({
          model: selectedModel,
          messages: messagesPayload,
          stream: S.currentProvider !== "googleaistudio", // Don't stream for Google AI Studio
        });
        if (!response.ok)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        UI.hideLoadingMessage();
        UI.setStatus("Receiving response...", true);

        // Handle Google AI Studio (non-streaming)
        if (S.currentProvider === "googleaistudio") {
          const result = await response.json();
          const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

          if (content) {
            assistantMessageDiv = UI.addMessage(content, "assistant");
          } else {
            throw new Error("No content found in Google AI Studio response");
          }
        } else {
          // Handle streaming for other providers
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  let delta, content;

                  if (S.currentProvider === "cohere") {
                    content = parsed.delta?.message?.content;
                  } else {
                    delta = parsed.choices?.[0]?.delta;
                    content = delta?.content;
                    if (delta?.thinking) {
                      thinkingContent += delta.thinking + " ";
                    }
                  }

                  if (content) {
                    if (!assistantMessageDiv) {
                      assistantMessageDiv = UI.addMessage("", "assistant");
                    }
                    assistantContent += content;
                    assistantMessageDiv.dataset.rawContent = assistantContent;

                    // Update content for real-time streaming
                    const messageTextContent =
                      assistantMessageDiv.querySelector(
                        ".message-text-content"
                      );
                    if (messageTextContent) {
                      messageTextContent.innerHTML =
                        marked.parse(assistantContent);
                    }

                    // Auto-scroll if enabled
                    if (S.autoScrollEnabled) {
                      E.messages.scrollTop = E.messages.scrollHeight;
                    }
                  }
                } catch (e) {
                  // Silent fail for parsing errors
                }
              }
            }
          }

          // Final content rendering for streaming providers
          if (assistantMessageDiv) {
            const messageTextContent = assistantMessageDiv.querySelector(
              ".message-text-content"
            );
            if (messageTextContent) {
              if (thinkingContent) {
                const fullContent = `<blockquote class="thinking-quote">${thinkingContent.trim()}</blockquote>${assistantContent}`;
                messageTextContent.innerHTML = marked.parse(fullContent);
                assistantMessageDiv.dataset.rawContent = fullContent;
              } else {
                messageTextContent.innerHTML = marked.parse(assistantContent);
                assistantMessageDiv.dataset.rawContent = assistantContent;
              }
            }
          }
        }

        UI.setStatus("Response complete");
      } catch (error) {
        console.error("Error in sendMessage:", error);
        UI.hideLoadingMessage();
        const errorMsg = `Error: ${error.message}`;

        if (!assistantMessageDiv) {
          UI.addMessage(errorMsg, "assistant");
        } else {
          const currentContent = assistantMessageDiv.dataset.rawContent || "";
          const updatedContent = currentContent + `\n\n**${errorMsg}**`;
          assistantMessageDiv.dataset.rawContent = updatedContent;

          const messageTextContent = assistantMessageDiv.querySelector(
            ".message-text-content"
          );
          if (messageTextContent) {
            messageTextContent.innerHTML = marked.parse(updatedContent);
          }
        }
        UI.setStatus(errorMsg);
      } finally {
        S.isGenerating = false;
        E.sendBtn.disabled = false;
        E.messageInput.disabled = false;
        E.sendBtnText.classList.remove("hidden");
        E.sendBtnLoading.classList.add("hidden");
        S.currentThinkingDiv = null;
        if (S.autoScrollEnabled && E.messages) {
          E.messages.scrollTop = E.messages.scrollHeight;
        }
        E.messageInput.focus();
        UI.updateRateLimitStatus();
      }
    },

    clearChat: function () {
      if (confirm("Clear all messages?")) {
        App.Elements.messages.innerHTML = "";
        App.UI.setStatus("Chat cleared");
      }
    },
  },
};

document.addEventListener("DOMContentLoaded", App.MainLogic.init);
