// Writing Styles Management Module
App.Styles = {
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
};