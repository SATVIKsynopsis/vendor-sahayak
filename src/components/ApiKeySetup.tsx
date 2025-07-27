'use client';

import { useState } from 'react';
import { Key, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface ApiKeySetupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeySetup({ isOpen, onClose }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult({
        isValid: false,
        message: 'Please enter an API key'
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ content: 'Hello', isBot: false }],
          systemPrompt: 'You are a helpful assistant. Respond with just "Hello!"'
        }),
      });

      if (response.ok) {
        setValidationResult({
          isValid: true,
          message: 'API key is valid and working!'
        });
      } else {
        const errorData = await response.json();
        setValidationResult({
          isValid: false,
          message: errorData.error || 'API key validation failed'
        });
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: 'Failed to validate API key. Please check your internet connection.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                OpenAI API Setup
              </h2>
              <p className="text-sm text-gray-600">
                Configure your OpenAI API key to enable the AI assistant
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Getting Started</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Steps to get your OpenAI API Key:</h4>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900 inline-flex items-center">OpenAI API Keys <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                <li>Sign in to your OpenAI account (create one if you don't have it)</li>
                <li>Click "Create new secret key"</li>
                <li>Copy the generated API key</li>
                <li>Paste it in the field below</li>
              </ol>
            </div>
          </div>

          {/* Current Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
            
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={validateApiKey}
                  disabled={isValidating || !apiKey.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? 'Testing...' : 'Test'}
                </button>
              </div>
              
              {validationResult && (
                <div className={`mt-2 p-3 rounded-lg flex items-center space-x-2 ${
                  validationResult.isValid 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {validationResult.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    validationResult.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationResult.message}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Environment Setup</h4>
              <p className="text-sm text-gray-600 mb-3">
                To use your API key, you need to add it to your environment variables:
              </p>
              <div className="bg-gray-800 text-gray-100 p-3 rounded text-sm font-mono">
                OPENAI_API_KEY=your_api_key_here
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Add this to your <code className="bg-gray-200 px-1 rounded">.env.local</code> file in the project root.
              </p>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Pricing Information</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">OpenAI API Costs</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>• GPT-3.5 Turbo: $0.002 per 1K tokens (input + output)</p>
                <p>• Average conversation: ~10-50 tokens per message</p>
                <p>• New accounts receive $5 in free credits</p>
                <p>• Monitor usage at <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">platform.openai.com/usage</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
