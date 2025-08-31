// Main Application Logic Module
App.MainLogic = {
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

  retryLastMessage: async function () {
    const E = App.Elements;
    const S = App.State;
    const UI = App.UI;
    const currentProvider = App.Provider.getCurrentProvider();

    const messages = E.messages.querySelectorAll(".message");
    if (messages.length === 0) return;

    // Find the last assistant message
    let lastAssistantMessage = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].classList.contains("assistant")) {
        lastAssistantMessage = messages[i];
        break;
      }
    }
    if (!lastAssistantMessage) return;

    // Remove the last assistant message
    lastAssistantMessage.remove();

    // Build conversation history from remaining messages
    const messagesPayload = [];
    if (S.finalSystemPrompt) {
      messagesPayload.push({ role: "system", content: S.finalSystemPrompt });
    }
    messages.forEach((el) => {
      messagesPayload.push({
        role: el.classList.contains("user") ? "user" : "assistant",
        content: el.dataset.rawContent,
      });
    });

    // Set generating state
    S.isGenerating = true;
    E.sendBtn.disabled = true;
    E.messageInput.disabled = true;
    E.sendBtnText.classList.add("hidden");
    E.sendBtnLoading.classList.remove("hidden");

    UI.setStatus("Retrying response...", true);
    UI.showLoadingMessage();

    let assistantMessageDiv = null;

    try {
      const nonStreamProviders = ["cohere", "huggingface", "googleaistudio"];
      const useStream = !nonStreamProviders.includes(S.currentProvider);

      const response = await App.API.fetchChatCompletion({
        model: E.modelSelect.value,
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
        let assistantContent = "";
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
      console.error("Error in retryLastMessage:", error);
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
      if (S.autoScrollEnabled && E.messages) {
        E.messages.scrollTop = E.messages.scrollHeight;
      }
      E.messageInput.focus();
      UI.updateRateLimitStatus();
    }
  },
};