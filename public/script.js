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
      moonshot: {
        name: "Moonshot AI",
        apiKey: localStorage.getItem("moonshot_api_key") || "",
        baseUrl: "https://api.moonshot.ai/v1",
        headers: {},
        chatEndpoint: "/chat/completions",
        modelsEndpoint: "/models",
        authHeader: "Bearer",
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
    customSystemPromptEnabled: localStorage.getItem("openrouter_custom_system_prompt_enabled") === "true",
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
    pdfText: null,
    pdfFileName: null,
    rateLimits: {
      openrouter: { daily: 50 },
      googleaistudio: { daily: 2000 }, // Google: 60/min, 60k/month, so ~2000/day for user clarity
    },
    usage: {
      openrouter: {},
      googleaistudio: {},
      siliconflow: {},
      huggingface: {},
      cohere: {},
      moonshot: {},
    },
    reasoningEnabled: false,
    maxTokens: 2048,
  },

  Elements: {
    // Add provider elements
    providerSelect: null,
    saveChatBtn: null,
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
    customSystemPromptToggle: null,
    customSystemPromptSection: null,
    pdfUpload: null,
    providerQuickSwitchWrapper: null,
    providerQuickSwitchBtn: null,
    providerFabMenu: null,
    providerQuickSwitchLogo: null,
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
      {
        name: "Alexia Mandeville",
        content:
          'Adopt an instructive yet conversational tone, blending professional guidance with approachable mentorship. Structure content with clear topical headers followed by concise, actionable advice. Use game design terminology precisely ("core loop," "vertical slice," "FTUE," "game pillars") while keeping explanations accessible.\n\n**Key Style Requirements:**\n1. **Tone & Voice:**  \n   - Second-person address ("you\'ll," "your players")  \n   - Confident yet humble expertise (e.g., "I\'ve learned," "in my experience")  \n   - Encouraging directives ("Always ask yourself," "Make sure to")  \n   - Sparse, purposeful first-person references to establish credibility without dominating  \n\n2. **Sentence Structure:**  \n   - Mix straightforward declarative sentences ("Designing onboarding is iterative") with punchy rhetorical questions ("Why implement features if players don\'t understand them?")  \n   - Average sentence length: 15-25 words. Prioritize clarity over complexity.  \n   - Emphasize key concepts through italics or quotation marks (e.g., *"trim the fat"*)  \n\n3. **Vocabulary & Register:**  \n   - Industry-specific terms contextualized immediately (e.g., "prototyping... a playable, polished version")  \n   - Action verbs ("craft," "map out," "flesh out")  \n   - Mild colloquialisms for emphasis ("under my belt," "rock and roll") balanced with professional phrasing  \n\n4. **Structural Patterns:**  \n   - Organize content into titled thematic sections ending with targeted reflection questions  \n   - Integrate concrete game examples as anchors for abstract concepts (e.g., "Sunset Overdrive: \'Rock and roll end times\'")  \n   - Use bullet points sparingly for checklists or multi-part examples  \n\n5. **Flow & Cadence:**  \n   - Transition logically between conceptual framing ("Develop the Concept") and practical steps ("Prototyping & Building")  \n   - Conclude sections with implementation reminders ("Start playtesting early")  \n   - End with an uplifting, concise call to action ("Have fun!")  \n\n**Prohibited Styles:** Avoid academic formality, excessive jargon without explanation, passive voice, or detached third-person perspective. Maintain energetic practicality throughout.',
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
  },

  // Keep all your existing UI methods...
  UI: {
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
  },

  MainLogic: {
    init: function () {
      App.UI.init();
      // Hide save button if no messages
      if (App.Elements.saveChatBtn) {
        const hasMessages =
          App.Elements.messages && App.Elements.messages.children.length > 0;
        App.Elements.saveChatBtn.style.display = hasMessages
          ? "inline-flex"
          : "none";
      }
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
      // Load last used model for current provider
      const providerId = App.State.currentProvider;
      const lastSelectedModel = localStorage.getItem(`lastModel_${providerId}`);
      if (lastSelectedModel && App.Elements.modelSelect) {
        App.Elements.modelSelect.value = lastSelectedModel;
        // Optionally update the display text if needed
        const selectedOption = App.Elements.modelSelect.querySelector(
          `option[value='${lastSelectedModel}']`
        );
        if (selectedOption && App.Elements.customModelSelectDisplayText) {
          App.Elements.customModelSelectDisplayText.textContent = `${selectedOption.value} - ${selectedOption.textContent}`;
        }
      }
      App.MainLogic.initPDFUpload();
      App.MainLogic.initReasoningToggle();
      App.UI.updateRateLimitStatus();

      // PDF Drag-and-Drop functionality
      const dropZone = App.Elements.messages;
      if (dropZone) {
        // Visual feedback class
        const dragOverClass = "pdf-dragover";
        dropZone.addEventListener("dragover", function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add(dragOverClass);
        });
        dropZone.addEventListener("dragleave", function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove(dragOverClass);
        });
        dropZone.addEventListener("drop", function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove(dragOverClass);
          const files = e.dataTransfer.files;
          if (files && files.length > 0) {
            const file = files[0];
            if (file.type === "application/pdf") {
              App.MainLogic.ensurePDFJS(() =>
                App.MainLogic.handlePDFUpload(file)
              );
            } else {
              alert("Please drop a PDF file.");
            }
          }
        });
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

      console.log("SendMessage called for provider:", S.currentProvider);
      console.log("Current provider config:", currentProvider);
      console.log("API Key present:", !!currentProvider.apiKey);
      console.log("Selected model:", E.modelSelect.value);
      console.log("Available models:", S.models.length);

      UI.updateRateLimitStatus();

      // Rate limit check
      /* if (!App.MainLogic.checkRateLimit(S.currentProvider)) {
        alert("Daily rate limit reached for this provider.");
        UI.setStatus("Daily rate limit exceeded.");
        return;
      } */

      const selectedModel = E.modelSelect.value;
      const message = E.messageInput.value.trim();

      if (!message || S.isGenerating) {
        console.log("Returning early: no message or already generating");
        return;
      }
      if (!currentProvider.apiKey) {
        console.log("No API key, opening config");
        App.Config.open();
        setTimeout(() => {
          if (E.apiKeyInput) E.apiKeyInput.focus();
        }, 100);
        return;
      }
      if (!selectedModel) {
        console.log("No model selected, showing alert");
        alert("Please select a model from the dropdown.");
        return;
      }

      S.isGenerating = true;
      E.sendBtn.disabled = true;
      E.messageInput.disabled = true;
      E.sendBtnText.classList.add("hidden");
      E.sendBtnLoading.classList.remove("hidden");

      // Compose context with PDF if present
      let context = message;
      let pdfAttachment = null;
      if (S.pdfText) {
        context = `[PDF: ${S.pdfFileName}]\n${S.pdfText}\n---\n${message}`;
        pdfAttachment = S.pdfFileName;
        App.MainLogic.clearPDFContext();
        if (E.pdfUpload) E.pdfUpload.value = "";
      }

      UI.addMessage(
        message,
        "user",
        pdfAttachment ? { attachment: pdfAttachment } : undefined
      );
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
      // Add the new user message at the end
      messagesPayload.push({ role: "user", content: context });

      const now = Date.now();
      App.MainLogic.incrementUsage(S.currentProvider);
      UI.updateRateLimitStatus();

      try {
        const nonStreamProviders = ["cohere", "huggingface", "googleaistudio"];
        const useStream = !nonStreamProviders.includes(S.currentProvider);

        const response = await App.API.fetchChatCompletion({
          model: selectedModel,
          messages: messagesPayload,
          stream: useStream,
          max_tokens: S.maxTokens,
          temperature: 0.7,
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(
            `HTTP ${response.status}: ${response.statusText} - ${errorBody}`
          );
        }

        UI.hideLoadingMessage();
        UI.setStatus("Receiving response...", true);

        if (useStream) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.substring(6);
                  if (data === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      if (!assistantMessageDiv) {
                        assistantMessageDiv = UI.addMessage("", "assistant");
                      }
                      assistantContent += content;
                      assistantMessageDiv.dataset.rawContent = assistantContent;
                      const messageTextContent =
                        assistantMessageDiv.querySelector(
                          ".message-text-content"
                        );
                      if (messageTextContent) {
                        messageTextContent.innerHTML =
                          marked.parse(assistantContent);
                      }
                      if (S.autoScrollEnabled) {
                        E.messages.scrollTop = E.messages.scrollHeight;
                      }
                    }
                  } catch (e) {
                    console.error(
                      "Error parsing stream chunk:",
                      e,
                      "Chunk:",
                      data
                    );
                  }
                }
              }
            }
          }
        } else {
          const result = await response.json();
          let content = null;

          if (S.currentProvider === "googleaistudio") {
            content = result.candidates?.[0]?.content?.parts?.[0]?.text;
          } else if (S.currentProvider === "cohere") {
            content = result.text;
          } else {
            content = result.choices?.[0]?.message?.content;
          }

          if (content) {
            assistantMessageDiv = UI.addMessage(content, "assistant");
          } else {
            throw new Error(
              `No content found in ${
                currentProvider.name
              } response: ${JSON.stringify(result)}`
            );
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
      if (App.Elements.saveChatBtn) {
        App.Elements.saveChatBtn.style.display = "none";
      }
      if (confirm("Clear all messages?")) {
        App.Elements.messages.innerHTML = "";
        App.UI.setStatus("Chat cleared");
      }
    },
    saveChatAsMarkdown: function () {
      const E = App.Elements;
      const messages = E.messages?.querySelectorAll(".message");
      if (!messages || messages.length === 0) {
        alert("No messages to save.");
        return;
      }

      // Session header
      const now = new Date();
      let md = `# Chat Transcript\n\n`;
      md += `**Session Start:** ${now.toLocaleString()}\n\n---\n\n`;

      messages.forEach((msg) => {
        const role = msg.classList.contains("user") ? "User" : "AI";
        const timestamp = msg.dataset.timestamp
          ? new Date(Number(msg.dataset.timestamp)).toLocaleTimeString()
          : "";

        // Attachment info
        let attachmentInfo = "";
        const attachmentDiv = msg.querySelector(".message-attachment");
        if (attachmentDiv) {
          const name =
            attachmentDiv.querySelector(".attachment-name")?.textContent || "";
          attachmentInfo = `\n\n*Attachment: \`${name}\` included in this message.*\n`;
        }

        // Prefer rawContent for markdown, fallback to textContent
        let content = msg.dataset.rawContent || "";
        // Remove foldable quote HTML and any other HTML tags for AI
        if (role === "AI") {
          content = content.replace(
            /<div class="foldable-quote"[\s\S]*?<\/div>/g,
            ""
          );
          content = content.replace(/<[^>]+>/g, "");
        }

        // If user message looks like code, wrap in code block
        if (role === "User" && /^```|[\n\r] {4,}/.test(content)) {
          // Already a code block or indented, leave as is
        } else if (
          role === "User" &&
          /[;{}=<>]/.test(content) &&
          content.length < 500
        ) {
          // Heuristic: looks like code, wrap in code block
          content = "```\n" + content.trim() + "\n```";
        }

        md += `### ${role}${
          timestamp ? " — " + timestamp : ""
        }\n\n${content.trim()}${attachmentInfo}\n\n---\n\n`;
      });

      // Download as .md file
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-${now
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.md`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    },
    initPDFUpload: function () {
      const pdfBtn = document.getElementById("pdfUploadBtn");
      const pdfInput = document.getElementById("pdfUpload");
      if (pdfBtn && pdfInput) {
        pdfBtn.onclick = () => {
          App.MainLogic.ensurePDFJS(() => pdfInput.click());
        };
        pdfInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file && file.type === "application/pdf") {
            App.MainLogic.ensurePDFJS(() =>
              App.MainLogic.handlePDFUpload(file)
            );
          } else {
            alert("Please select a PDF file.");
          }
        };
      }
    },

    handlePDFUpload: async function (file) {
      if (!window.pdfjsLib) {
        alert("PDF.js library not loaded yet.");
        return;
      }
      const reader = new FileReader();
      reader.onload = async function (e) {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await window.pdfjsLib.getDocument({ data: typedarray })
          .promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + "\n";
        }
        App.State.pdfText = text;
        App.State.pdfFileName = file.name;
        App.UI.setStatus(
          `PDF "${file.name}" loaded. Will be sent as context with your next message.`
        );
      };
      reader.readAsArrayBuffer(file);
    },

    clearPDFContext: function () {
      App.State.pdfText = null;
      App.State.pdfFileName = null;
    },

    incrementUsage: function (provider) {
      const today = new Date().toISOString().slice(0, 10);
      if (!App.State.usage[provider][today])
        App.State.usage[provider][today] = 0;
      App.State.usage[provider][today]++;
      localStorage.setItem(
        `usage_${provider}_${today}`,
        App.State.usage[provider][today]
      );
    },

    getUsage: function (provider) {
      const today = new Date().toISOString().slice(0, 10);
      let usage = App.State.usage[provider][today];
      if (usage == null) {
        usage = parseInt(
          localStorage.getItem(`usage_${provider}_${today}`) || "0",
          10
        );
        App.State.usage[provider][today] = usage;
      }
      return usage;
    },

    checkRateLimit: function (provider) {
      const limit = App.State.rateLimits[provider]?.daily || 99999;
      const usage = App.MainLogic.getUsage(provider);
      return usage < limit;
    },

    getRateLimitStatus: function (provider) {
      const limit = App.State.rateLimits[provider]?.daily || 99999;
      const usage = App.MainLogic.getUsage(provider);
      return `${usage}/${limit} today`;
    },

    initReasoningToggle: function () {
      const toggle = document.getElementById("reasoningToggle");
      if (toggle) {
        toggle.checked = App.State.reasoningEnabled;
        toggle.onchange = (e) => {
          App.State.reasoningEnabled = !!e.target.checked;
        };
      }
      const effort = document.getElementById("reasoningEffort");
      if (effort) {
        effort.value = App.State.maxTokens;
        effort.onchange = (e) => {
          let val = parseInt(e.target.value, 10);
          if (isNaN(val) || val < 256) val = 256;
          if (val > 8192) val = 8192;
          App.State.maxTokens = val;
          e.target.value = val;
        };
      }
    },

    // Improved PDF.js loader
    ensurePDFJS: function (callback) {
      if (window.pdfjsLib && window.pdfjsLib.getDocument) {
        callback();
        return;
      }
      if (!window._pdfjsLoading) {
        window._pdfjsLoading = true;
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
          setTimeout(callback, 100); // Give a moment for the lib to be ready
        };
        document.head.appendChild(script);
      } else {
        // If already loading, poll until ready
        const check = () => {
          if (window.pdfjsLib && window.pdfjsLib.getDocument) callback();
          else setTimeout(check, 100);
        };
        check();
      }
    },
  },
};

document.addEventListener("DOMContentLoaded", App.MainLogic.init);
