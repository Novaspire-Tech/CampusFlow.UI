import React, { useState } from 'react';
import {  CheckCircle, AlertCircle, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';

interface ConfigData {
  phoneNumber: string;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
}

const Configuration: React.FC = () => {
  const [step, ] = useState(1);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [showToken, setShowToken] = useState(false);
  
  const [config, setConfig] = useState<ConfigData>({
    phoneNumber: '',
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
  });

  const webhookUrl = `https://api.smartacad.com/whatsapp/webhook?school_id=school_123`;
  const verifyToken = 'smartacad_verify_token_xyz789';

  const handleInputChange = (field: keyof ConfigData, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsTesting(false);
      setTestSuccess(true);
      
      setTimeout(() => {
        setIsConfigured(true);
      }, 1500);
    }, 2000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const SetupStep: React.FC<{
    number: number;
    title: string;
    description: string;
    isActive: boolean;
    isCompleted: boolean;
  }> = ({ number, title, description, isActive, isCompleted }) => (
    <div className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
      isActive ? 'border-blue-600 bg-blue-50' : isCompleted ? 'border-green-600 bg-green-50' : 'border-gray-200'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isCompleted ? 'bg-green-600' : isActive ? 'bg-blue-600' : 'bg-gray-300'
      }`}>
        {isCompleted ? (
          <CheckCircle size={18} className="text-white" />
        ) : (
          <span className="text-white font-bold text-sm">{number}</span>
        )}
      </div>
      <div className="flex-1">
        <h3 className={`font-semibold text-sm ${
          isActive || isCompleted ? 'text-gray-800' : 'text-gray-500'
        }`}>
          {title}
        </h3>
        <p className={`text-xs mt-1 ${
          isActive || isCompleted ? 'text-gray-600' : 'text-gray-400'
        }`}>
          {description}
        </p>
      </div>
    </div>
  );

  if (isConfigured) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">WhatsApp Configuration</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your WhatsApp Business API settings</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start gap-4">
          <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-green-800">WhatsApp is configured and active!</h3>
            <p className="text-sm text-green-700 mt-1">
              Your school is successfully connected to WhatsApp Business API. You can now send messages to students.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connection Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Connection Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">API Connection</span>
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Phone Verification</span>
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium">Verified</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Quality Rating</span>
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium">High</span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Account Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Phone Number</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{config.phoneNumber || '+91 98765 43210'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">Business Account ID</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{config.businessAccountId || '123456789012345'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">Daily Message Limit</label>
                <p className="text-sm font-medium text-gray-800 mt-1">1,000 messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Configuration Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-600 font-medium">Phone Number ID</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={config.phoneNumberId || '987654321098765'}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => handleCopy(config.phoneNumberId)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-600 font-medium">Access Token</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={config.accessToken || 'EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={() => handleCopy(config.accessToken)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-600 font-medium">Webhook URL</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => handleCopy(webhookUrl)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Disconnect
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Update Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">WhatsApp Configuration</h1>
        <p className="text-sm text-gray-600 mt-1">Set up your WhatsApp Business API integration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Setup Steps */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Setup Progress</h3>
            
            <SetupStep
              number={1}
              title="Create Meta Business Account"
              description="Sign up for Meta Business Suite"
              isActive={step === 1}
              isCompleted={step > 1}
            />
            
            <SetupStep
              number={2}
              title="Create WhatsApp App"
              description="Register app in Meta Developers"
              isActive={step === 2}
              isCompleted={step > 2}
            />
            
            <SetupStep
              number={3}
              title="Get API Credentials"
              description="Copy Phone ID, Business ID & Token"
              isActive={step === 3}
              isCompleted={step > 3}
            />
            
            <SetupStep
              number={4}
              title="Configure Webhook"
              description="Set up webhook in Meta dashboard"
              isActive={step === 4}
              isCompleted={step > 4}
            />
            
            <SetupStep
              number={5}
              title="Test Connection"
              description="Verify everything works"
              isActive={step === 5}
              isCompleted={testSuccess}
            />
          </div>
        </div>

        {/* Right - Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-blue-800 text-sm">Before you begin</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You'll need a dedicated phone number for WhatsApp Business API. This number cannot be used on personal WhatsApp.
                </p>
                <div className="mt-3 space-y-2">
                  <a
                    href="https://business.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium"
                  >
                    Create Meta Business Account
                    <ExternalLink size={14} />
                  </a>
                  <br />
                  <a
                    href="https://developers.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium"
                  >
                    Go to Meta Developers
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-6">API Credentials</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={config.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your WhatsApp Business phone number in E.164 format
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.phoneNumberId}
                  onChange={(e) => handleInputChange('phoneNumberId', e.target.value)}
                  placeholder="987654321098765"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Found in Meta Business Suite → WhatsApp → API Setup
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Account ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.businessAccountId}
                  onChange={(e) => handleInputChange('businessAccountId', e.target.value)}
                  placeholder="123456789012345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your WhatsApp Business Account ID from Meta
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={config.accessToken}
                    onChange={(e) => handleInputChange('accessToken', e.target.value)}
                    placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Generate a permanent access token in Meta Developers
                </p>
              </div>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-6">Webhook Configuration</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={webhookUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => handleCopy(webhookUrl)}
                    className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy size={20} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add this URL in Meta Developers → Webhooks
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verify Token
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={verifyToken}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => handleCopy(verifyToken)}
                    className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy size={20} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use this token when configuring the webhook
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 text-sm mb-2">Webhook Setup Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-yellow-700">
                  <li>Go to Meta Developers → Your App → WhatsApp → Configuration</li>
                  <li>Click "Edit" next to Webhooks</li>
                  <li>Paste the Webhook URL above</li>
                  <li>Paste the Verify Token above</li>
                  <li>Subscribe to "messages" field</li>
                  <li>Click "Verify and Save"</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Test Connection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Test Connection</h3>
            <p className="text-sm text-gray-600 mb-4">
              Click the button below to test your WhatsApp API configuration
            </p>
            
            {testSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <h4 className="font-semibold text-green-800 text-sm">Connection Successful!</h4>
                  <p className="text-xs text-green-700 mt-1">Your WhatsApp API is configured correctly</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleTestConnection}
                disabled={!config.phoneNumber || !config.phoneNumberId || !config.accessToken || isTesting}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  !config.phoneNumber || !config.phoneNumberId || !config.accessToken || isTesting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isTesting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Testing Connection...
                  </span>
                ) : (
                  'Test Connection'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;