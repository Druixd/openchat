const App = {
  State: {
    apiKey: localStorage.getItem("openrouter_api_key") || "",
    userSystemPrompt:
      localStorage.getItem("openrouter_user_system_prompt") || "",
    autoScrollEnabled:
      localStorage.getItem("openrouter_auto_scroll") === null
        ? true
        : localStorage.getItem("openrouter_auto_scroll") === "true",
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
  },

  Elements: {
    header: null,
    configBtn: null,
    clearBtn: null,
    modelSelect: null,
    customModelSelectWrapper: null,
    customModelSelectDisplay: null,
    customModelSelectDisplayText: null,
    customModelSelectDropdown: null,
    customModelSearchInput: null,
    customModelList: null,
    refreshBtn: null,
    freeToggle: null,
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
    newStyleName: null,
    saveStyleBtn: null,
    deleteStyleBtn: null,
    analyzeStyleModal: null,
    openAnalyzeModalBtn: null,
    closeAnalyzeModalBtn: null,
    styleSampleText: null,
    analyzedStyleName: null,
    analysisStatus: null,
    analysisStatusText: null,
    analyzeAndCreateBtn: null,
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

  UI: {
    init: function () {
      const E = App.Elements;
      E.header = document.querySelector(".header");
      E.configBtn = document.getElementById("configBtn");
      E.clearBtn = document.getElementById("clearBtn");
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
      E.freeToggle = document.getElementById("freeToggle");
      E.messages = document.getElementById("messages");
      E.statusLoading = document.getElementById("statusLoading");
      E.statusText = document.getElementById("statusText");
      E.messageInput = document.getElementById("messageInput");
      E.sendBtn = document.getElementById("sendBtn");
      E.sendBtnText = document.getElementById("sendBtnText");
      E.sendBtnLoading = document.getElementById("sendBtnLoading");
      E.configModal = document.getElementById("configModal");
      E.closeConfigBtn = document.getElementById("closeConfigBtn");
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
      E.newStyleName = document.getElementById("newStyleName");
      E.saveStyleBtn = document.getElementById("saveStyleBtn");
      E.deleteStyleBtn = document.getElementById("deleteStyleBtn");
      E.analyzeStyleModal = document.getElementById("analyzeStyleModal");
      E.openAnalyzeModalBtn = document.getElementById("openAnalyzeModalBtn");
      E.closeAnalyzeModalBtn = document.getElementById("closeAnalyzeModalBtn");
      E.styleSampleText = document.getElementById("styleSampleText");
      E.analyzedStyleName = document.getElementById("analyzedStyleName");
      E.analysisStatus = document.getElementById("analysisStatus");
      E.analysisStatusText = document.getElementById("analysisStatusText");
      E.analyzeAndCreateBtn = document.getElementById("analyzeAndCreateBtn");

      App.UI.updateAutoScrollToggleUI();
      App.UI.updateFreeOnlyToggleUI();
      App.UI.updateRateLimitStatus();

      E.messageInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = Math.min(this.scrollHeight, 120) + "px";
      });
      E.messageInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          App.MainLogic.sendMessage();
        }
      });
      E.configBtn.addEventListener("click", App.Config.open);
      E.clearBtn.addEventListener("click", App.MainLogic.clearChat);
      E.refreshBtn.addEventListener("click", App.MainLogic.refreshModels);
      E.freeToggle.addEventListener("click", App.MainLogic.toggleFreeOnly);
      E.sendBtn.addEventListener("click", App.MainLogic.sendMessage);
      E.closeConfigBtn.addEventListener("click", App.Config.close);
      E.autoScrollToggleInput.addEventListener(
        "click",
        App.Config.toggleAutoScroll
      );
      E.saveConfigBtn.addEventListener("click", App.Config.save);
      E.customModelSelectDisplay.addEventListener(
        "click",
        App.UI.toggleCustomModelSelect
      );
      E.customModelSearchInput.addEventListener(
        "input",
        App.UI.filterCustomModelOptions
      );
      E.customModelList.addEventListener(
        "click",
        App.UI.handleCustomModelOptionSelect
      );
      E.writingStyleSelect.addEventListener(
        "change",
        App.Styles.handleStyleSelectChange
      );
      E.saveStyleBtn.addEventListener("click", () => App.Styles.save(false));
      E.deleteStyleBtn.addEventListener("click", App.Styles.delete);
      E.openAnalyzeModalBtn.addEventListener("click", () => {
        E.analyzeStyleModal.style.display = "block";
      });
      E.closeAnalyzeModalBtn.addEventListener("click", () => {
        E.analyzeStyleModal.style.display = "none";
      });
      E.analyzeAndCreateBtn.addEventListener(
        "click",
        App.Styles.analyzeFromText
      );

      document.addEventListener("click", function (event) {
        if (
          App.State.isCustomSelectOpen &&
          E.customModelSelectWrapper &&
          !E.customModelSelectWrapper.contains(event.target)
        ) {
          App.UI.closeCustomModelSelect();
        }
        if (event.target === E.analyzeStyleModal) {
          E.analyzeStyleModal.style.display = "none";
        }
      });
    },

    updateRateLimitStatus: function () {
      const S = App.State;
      const E = App.Elements;
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const recentRequests = S.requestTimestamps.filter(
        (t) => t > oneMinuteAgo
      );
      if (E.rateLimitStatus) {
        E.rateLimitStatus.textContent = `${recentRequests.length}/10 per minute`;
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

    filterCustomModelOptions: function () {
      const E = App.Elements;
      const searchTerm = E.customModelSearchInput.value.toLowerCase().trim();
      const listItems = E.customModelList.getElementsByTagName("li");
      let hasVisibleOptions = false;

      for (let item of listItems) {
        if (item.classList.contains("no-models")) {
          item.style.display = "list-item";
          continue;
        }
        const itemText = item.textContent.toLowerCase();
        if (itemText.includes(searchTerm)) {
          item.classList.remove("hidden-option");
          hasVisibleOptions = true;
        } else {
          item.classList.add("hidden-option");
        }
      }
      const noModelsLi = E.customModelList.querySelector(".no-models");
      if (noModelsLi && listItems.length > 1) {
        noModelsLi.style.display = hasVisibleOptions ? "none" : "list-item";
        if (!hasVisibleOptions)
          noModelsLi.textContent = "No models match search.";
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
      }
    },

    populateCustomModelSelect: function () {
      const S = App.State;
      const E = App.Elements;
      E.customModelList.innerHTML = "";
      const placeholderText = "Select a model...";
      let currentSelectedNativeValue = E.modelSelect.value;
      let currentDisplayText = placeholderText;
      let foundSelectedInNewList = false;

      const modelsToDisplay = S.freeOnly
        ? S.models.filter((model) => model.id.includes(":free"))
        : S.models;

      E.modelSelect.innerHTML = `<option value="">${placeholderText}</option>`;

      if (modelsToDisplay.length === 0) {
        E.customModelList.innerHTML =
          '<li class="no-models">No models available.</li>';
        E.customModelSelectDisplayText.textContent = "No models";
        App.UI.setStatus("0 models available");
        App.UI.filterCustomModelOptions();
        return;
      }

      modelsToDisplay.forEach((model) => {
        const li = document.createElement("li");
        li.textContent = `${model.id} - ${model.name || "Unknown"}`;
        li.dataset.value = model.id;
        E.customModelList.appendChild(li);

        const option = document.createElement("option");
        option.value = model.id;
        option.textContent = li.textContent;
        E.modelSelect.appendChild(option);

        if (model.id === currentSelectedNativeValue) {
          currentDisplayText = li.textContent;
          li.classList.add("selected-option");
          E.modelSelect.value = currentSelectedNativeValue;
          foundSelectedInNewList = true;
        }
      });

      if (!foundSelectedInNewList) {
        E.modelSelect.value = "";
        currentDisplayText = placeholderText;
      }
      E.customModelSelectDisplayText.textContent = currentDisplayText;

      App.UI.filterCustomModelOptions();
      App.UI.setStatus(`${modelsToDisplay.length} models available`);
    },
    updateAutoScrollToggleUI: function () {
      App.Elements.autoScrollToggleInput.classList.toggle(
        "active",
        App.State.autoScrollEnabled
      );
    },
    updateFreeOnlyToggleUI: function () {
      App.Elements.freeToggle.classList.toggle("active", App.State.freeOnly);
    },
    setStatus: function (message, loading = false) {
      App.Elements.statusText.textContent = message;
      App.Elements.statusLoading.style.display = loading ? "block" : "none";
    },
    showLoadingMessage: function () {
      const E = App.Elements;
      App.State.loadingMessageDiv = document.createElement("div");
      App.State.loadingMessageDiv.className = "loading-message";
      App.State.loadingMessageDiv.innerHTML = `
                <span>Generating response</span>
                <div class="loading-dots">
                    <div class="loading-dot"></div> <div class="loading-dot"></div> <div class="loading-dot"></div>
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
                <div class="thinking-header"><div class="thinking-icon"></div><span>Thinking...</span></div>
                <div class="thinking-content"></div>`;

      E.messages.appendChild(thinkingContainer);
      S.currentThinkingDiv =
        thinkingContainer.querySelector(".thinking-content");

      if (S.autoScrollEnabled) E.messages.scrollTop = E.messages.scrollHeight;
    },

    updateThinkingContent: function (newThinkingText) {
      const S = App.State;
      if (S.currentThinkingDiv) {
        S.currentThinkingDiv.textContent = `\`\`\`\n${newThinkingText}\n\`\`\``;
        S.currentThinkingDiv.scrollTop = S.currentThinkingDiv.scrollHeight;
      }
    },

    addMessage: function (rawContent, role) {
      const E = App.Elements;
      const S = App.State;
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${role}`;
      messageDiv.dataset.rawContent = rawContent;

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
      const S = App.State;
      if (!S.apiKey) return null;
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${S.apiKey}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    },

    fetchChatCompletion: async function (payload) {
      const S = App.State;
      return await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${S.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
          "X-Title": "OpenRouter Chat Tool",
        },
        body: JSON.stringify(payload),
      });
    },
  },

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
    save: function (isFromAnalyze = false) {
      const E = App.Elements;
      const S = App.State;
      const name = isFromAnalyze
        ? E.analyzedStyleName.value.trim()
        : E.newStyleName.value.trim();
      const content = E.writingStyleContent.value.trim();

      if (!name) {
        alert("Please enter a name for the style.");
        return false;
      }
      if (!content && !isFromAnalyze) {
        alert("Style content is empty. Cannot save.");
        return false;
      }
      if (!content && isFromAnalyze) {
        // This case would be after a failed analysis, so we just exit.
        return false;
      }

      const existingIndex = S.writingStyles.findIndex((s) => s.name === name);
      const isDefault = App.Constants.DEFAULT_STYLES.some(
        (s) => s.name === name
      );

      if (existingIndex !== -1 && isDefault) {
        alert("You cannot overwrite a default style.");
        return false;
      }

      if (existingIndex !== -1) {
        S.writingStyles[existingIndex].content = content;
      } else {
        S.writingStyles.push({ name, content });
      }

      App.Styles.persist();
      App.Styles.populateSelect();
      E.writingStyleSelect.value = name;
      S.selectedStyleName = name;
      localStorage.setItem("openrouter_selected_style", S.selectedStyleName);

      if (!isFromAnalyze) {
        E.newStyleName.value = "";
        alert(`Style '${name}' saved successfully.`);
      }
      return true;
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
      if (!S.apiKey) {
        alert("API Key is not set. Please set it in the configuration.");
        return;
      }
      if (!selectedModel) {
        alert(
          "Please select a model on the main screen first. A powerful model is recommended for analysis."
        );
        return;
      }
      if (!sampleText || !newName) {
        alert("Please provide both a sample text and a name for the new style.");
        return;
      }

      S.isAnalyzingStyle = true;
      E.analysisStatus.style.display = "flex";
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
          throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        const generatedContent = result.choices?.[0]?.message?.content;

        if (!generatedContent) {
          throw new Error("The API returned an empty analysis. Please try again.");
        }

        E.writingStyleContent.value = generatedContent.trim();
        const saved = App.Styles.save(true);

        if (saved) {
          alert(`Style '${newName}' created successfully from your text!`);
          E.analyzeStyleModal.style.display = "none";
          E.styleSampleText.value = "";
          E.analyzedStyleName.value = "";
        }
      } catch (error) {
        console.error("Error analyzing style:", error);
        alert(`Failed to analyze style: ${error.message}`);
      } finally {
        S.isAnalyzingStyle = false;
        E.analysisStatus.style.display = "none";
        E.analyzeAndCreateBtn.disabled = false;
      }
    },
  },

  Config: {
    open: function () {
      const S = App.State;
      const E = App.Elements;
      E.apiKeyInput.value = S.apiKey;
      E.userSystemPromptInput.value = S.userSystemPrompt;
      App.UI.updateAutoScrollToggleUI();
      App.Styles.init();
      E.configModal.style.display = "block";
    },
    close: function () {
      App.Elements.configModal.style.display = "none";
    },
    save: function () {
      const S = App.State;
      const E = App.Elements;
      S.apiKey = E.apiKeyInput.value.trim();
      S.userSystemPrompt = E.userSystemPromptInput.value.trim();

      localStorage.setItem("openrouter_api_key", S.apiKey);
      localStorage.setItem("openrouter_user_system_prompt", S.userSystemPrompt);
      localStorage.setItem("openrouter_auto_scroll", S.autoScrollEnabled);

      App.Config.close();
      if (S.apiKey) App.MainLogic.refreshModels();
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
      if (App.State.apiKey) {
        App.MainLogic.refreshModels();
      } else {
        App.Elements.customModelSelectDisplayText.textContent = "Set API Key";
        App.Elements.customModelList.innerHTML =
          '<li class="no-models">Set API Key to load models.</li>';
      }
    },
    toggleFreeOnly: function () {
      App.State.freeOnly = !App.State.freeOnly;
      App.UI.updateFreeOnlyToggleUI();
      App.UI.populateCustomModelSelect();
    },
    refreshModels: async function () {
      const S = App.State;
      const E = App.Elements;
      const UI = App.UI;

      if (!S.apiKey) {
        alert("Please set your API key first");
        App.Config.open();
        E.customModelSelectDisplayText.textContent = "Set API Key";
        E.customModelList.innerHTML =
          '<li class="no-models">Set API Key to load models.</li>';
        return;
      }
      E.refreshBtn.disabled = true;
      UI.setStatus("Fetching models...", true);
      E.customModelSelectDisplayText.textContent = "Loading...";
      try {
        const data = await App.API.fetchModels();
        S.models = data.data || [];
        UI.populateCustomModelSelect();
      } catch (error) {
        console.error("Error fetching models:", error);
        UI.setStatus(`Error: ${error.message}`);
        alert("Failed to fetch models. Please check your API key.");
        E.customModelSelectDisplayText.textContent = "Error";
        E.customModelList.innerHTML =
          '<li class="no-models">Error loading models.</li>';
      } finally {
        E.refreshBtn.disabled = false;
      }
    },
    sendMessage: async function () {
      const S = App.State;
      const E = App.Elements;
      const UI = App.UI;

      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      S.requestTimestamps = S.requestTimestamps.filter(
        (timestamp) => timestamp > oneMinuteAgo
      );
      UI.updateRateLimitStatus();

      if (S.requestTimestamps.length >= 10) {
        alert("Rate limit exceeded (10 messages per minute). Please wait.");
        UI.setStatus("Rate limit exceeded.");
        return;
      }

      const selectedModel = E.modelSelect.value;
      const message = E.messageInput.value.trim();

      if (!message || !S.apiKey || S.isGenerating) return;
      if (!selectedModel) {
        alert("Please select a model from the dropdown.");
        return;
      }

      S.isGenerating = true;
      E.sendBtn.disabled = true;
      E.messageInput.disabled = true;
      E.sendBtnText.style.display = "none";
      E.sendBtnLoading.style.display = "block";

      UI.addMessage(message, "user");
      E.messageInput.value = "";
      E.messageInput.style.height = "auto";

      UI.setStatus("Waiting for response...", true);
      UI.showLoadingMessage();

      let assistantMessageDiv = null;
      let assistantContent = "";
      S.currentThinkingDiv = null;

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

      S.requestTimestamps.push(now);
      UI.updateRateLimitStatus();

      try {
        const response = await App.API.fetchChatCompletion({
          model: selectedModel,
          messages: messagesPayload,
          stream: true,
        });
        if (!response.ok)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        UI.hideLoadingMessage();
        UI.setStatus("Receiving response...", true);

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
                const delta = parsed.choices?.[0]?.delta;

                if (delta?.thinking) {
                  if (!S.currentThinkingDiv) UI.addThinkingBlock();
                  UI.updateThinkingContent(delta.thinking);
                }
                if (delta?.content) {
                  if (!assistantMessageDiv) {
                    assistantMessageDiv = UI.addMessage("", "assistant");
                  }
                  assistantContent += delta.content;
                  assistantMessageDiv.dataset.rawContent = assistantContent;
                  assistantMessageDiv.querySelector(
                    ".message-text-content"
                  ).innerHTML = marked.parse(assistantContent);
                  if (S.autoScrollEnabled)
                    E.messages.scrollTop = E.messages.scrollHeight;
                }
              } catch (e) {
                /* console.warn('Stream parsing error:', e, data); */
              }
            }
          }
        }
        UI.setStatus("Response complete");
      } catch (error) {
        console.error("Error in sendMessage:", error);
        UI.hideLoadingMessage();
        const errorMsg = `Error: ${error.message}`;
        if (!assistantMessageDiv) UI.addMessage(errorMsg, "assistant");
        else {
          assistantContent += `\n\n**${errorMsg}**`;
          assistantMessageDiv.dataset.rawContent = assistantContent;
          assistantMessageDiv.querySelector(
            ".message-text-content"
          ).innerHTML = marked.parse(assistantContent);
        }
        UI.setStatus(errorMsg);
      } finally {
        S.isGenerating = false;
        E.sendBtn.disabled = false;
        E.messageInput.disabled = false;
        E.sendBtnText.style.display = "block";
        E.sendBtnLoading.style.display = "none";
        S.currentThinkingDiv = null;
        if (S.autoScrollEnabled)
          E.messages.scrollTop = E.messages.scrollHeight;
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