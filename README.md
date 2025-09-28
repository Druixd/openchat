# Open Chat

A modern, privacy-focused AI chat application that provides a unified interface for interacting with multiple AI providers. Built as a Progressive Web App (PWA) for seamless cross-platform experience.

![alt text](public/icons/ohat_icon.png)

## 🌟 Features

### Multi-Provider AI Support
- **6 AI Providers**: OpenRouter, Google AI Studio, SiliconFlow, Hugging Face, Cohere, and Moonshot AI
- **Dynamic Model Loading**: Real-time model discovery and filtering
- **Free Model Highlighting**: Easy identification of cost-effective options
- **Provider Quick-Switch**: Fast switching between AI providers via floating menu

### Writing Style System
- **Style Analysis**: Paste any text sample to analyze and clone writing patterns
- **Custom Style Guides**: Create personalized AI response styles
- **System Prompt Integration**: Combine custom styles with system instructions for precise control

### AI Learning & Experimentation Tools
- **Model Comparison**: Test different AI models side-by-side
- **Behavior Analysis**: Understand how different prompts affect AI responses
- **Experimentation-Friendly**: Designed for testing and learning AI capabilities

### Privacy & Performance
- **Local-First Architecture**: Everything runs in your browser, no server dependencies
- **Privacy-Focused**: API keys stored locally, no data collection
- **Instant Loading**: No network delays, works offline for interface interactions
- **Lightweight**: Optimized for speed and performance

### User Experience
- **Ephemeral by Default**: Fresh chat sessions with optional saving
- **Flexible Export**: Plain text and Markdown export options
- **Dark Mode**: Built-in dark/light theme support
- **Mobile Optimized**: Responsive design for all screen sizes
- **Auto-scroll**: Automatic scrolling to keep up with responses
- **PDF Integration**: Drag-and-drop PDF processing for context

## 🚀 Quick Start

### Option 1: Direct Use
1. Open `index.html` in any modern web browser
2. Configure your API keys in the settings panel
3. Start chatting with your preferred AI models

### Option 2: Local Development Server
```bash
# Serve the files using any static server
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

## ⚙️ Configuration

### API Key Setup
1. Click the gear icon (⚙️) to open configuration
2. Select your preferred AI provider
3. Enter your API key for the chosen provider
4. Save configuration

### Supported Providers

| Provider | Setup Requirements |
|----------|-------------------|
| **OpenRouter** | Get key from [openrouter.ai](https://openrouter.ai) |
| **Google AI Studio** | Get key from [aistudio.google.com](https://aistudio.google.com) |
| **SiliconFlow** | Get key from SiliconFlow platform |
| **Hugging Face** | Get key from [huggingface.co](https://huggingface.co) |
| **Cohere** | Get key from [cohere.com](https://cohere.com) |
| **Moonshot AI** | Get key from Moonshot AI platform |

### Writing Style Configuration
1. Go to Configuration → Writing Style
2. Select from pre-built styles or create custom ones
3. Use "Create New Style From Text" to analyze your writing samples
4. Apply styles to get personalized AI responses

## 📱 Progressive Web App

Open Chat is a fully-featured PWA that can be installed on:
- Desktop computers (Windows, macOS, Linux)
- Mobile devices (Android, iOS)
- Tablets

### Installation
1. Open in a modern browser (Chrome, Firefox, Safari, Edge)
2. Look for the "Install" or "Add to Home Screen" prompt
3. Follow browser-specific installation steps

## 🛠️ Technical Details

### Architecture
- **Vanilla JavaScript**: No framework dependencies
- **Modular Design**: Separate concerns across multiple files
- **Local Storage**: Browser-based configuration persistence
- **Service Worker**: Offline functionality and caching

### File Structure
```
openchat/
├── index.html          # Main application
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for PWA features
├── css/
│   └── style.css      # Application styles
├── js/
│   ├── app.js         # Main application logic
│   ├── api.js         # AI provider communication
│   ├── config.js      # Configuration management
│   ├── ui.js          # User interface components
│   ├── styles.js      # Writing style system
│   └── ...            # Additional modules
└── icons/             # PWA icons
```

### Browser Compatibility
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Required Features**: ES6 support, LocalStorage, Service Workers
- **Mobile**: iOS Safari 13+, Android Chrome 80+

## 🎯 Use Cases

### For Designers
- Test AI-generated design descriptions
- Experiment with different writing styles
- Get feedback on creative concepts

### For Developers
- Test API integrations across providers
- Compare model performance
- Debug AI-generated code snippets

### For Writers
- Experiment with different tones and styles
- Get inspiration for various writing scenarios
- Analyze and replicate writing patterns

### For AI Enthusiasts
- Compare model capabilities
- Understand AI behavior patterns
- Learn through hands-on experimentation

## 🔧 Development

### Adding New Providers
1. Add provider configuration to `js/config.js`
2. Implement API communication in `js/api.js`
3. Update provider selection UI in `index.html`
4. Add provider icons to `icons/providers/`

### Customizing Styles
1. Modify `css/style.css` for visual changes
2. Add new style templates to `js/styles.js`
3. Update theme variables for consistent theming

### Building for Production
```bash
# Simple deployment - just upload all files
# No build process required for basic functionality

# For optimized assets (optional)
# Add compression, minification, etc.
```

## 📄 Export & Sharing

### Saving Chats
- Click the save icon to export as Markdown
- Copy individual messages using right-click context menu
- Export includes timestamps and model information

### Style Sharing
- Export custom styles as JSON
- Share style configurations with others
- Import styles from the community

## 🐛 Troubleshooting

### Common Issues

**Models not loading**
- Check API key configuration
- Verify provider service status
- Check browser network connectivity

**Styles not applying**
- Ensure style is selected in configuration
- Check system prompt compatibility
- Verify provider supports style instructions

**PWA not installing**
- Use a supported browser
- Check if site is served over HTTPS (required for installation)
- Clear browser cache and try again

### Getting Help
- Check browser console for error messages
- Verify API key validity with provider
- Test with different AI providers

## 🤝 Contributing

Open Chat is designed as a learning tool and portfolio project. Contributions for educational purposes are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across different providers
5. Submit a pull request

## 📄 License

This project is created for educational and portfolio purposes. Feel free to use it as a reference or starting point for your own projects.

## 🙏 Acknowledgments

- AI providers for their excellent services
- Open source community for inspiration and tools
- Modern web standards that make PWAs possible

---

**Built with ❤️ for Everyone** | A designer's approach to understanding and controlling AI interactions.