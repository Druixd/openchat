// Configuration and State Management
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
    darkMode: localStorage.getItem("openrouter_dark_mode") !== "false",
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
          'Adopt an instructive yet conversational tone, blending professional guidance with approachable mentorship. Structure content with clear topical headers followed by concise, actionable advice. Use game design terminology precisely ("core loop," "vertical slice," "FTUE," "game pillars") while keeping explanations accessible.\n\n**Key Style Requirements:**\n1. **Tone & Voice:**  \n   - Second-person address ("you\'ll," "your players")  \n   - Confident yet humble expertise (e.g., "I\'ve learned," "in my experience")  \n   - Encouraging directives ("Always ask yourself," "Make sure to")  \n   - Sparse, purposeful first-person references to establish credibility without dominating  \n\n2. **Sentence Structure:**  \n   - Mix straightforward declarative sentences ("Designing onboarding is iterative") with punchy rhetorical questions ("Why implement features if players don\'t understand them?")  \n   - Average sentence length: 15-25 words. Prioritize clarity over complexity.  \n   - Emphasize key concepts through italics or quotation marks (e.g., *"trim the fat"*)  \n\n3. **Vocabulary & Register:**  \n   - Industry-specific terms contextualized immediately (e.g., "prototyping... a playable, polished version")  \n   - Action verbs ("craft," "map out," "flesh out")  \n   - Mild colloquialisms for emphasis ("under my belt," "rock and roll") balanced with professional phrasing  \n\n4. **Structural Patterns:**  \n   - Organize content into titled thematic sections ending with targeted reflection questions  \n   - Integrate concrete game examples as anchors for abstract concepts (e.g., "Sunset Overdrive: \'Rock and roll end times\'")  \n   - Use bullet points sparingly for checklists or multi-part examples  \n\n5. **Flow & Cadence:**  \n   - Transition logically between conceptual framing ("Develop the Concept") and practical steps ("Prototyping & Building")  \n   - Conclude sections with implementation reminders ("Start playtesting early")  \n   - End with an uplifting, concise call to action ("Have fun!")  \n\n**Prohibited Styles:** Avoid academic formality, excessive jargon without explanation, passive voice, detached third-person perspective. Maintain energetic practicality throughout.',
      },
    ],
  },
};