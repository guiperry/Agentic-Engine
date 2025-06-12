import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Smartphone,
  Monitor,
  Globe,
  Key,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Bot,
  Target,
  Zap,
  Brain,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    orchestration: true,
    errors: true,
    updates: false,
    marketing: false
  });

  // Inference API Keys state
  const [apiKeys, setApiKeys] = useState({
    cerebras: '',
    gemini: '',
    deepseek: ''
  });
  const [showKeys, setShowKeys] = useState({
    cerebras: false,
    gemini: false,
    deepseek: false
  });
  const [keysSaved, setKeysSaved] = useState({
    cerebras: false,
    gemini: false,
    deepseek: false
  });
  const [availableModels, setAvailableModels] = useState({
    primary: [],
    fallback: []
  });
  const [moaSettings, setMoaSettings] = useState({
    primaryModel: '',
    fallbackModel: ''
  });

  const tabs = [
    { id: 'account', name: 'Account', icon: User },
    { id: 'inference', name: 'Inference API', icon: Brain },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'agents', name: 'Agent Config', icon: Bot },
    { id: 'targets', name: 'Target Systems', icon: Target },
    { id: 'mcp', name: 'MCP Servers', icon: Zap },
    { id: 'advanced', name: 'Advanced', icon: SettingsIcon }
  ];

  // Load API keys from environment/backend on component mount
  useEffect(() => {
    loadApiKeys();
    loadAvailableModels();
  }, []);

  const loadApiKeys = async () => {
    try {
      // In a real implementation, you'd fetch from your backend
      // For now, we'll check if they exist in localStorage or make API calls
      const cerebrasKey = localStorage.getItem('CEREBRAS_API_KEY') || '';
      const geminiKey = localStorage.getItem('GEMINI_API_KEY') || '';
      const deepseekKey = localStorage.getItem('DEEPSEEK_API_KEY') || '';

      setApiKeys({
        cerebras: cerebrasKey,
        gemini: geminiKey,
        deepseek: deepseekKey
      });
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const loadAvailableModels = async () => {
    try {
      // Fetch available models from the inference service
      const response = await fetch('/api/v1/inference/models');
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data);
      }
    } catch (error) {
      console.error('Failed to load available models:', error);
      // Fallback to default models
      setAvailableModels({
        primary: ['llama-4-scout-17b-16e-instruct', 'gpt-4', 'claude-3-sonnet'],
        fallback: ['gemini-1.5-flash-latest', 'deepseek-chat', 'gemini-1.5-pro-latest']
      });
    }
  };

  const saveApiKey = async (provider, key) => {
    try {
      // Save to localStorage (in production, you'd send to backend)
      localStorage.setItem(`${provider.toUpperCase()}_API_KEY`, key);

      // Update the backend environment
      const response = await fetch('/api/v1/settings/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: provider,
          apiKey: key
        })
      });

      if (response.ok) {
        setKeysSaved(prev => ({ ...prev, [provider]: true }));
        setTimeout(() => {
          setKeysSaved(prev => ({ ...prev, [provider]: false }));
        }, 3000);
      }
    } catch (error) {
      console.error(`Failed to save ${provider} API key:`, error);
    }
  };

  const setMoaModel = async (type, model) => {
    try {
      const response = await fetch(`/api/v1/inference/moa/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model })
      });

      if (response.ok) {
        setMoaSettings(prev => ({ ...prev, [`${type}Model`]: model }));
      }
    } catch (error) {
      console.error(`Failed to set MOA ${type} model:`, error);
    }
  };

  const connectedTargets = [
    {
      name: 'Chrome Browser',
      status: 'connected',
      lastSync: '2 minutes ago',
      permissions: ['read', 'write', 'execute'],
      agents: 8
    },
    {
      name: 'Local File System',
      status: 'connected',
      lastSync: '5 minutes ago',
      permissions: ['read', 'write'],
      agents: 12
    },
    {
      name: 'VS Code Editor',
      status: 'limited',
      lastSync: '18 minutes ago',
      permissions: ['read'],
      agents: 3
    },
    {
      name: 'Terminal/PowerShell',
      status: 'connected',
      lastSync: '1 minute ago',
      permissions: ['read', 'execute'],
      agents: 6
    }
  ];

  const mcpServers = [
    {
      name: 'OpenAI MCP Server',
      status: 'connected',
      capabilities: ['GPT-4 Vision', 'CLIP Embeddings'],
      lastSync: '2 minutes ago',
      version: '1.2.0'
    },
    {
      name: 'Anthropic MCP Server',
      status: 'connected',
      capabilities: ['Claude Analysis', 'Text Processing'],
      lastSync: '5 minutes ago',
      version: '1.1.3'
    },
    {
      name: 'Browser MCP Server',
      status: 'connected',
      capabilities: ['Web Scraping', 'DOM Analysis'],
      lastSync: '1 minute ago',
      version: '2.0.1'
    },
    {
      name: 'FileSystem MCP Server',
      status: 'disconnected',
      capabilities: ['File Analysis', 'Directory Scanning'],
      lastSync: '2 hours ago',
      version: '1.0.8'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Agent Master"
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="agent.master@example.com"
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Organization</label>
                  <input
                    type="text"
                    defaultValue="Agentic Systems Inc."
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
                  <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Account Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Active Agents</p>
                      <p className="text-slate-400 text-sm">47 deployed</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="flex items-center space-x-3">
                    <Target className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Target Systems</p>
                      <p className="text-slate-400 text-sm">23 connected</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Orchestrations</p>
                      <p className="text-slate-400 text-sm">2,847 total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'inference':
        return (
          <div className="space-y-6">
            {/* API Keys Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Inference API Keys</h3>
              <p className="text-slate-400 text-sm mb-6">Configure your API keys for different inference providers. Keys are stored securely and require application restart to take effect.</p>

              <div className="space-y-4">
                {/* Cerebras API Key */}
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">Cerebras API Key</p>
                      <p className="text-slate-400 text-sm">Primary inference provider for fast model execution</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {keysSaved.cerebras && <Check className="w-4 h-4 text-green-400" />}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <input
                        type={showKeys.cerebras ? "text" : "password"}
                        value={apiKeys.cerebras}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, cerebras: e.target.value }))}
                        placeholder="Enter Cerebras API Key"
                        className="w-full bg-slate-600/50 border border-slate-500/50 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => setShowKeys(prev => ({ ...prev, cerebras: !prev.cerebras }))}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showKeys.cerebras ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => saveApiKey('cerebras', apiKeys.cerebras)}
                      disabled={!apiKeys.cerebras}
                      className="bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-slate-600/20 disabled:text-slate-500 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Gemini API Key */}
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">Google Gemini API Key</p>
                      <p className="text-slate-400 text-sm">Fallback provider with large context windows</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {keysSaved.gemini && <Check className="w-4 h-4 text-green-400" />}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <input
                        type={showKeys.gemini ? "text" : "password"}
                        value={apiKeys.gemini}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                        placeholder="Enter Gemini API Key"
                        className="w-full bg-slate-600/50 border border-slate-500/50 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => setShowKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => saveApiKey('gemini', apiKeys.gemini)}
                      disabled={!apiKeys.gemini}
                      className="bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-slate-600/20 disabled:text-slate-500 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* DeepSeek API Key */}
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">DeepSeek API Key</p>
                      <p className="text-slate-400 text-sm">Cost-effective provider for large-scale processing</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {keysSaved.deepseek && <Check className="w-4 h-4 text-green-400" />}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <input
                        type={showKeys.deepseek ? "text" : "password"}
                        value={apiKeys.deepseek}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, deepseek: e.target.value }))}
                        placeholder="Enter DeepSeek API Key"
                        className="w-full bg-slate-600/50 border border-slate-500/50 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => setShowKeys(prev => ({ ...prev, deepseek: !prev.deepseek }))}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showKeys.deepseek ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => saveApiKey('deepseek', apiKeys.deepseek)}
                      disabled={!apiKeys.deepseek}
                      className="bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-slate-600/20 disabled:text-slate-500 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Configuration Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Model Configuration</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <p className="text-white font-medium mb-2">Available Models</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 mb-1">Primary Models:</p>
                      <p className="text-white">{availableModels.primary.join(', ') || 'Loading...'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Fallback Models:</p>
                      <p className="text-white">{availableModels.fallback.join(', ') || 'Loading...'}</p>
                    </div>
                  </div>
                  <button
                    onClick={loadAvailableModels}
                    className="mt-3 bg-slate-600/50 hover:bg-slate-600/70 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* MOA Settings */}
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <p className="text-white font-medium mb-3">Mixture of Agents (MOA) Configuration</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Primary Model</label>
                      <select
                        value={moaSettings.primaryModel}
                        onChange={(e) => setMoaSettings(prev => ({ ...prev, primaryModel: e.target.value }))}
                        className="w-full bg-slate-600/50 border border-slate-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select primary model</option>
                        {availableModels.primary.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setMoaModel('primary', moaSettings.primaryModel)}
                        disabled={!moaSettings.primaryModel}
                        className="mt-2 bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-slate-600/20 disabled:text-slate-500 text-purple-400 px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Set Primary
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Fallback Model</label>
                      <select
                        value={moaSettings.fallbackModel}
                        onChange={(e) => setMoaSettings(prev => ({ ...prev, fallbackModel: e.target.value }))}
                        className="w-full bg-slate-600/50 border border-slate-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select fallback model</option>
                        {availableModels.fallback.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setMoaModel('fallback', moaSettings.fallbackModel)}
                        disabled={!moaSettings.fallbackModel}
                        className="mt-2 bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-slate-600/20 disabled:text-slate-500 text-purple-400 px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Set Fallback
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                    <div>
                      <p className="text-white font-medium capitalize">
                        {key === 'orchestration' ? 'Orchestration Events' :
                         key === 'errors' ? 'Error Alerts' :
                         key === 'updates' ? 'System Updates' :
                         'Marketing Communications'}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {key === 'orchestration' ? 'Get notified when orchestrations complete or fail' :
                         key === 'errors' ? 'Receive alerts for system errors and agent failures' :
                         key === 'updates' ? 'Stay informed about new features and improvements' :
                         'Receive newsletters and promotional content'}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !enabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        enabled ? 'bg-purple-500' : 'bg-slate-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'targets':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Connected Target Systems</h3>
              <div className="space-y-4">
                {connectedTargets.map((target, index) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          target.status === 'connected' ? 'bg-green-400' :
                          target.status === 'limited' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}></div>
                        <div>
                          <p className="text-white font-medium">{target.name}</p>
                          <p className="text-slate-400 text-sm">{target.agents} active agents</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          target.status === 'connected' ? 'bg-green-500/20 text-green-400' :
                          target.status === 'limited' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {target.status}
                        </span>
                        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                          Configure
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-slate-400">Permissions: </span>
                        <span className="text-white">{target.permissions.join(', ')}</span>
                      </div>
                      <span className="text-slate-400">Last sync: {target.lastSync}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'mcp':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">MCP Server Connections</h3>
              <div className="space-y-4">
                {mcpServers.map((server, index) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          server.status === 'connected' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {server.status === 'connected' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{server.name}</p>
                          <p className="text-slate-400 text-sm">v{server.version}</p>
                          <p className="text-slate-500 text-xs">
                            Capabilities: {server.capabilities.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {server.status === 'connected' && (
                          <button className="p-2 text-slate-400 hover:text-white transition-colors duration-200">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          server.status === 'connected'
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}>
                          {server.status === 'connected' ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Last sync: {server.lastSync}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Advanced Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">Debug Mode</p>
                      <p className="text-slate-400 text-sm">Enable detailed logging for troubleshooting</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 translate-x-1" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">Orchestration Timeout</p>
                      <p className="text-slate-400 text-sm">Maximum time to wait for orchestration completion</p>
                    </div>
                  </div>
                  <select className="w-full bg-slate-600/50 border border-slate-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>30 seconds</option>
                    <option>60 seconds</option>
                    <option>2 minutes</option>
                    <option>5 minutes</option>
                  </select>
                </div>
                
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-medium">Danger Zone</p>
                      <p className="text-red-300 text-sm mb-3">These actions cannot be undone</p>
                      <div className="space-y-2">
                        <button className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                          Reset All Agents
                        </button>
                        <button className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ml-2">
                          Clear All Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Configure your agentic NFT platform and system preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              {renderContent()}
              
              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm">Changes are saved automatically</p>
                  <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};