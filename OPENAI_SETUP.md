# OpenAI Integration Setup Guide

## Overview
The chatbot now uses OpenAI's GPT-3.5 Turbo model to provide intelligent responses about supplier certifications, quality standards, and business guidance for street vendors.

## Features

### 🤖 AI-Powered Chatbot
- **OpenAI GPT-3.5 Turbo** integration for natural language processing
- **Customizable System Prompt** - Train the AI according to your specific needs
- **Real-time Responses** with error handling and loading states
- **Conversation Memory** - AI remembers the context of your conversation
- **Token Usage Tracking** - Monitor API usage and costs

### ⚙️ Configuration Interface
- **System Prompt Editor** - Customize how the AI behaves and responds
- **API Key Validation** - Test your OpenAI API key before use
- **Local Storage** - Saves your custom system prompts
- **Error Management** - Clear error messages and troubleshooting

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account (create one if needed)
3. Click "Create new secret key"
4. Copy the generated API key (starts with `sk-`)

### 2. Configure Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Never commit your `.env.local` file to version control!

### 3. Test the Integration

1. Start the development server: `npm run dev`
2. Open the application in your browser
3. Click "Configure OpenAI API" to test your setup
4. Use the "Test" button to validate your API key
5. Start chatting with the AI assistant!

## Usage Guide

### Accessing the Chatbot
- Click the "AI Assistant" button in the header
- Or click "Ask AI Assistant" in the help section
- The chatbot opens as a floating window in the bottom-right corner

### Configuring the System Prompt
1. Click the ⚙️ (Settings) icon in the chatbot header
2. Modify the system prompt to customize AI behavior
3. Click "Save Changes" to apply your customizations
4. Use "Reset to Default" to restore original settings

### Example System Prompts

#### Default Prompt (Supplier Focus)
```
You are an AI assistant helping street vendors understand supplier certifications and quality standards. You specialize in:

1. BIS (Bureau of Indian Standards) certifications
2. ISO (International Organization for Standardization) certifications  
3. MSME (Micro, Small & Medium Enterprises) registration
4. Quality standards for different product categories
5. Supplier verification processes
6. Price negotiation tips

Provide clear, practical advice in simple language that street vendors can easily understand.
```

#### Custom Business Advisor Prompt
```
You are a business advisor for small-scale entrepreneurs and street vendors in India. Help with:

1. Business registration and legal requirements
2. Financial planning and loan applications
3. Marketing strategies for local businesses
4. Inventory management and supplier relations
5. Government schemes and subsidies
6. Digital payment solutions

Always provide actionable advice with specific steps and local context.
```

## API Costs and Usage

### Pricing (as of 2024)
- **GPT-3.5 Turbo**: $0.002 per 1K tokens
- **Average conversation**: 10-50 tokens per message
- **New accounts**: Receive $5 in free credits

### Managing Costs
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- Set spending limits in your OpenAI account
- Use shorter system prompts to reduce token usage
- Clear chat history regularly to avoid long context windows

## Troubleshooting

### Common Issues

#### "OpenAI API key not configured"
- Ensure your `.env.local` file contains `OPENAI_API_KEY=sk-...`
- Restart the development server after adding environment variables
- Check that the file is in the project root directory

#### "Invalid OpenAI API key"
- Verify your API key is correct and starts with `sk-`
- Check that your OpenAI account has sufficient credits
- Ensure the API key hasn't been revoked or expired

#### "OpenAI API quota exceeded"
- Check your usage at [platform.openai.com/usage](https://platform.openai.com/usage)
- Add payment method to your OpenAI account
- Upgrade your plan if needed

#### "Failed to get response from AI assistant"
- Check your internet connection
- Verify the OpenAI service status
- Try clearing the chat and starting a new conversation

### Getting Help
- Check the OpenAI [documentation](https://platform.openai.com/docs)
- Visit the OpenAI [community forum](https://community.openai.com)
- Review the error messages in the browser console

## Technical Implementation

### API Route (`/api/chat`)
- Handles OpenAI API communication
- Implements error handling and validation
- Manages conversation context and system prompts
- Returns structured responses with usage data

### Components
- **`ChatbotOpenAI`**: Main chatbot interface with OpenAI integration
- **`SystemPromptConfig`**: System prompt customization interface
- **`ApiKeySetup`**: API key configuration and validation helper

### Security Features
- API key stored securely in environment variables
- Client-side validation before API calls
- Error sanitization to prevent information leakage
- Rate limiting through OpenAI's built-in controls

## Development Notes

### Adding New Features
- Extend the system prompt for new domains
- Add conversation persistence with a database
- Implement user-specific prompts and settings
- Add support for different OpenAI models (GPT-4, etc.)

### Customization Options
- Change the AI model in `/api/chat/route.ts`
- Adjust `max_tokens` and `temperature` parameters
- Add conversation memory with message history
- Implement custom response formatting

---

For more detailed information about OpenAI integration, visit the [OpenAI API Documentation](https://platform.openai.com/docs).
