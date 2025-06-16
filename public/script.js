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
    loadingMessageDiv: null,
    currentThinkingDiv: null,
    DEFAULT_SYSTEM_PROMPT: "You should use simple words and no emojis.",
    OVERRIDE_COMMAND: "@override",
    isCustomSelectOpen: false,
    requestTimestamps: [], // To track request times for rate limiting
  },

  Elements: {
    header: null,
    configBtn: null,
    clearBtn: null,
    modelSelect: null, // This is now the HIDDEN native select
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

      App.UI.updateAutoScrollToggleUI();
      App.UI.updateFreeOnlyToggleUI();

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

      document.addEventListener("click", function (event) {
        if (
          App.State.isCustomSelectOpen &&
          E.customModelSelectWrapper &&
          !E.customModelSelectWrapper.contains(event.target)
        ) {
          App.UI.closeCustomModelSelect();
        }
        if (E.configModal && event.target === E.configModal) App.Config.close();
      });
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
          // Skip "no models" message
          item.style.display = "list-item"; // Always show if it's the only item
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
      // Show "no results" if applicable
      const noModelsLi = E.customModelList.querySelector(".no-models");
      if (noModelsLi && listItems.length > 1) {
        // Only if there are actual models to filter
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

      E.modelSelect.innerHTML = `<option value="">${placeholderText}</option>`; // Clear and add placeholder to native

      if (modelsToDisplay.length === 0) {
        E.customModelList.innerHTML =
          '<li class="no-models">No models available.</li>';
        E.customModelSelectDisplayText.textContent = "No models";
        App.UI.setStatus("0 models available");
        App.UI.filterCustomModelOptions(); // To ensure "no models" is shown if search is active
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
          E.modelSelect.value = currentSelectedNativeValue; // Ensure native is set
          foundSelectedInNewList = true;
        }
      });

      if (!foundSelectedInNewList) {
        E.modelSelect.value = ""; // Reset native if previous selection is gone
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

      // This function's job is to create the block and set S.currentThinkingDiv.
      // The check for whether to call this is in sendMessage.
      console.log("[UI.addThinkingBlock] Called.");

      const thinkingContainer = document.createElement("div");
      thinkingContainer.className = "thinking-container";
      thinkingContainer.innerHTML = `
                <div class="thinking-header"><div class="thinking-icon"></div><span>Thinking...</span></div>
                <div class="thinking-content"></div>`; // Content will be set by updateThinkingContent

      E.messages.appendChild(thinkingContainer);
      S.currentThinkingDiv =
        thinkingContainer.querySelector(".thinking-content");

      console.log(
        "[UI.addThinkingBlock] Thinking block added. S.currentThinkingDiv:",
        S.currentThinkingDiv
      );

      if (S.autoScrollEnabled) E.messages.scrollTop = E.messages.scrollHeight;
    },

    updateThinkingContent: function (newThinkingText) {
      const S = App.State;
      console.log(
        "[UI.updateThinkingContent] Called with text:",
        newThinkingText
      );
      if (S.currentThinkingDiv) {
        S.currentThinkingDiv.textContent = `\`\`\`\n${newThinkingText}\n\`\`\``;
        S.currentThinkingDiv.scrollTop = S.currentThinkingDiv.scrollHeight;
        console.log("[UI.updateThinkingContent] Content updated.");
      } else {
        console.warn(
          "[UI.updateThinkingContent] S.currentThinkingDiv is null. Cannot update."
        );
      }
    },

    populateModelSelect: function () {
      const E = App.Elements;
      const S = App.State;
      E.modelSelect.innerHTML = '<option value="">Select a model...</option>';
      const filteredModels = S.freeOnly
        ? S.models.filter((model) => model.id.includes(":free"))
        : S.models;
      filteredModels.forEach((model) => {
        const option = document.createElement("option");
        option.value = model.id;
        option.textContent = `${model.id} - ${model.name || "Unknown"}`;
        E.modelSelect.appendChild(option);
      });
      App.UI.setStatus(`${filteredModels.length} models available`);
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
        // txt
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
    /* ... (no changes) ... */
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

  Config: {
    /* ... (no changes) ... */
    open: function () {
      const S = App.State;
      const E = App.Elements;
      E.apiKeyInput.value = S.apiKey;
      E.userSystemPromptInput.value = S.userSystemPrompt;
      App.UI.updateAutoScrollToggleUI();
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

      // Rate Limiting Check
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      S.requestTimestamps = S.requestTimestamps.filter(
        (timestamp) => timestamp > oneMinuteAgo
      );

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

      let finalSystemPrompt = "";
      const userPromptLower = S.userSystemPrompt.toLowerCase();
      const overrideCmdLower = S.OVERRIDE_COMMAND.toLowerCase();

      if (userPromptLower.startsWith(overrideCmdLower)) {
        finalSystemPrompt = S.userSystemPrompt
          .substring(S.OVERRIDE_COMMAND.length)
          .trim();
      } else {
        finalSystemPrompt = S.DEFAULT_SYSTEM_PROMPT;
        if (S.userSystemPrompt) {
          finalSystemPrompt += " " + S.userSystemPrompt;
        }
      }
      finalSystemPrompt = finalSystemPrompt.trim();

      // Construct message payload with history
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

      // Add current request timestamp
      S.requestTimestamps.push(now);

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
          assistantMessageDiv.querySelector(".message-text-content").innerHTML =
            marked.parse(assistantContent);
        }
        UI.setStatus(errorMsg);
      } finally {
        S.isGenerating = false;
        E.sendBtn.disabled = false;
        E.messageInput.disabled = false;
        E.sendBtnText.style.display = "block";
        E.sendBtnLoading.style.display = "none";
        S.currentThinkingDiv = null;
        if (S.autoScrollEnabled) E.messages.scrollTop = E.messages.scrollHeight;
        E.messageInput.focus();
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