// API Interaction Module
App.API = {
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
    const signal = payload.signal;

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
        signal: signal,
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
      signal: signal,
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
};