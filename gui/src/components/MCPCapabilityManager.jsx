import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  Zap,
  Server,
  Download,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Code,
  Database,
  Brain,
  Globe,
  Shield,
  Terminal,
  Cpu
} from 'lucide-react';
import MCPServerModal from './modals/MCPServerModal';
import MCPCapabilityModal from './modals/MCPCapabilityModal';
import AdvancedFilterModal from './modals/AdvancedFilterModal';

export const MCPCapabilityManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isCapabilityModalOpen, setIsCapabilityModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedCapability, setSelectedCapability] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  const categories = [
    { id: 'all', name: 'All Servers', icon: Server },
    { id: 'llm', name: 'LLM Providers', icon: Brain },
    { id: 'tool', name: 'Tool Providers', icon: Terminal },
    { id: 'data', name: 'Data Providers', icon: Database },
    { id: 'web', name: 'Web Services', icon: Globe },
    { id: 'security', name: 'Security Services', icon: Shield },
    { id: 'compute', name: 'Compute Services', icon: Cpu }
  ];

  const [mcpServers, setMcpServers] = useState([
    {
      id: 1,
      name: 'OpenAI MCP Server',
      type: 'llm',
      status: 'connected',
      version: '1.2.0',
      lastSync: '2 minutes ago',
      description: 'Provides access to OpenAI models including GPT-4 and DALL-E',
      endpoint: 'https://api.openai.com/v1',
      capabilities: [
        { id: 'gpt4-vision', name: 'GPT-4 Vision', type: 'vision', status: 'active' },
        { id: 'clip-embeddings', name: 'CLIP Embeddings', type: 'embedding', status: 'active' },
        { id: 'dall-e-3', name: 'DALL-E 3', type: 'image-generation', status: 'active' }
      ],
      health: {
        status: 'healthy',
        uptime: '99.8%',
        latency: '120ms',
        lastChecked: '1 minute ago'
      },
      icon: Brain
    },
    {
      id: 2,
      name: 'Anthropic MCP Server',
      type: 'llm',
      status: 'connected',
      version: '1.1.3',
      lastSync: '5 minutes ago',
      description: 'Provides access to Anthropic Claude models for text analysis',
      endpoint: 'https://api.anthropic.com/v1',
      capabilities: [
        { id: 'claude-analysis', name: 'Claude Analysis', type: 'text', status: 'active' },
        { id: 'claude-vision', name: 'Claude Vision', type: 'vision', status: 'active' }
      ],
      health: {
        status: 'healthy',
        uptime: '99.5%',
        latency: '150ms',
        lastChecked: '3 minutes ago'
      },
      icon: Brain
    },
    {
      id: 3,
      name: 'Browser MCP Server',
      type: 'tool',
      status: 'connected',
      version: '2.0.1',
      lastSync: '1 minute ago',
      description: 'Provides browser automation and web scraping capabilities',
      endpoint: 'http://localhost:8081/browser',
      capabilities: [
        { id: 'web-scraping', name: 'Web Scraping', type: 'data-extraction', status: 'active' },
        { id: 'dom-analysis', name: 'DOM Analysis', type: 'analysis', status: 'active' },
        { id: 'browser-automation', name: 'Browser Automation', type: 'automation', status: 'active' }
      ],
      health: {
        status: 'healthy',
        uptime: '100%',
        latency: '50ms',
        lastChecked: '30 seconds ago'
      },
      icon: Globe
    },
    {
      id: 4,
      name: 'FileSystem MCP Server',
      type: 'data',
      status: 'disconnected',
      version: '1.0.8',
      lastSync: '2 hours ago',
      description: 'Provides file system access and operations',
      endpoint: 'http://localhost:8082/fs',
      capabilities: [
        { id: 'file-analysis', name: 'File Analysis', type: 'analysis', status: 'inactive' },
        { id: 'directory-scanning', name: 'Directory Scanning', type: 'data-extraction', status: 'inactive' }
      ],
      health: {
        status: 'offline',
        uptime: '0%',
        latency: 'N/A',
        lastChecked: '2 hours ago'
      },
      icon: Database
    },
    {
      id: 5,
      name: 'Security MCP Server',
      type: 'security',
      status: 'warning',
      version: '1.5.2',
      lastSync: '15 minutes ago',
      description: 'Provides security analysis and threat detection',
      endpoint: 'https://security-mcp.example.com/api',
      capabilities: [
        { id: 'threat-detection', name: 'Threat Detection', type: 'analysis', status: 'active' },
        { id: 'vulnerability-scan', name: 'Vulnerability Scanning', type: 'security', status: 'warning' }
      ],
      health: {
        status: 'degraded',
        uptime: '95.2%',
        latency: '320ms',
        latencyStatus: 'high',
        lastChecked: '5 minutes ago'
      },
      icon: Shield
    },
    {
      id: 6,
      name: 'Google ADK Server',
      type: 'compute',
      status: 'connected',
      version: '1.0.0',
      lastSync: '10 minutes ago',
      description: 'Provides Google Agent Development Kit integration',
      endpoint: 'http://localhost:5000',
      capabilities: [
        { id: 'llm-agent', name: 'LLM Agent', type: 'agent', status: 'active' },
        { id: 'sequential-agent', name: 'Sequential Agent', type: 'agent', status: 'active' },
        { id: 'parallel-agent', name: 'Parallel Agent', type: 'agent', status: 'active' },
        { id: 'loop-agent', name: 'Loop Agent', type: 'agent', status: 'active' }
      ],
      health: {
        status: 'healthy',
        uptime: '99.9%',
        latency: '80ms',
        lastChecked: '2 minutes ago'
      },
      icon: Cpu
    }
  ]);

  const [capabilities, setCapabilities] = useState([]);

  // Filter options for the advanced filter modal
  const filterOptions = {
    fields: [
      { id: 'name', name: 'Name' },
      { id: 'type', name: 'Type' },
      { id: 'status', name: 'Status' },
      { id: 'version', name: 'Version' },
      { id: 'endpoint', name: 'Endpoint' },
      { id: 'health.status', name: 'Health Status' },
      { id: 'health.uptime', name: 'Uptime' },
      { id: 'health.latency', name: 'Latency' }
    ],
    operators: [
      { id: 'equals', name: 'Equals' },
      { id: 'not_equals', name: 'Not Equals' },
      { id: 'contains', name: 'Contains' },
      { id: 'not_contains', name: 'Not Contains' },
      { id: 'greater_than', name: 'Greater Than' },
      { id: 'less_than', name: 'Less Than' },
      { id: 'starts_with', name: 'Starts With' },
      { id: 'ends_with', name: 'Ends With' }
    ]
  };

  // Apply advanced filters
  const applyAdvancedFilters = (filters) => {
    setActiveFilters(filters);
  };

  // Check if a server matches the advanced filters
  const matchesAdvancedFilters = (server) => {
    if (activeFilters.length === 0) return true;
    
    return activeFilters.every(filter => {
      const { field, operator, value } = filter;
      
      // Handle nested fields like health.status
      let serverValue;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        serverValue = server[parent] ? server[parent][child] : undefined;
      } else {
        serverValue = server[field];
      }
      
      // Handle null/undefined values
      if (serverValue === null || serverValue === undefined) {
        return operator === 'not_equals' || operator === 'not_contains';
      }
      
      // Convert to string for comparison
      const serverValueStr = String(serverValue).toLowerCase();
      const filterValueStr = String(value).toLowerCase();
      
      switch (operator) {
        case 'equals':
          return serverValueStr === filterValueStr;
        case 'not_equals':
          return serverValueStr !== filterValueStr;
        case 'contains':
          return serverValueStr.includes(filterValueStr);
        case 'not_contains':
          return !serverValueStr.includes(filterValueStr);
        case 'greater_than':
          return parseFloat(serverValueStr) > parseFloat(filterValueStr);
        case 'less_than':
          return parseFloat(serverValueStr) < parseFloat(filterValueStr);
        case 'starts_with':
          return serverValueStr.startsWith(filterValueStr);
        case 'ends_with':
          return serverValueStr.endsWith(filterValueStr);
        default:
          return true;
      }
    });
  };

  // Flatten all capabilities from all servers
  useEffect(() => {
    const allCapabilities = mcpServers.flatMap(server => 
      server.capabilities.map(cap => ({
        ...cap,
        serverId: server.id,
        serverName: server.name,
        serverStatus: server.status,
        serverType: server.type
      }))
    );
    setCapabilities(allCapabilities);
  }, [mcpServers]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'disconnected':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getCapabilityStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'inactive':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getHealthStatusIcon = (health) => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : Server;
  };

  const filteredServers = mcpServers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         server.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || server.type === selectedCategory;
    const matchesAdvanced = matchesAdvancedFilters(server);
    return matchesSearch && matchesCategory && matchesAdvanced;
  });

  const handleAddServer = () => {
    setSelectedServer(null);
    setIsServerModalOpen(true);
  };

  const handleEditServer = (server) => {
    setSelectedServer(server);
    setIsServerModalOpen(true);
  };

  const handleServerSaved = (serverData) => {
    if (selectedServer) {
      // Update existing server
      setMcpServers(prevServers => 
        prevServers.map(server => 
          server.id === serverData.id ? serverData : server
        )
      );
    } else {
      // Add new server
      setMcpServers(prevServers => [...prevServers, serverData]);
    }
    setIsServerModalOpen(false);
    setSelectedServer(null);
  };

  const handleAddCapability = (serverId) => {
    const server = mcpServers.find(s => s.id === serverId);
    setSelectedServer(server);
    setSelectedCapability(null);
    setIsCapabilityModalOpen(true);
  };

  const handleEditCapability = (capability) => {
    const server = mcpServers.find(s => s.id === capability.serverId);
    setSelectedServer(server);
    setSelectedCapability(capability);
    setIsCapabilityModalOpen(true);
  };

  const handleCapabilitySaved = (capabilityData) => {
    if (selectedServer) {
      if (selectedCapability) {
        // Update existing capability
        setMcpServers(prevServers => 
          prevServers.map(server => 
            server.id === selectedServer.id 
              ? {
                  ...server,
                  capabilities: server.capabilities.map(cap => 
                    cap.id === capabilityData.id ? capabilityData : cap
                  )
                }
              : server
          )
        );
      } else {
        // Add new capability
        setMcpServers(prevServers => 
          prevServers.map(server => 
            server.id === selectedServer.id 
              ? {
                  ...server,
                  capabilities: [...server.capabilities, capabilityData]
                }
              : server
          )
        );
      }
    }
    setIsCapabilityModalOpen(false);
    setSelectedServer(null);
    setSelectedCapability(null);
  };

  const handleConnectDisconnect = (server) => {
    const newStatus = server.status === 'connected' || server.status === 'warning' 
      ? 'disconnected' 
      : 'connected';
    
    // Simulate connection/disconnection process
    setRefreshing(true);
    setTimeout(() => {
      setMcpServers(prevServers => 
        prevServers.map(s => 
          s.id === server.id 
            ? { 
                ...s, 
                status: newStatus,
                lastSync: 'just now',
                health: {
                  ...s.health,
                  status: newStatus === 'connected' ? 'healthy' : 'offline',
                  lastChecked: 'just now'
                },
                capabilities: s.capabilities.map(cap => ({
                  ...cap,
                  status: newStatus === 'connected' ? 'active' : 'inactive'
                }))
              } 
            : s
        )
      );
      setRefreshing(false);
    }, 1500);
  };

  const handleRefreshServer = (server) => {
    // Simulate refresh process
    setRefreshing(true);
    setTimeout(() => {
      setMcpServers(prevServers => 
        prevServers.map(s => 
          s.id === server.id 
            ? { 
                ...s, 
                lastSync: 'just now',
                health: {
                  ...s.health,
                  lastChecked: 'just now'
                }
              } 
            : s
        )
      );
      setRefreshing(false);
    }, 1000);
  };

  // Format the active filters for display
  const getActiveFiltersDisplay = () => {
    if (activeFilters.length === 0) return null;
    
    return (
      <div className="flex items-center space-x-2 text-sm text-slate-400">
        <span>Active filters:</span>
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => {
            const fieldName = filterOptions.fields.find(f => f.id === filter.field)?.name || filter.field;
            const operatorName = filterOptions.operators.find(o => o.id === filter.operator)?.name || filter.operator;
            
            return (
              <span 
                key={filter.id} 
                className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
              >
                {fieldName} {operatorName} {filter.value}
              </span>
            );
          })}
          <button 
            onClick={() => setActiveFilters([])}
            className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full hover:bg-slate-700 transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">MCP Server Manager</h1>
          <p className="text-slate-400">Manage Model Context Protocol servers and their capabilities.</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <button 
            onClick={handleAddServer}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add MCP Server</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search MCP servers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button 
          onClick={() => setIsFilterModalOpen(true)}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-300 hover:text-white hover:border-slate-600/50 transition-all duration-200 flex items-center space-x-2"
        >
          <Filter className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersDisplay()}

      {/* Categories */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                  : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:text-white hover:border-slate-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* MCP Servers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServers.map((server) => {
          const ServerIcon = server.icon;
          return (
            <div key={server.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300" role="article">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                    <ServerIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{server.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(server.status)}`}>
                        {server.status === 'connected' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : server.status === 'warning' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span className="capitalize">{server.status}</span>
                      </span>
                      <span className="text-slate-400 text-xs">v{server.version}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {server.status === 'connected' && (
                    <button 
                      onClick={() => handleRefreshServer(server)}
                      disabled={refreshing}
                      className="p-2 text-slate-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditServer(server)}
                    className="p-2 text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-slate-300 text-sm mb-4">{server.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Endpoint:</span>
                    <span className="text-white font-mono text-xs">{server.endpoint}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Last Sync:</span>
                    <span className="text-white">{server.lastSync}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Health:</span>
                    <div className="flex items-center space-x-1">
                      {getHealthStatusIcon(server.health)}
                      <span className={`font-medium capitalize ${
                        server.health.status === 'healthy' ? 'text-green-400' :
                        server.health.status === 'degraded' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {server.health.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Latency:</span>
                    <span className={`text-white ${
                      server.health.latencyStatus === 'high' ? 'text-yellow-400' :
                      server.health.status === 'offline' ? 'text-slate-500' :
                      'text-white'
                    }`}>
                      {server.health.latency}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Capabilities</h4>
                  {server.status === 'connected' && (
                    <button 
                      onClick={() => handleAddCapability(server.id)}
                      className="text-purple-400 hover:text-purple-300 text-xs font-medium flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {server.capabilities.length > 0 ? (
                    server.capabilities.map((capability) => (
                      <div 
                        key={capability.id}
                        className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer"
                        onClick={() => handleEditCapability(capability)}
                      >
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-white text-sm">{capability.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getCapabilityStatusColor(capability.status)}`}>
                            {capability.status}
                          </span>
                          <Eye className="w-4 h-4 text-slate-400 hover:text-white" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-slate-500 text-sm">
                      No capabilities available
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {server.status === 'disconnected' ? (
                  <button 
                    onClick={() => handleConnectDisconnect(server)}
                    disabled={refreshing}
                    className="flex-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {refreshing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleConnectDisconnect(server)}
                    disabled={refreshing}
                    className="flex-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/30 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {refreshing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Disconnecting...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Disconnect</span>
                      </>
                    )}
                  </button>
                )}
                <button 
                  onClick={() => handleEditServer(server)}
                  className="bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500/50 p-2 rounded-lg transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Capabilities Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Available Capabilities</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setRefreshing(true)}
              disabled={refreshing}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((capability) => {
            const server = mcpServers.find(s => s.id === capability.serverId);
            const ServerIcon = server?.icon || Server;
            
            return (
              <div 
                key={`${capability.serverId}-${capability.id}`}
                className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer"
                onClick={() => handleEditCapability(capability)}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{capability.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getCapabilityStatusColor(capability.status)}`}>
                        {capability.status}
                      </span>
                      <span className="text-slate-400 text-xs flex items-center space-x-1">
                        <ServerIcon className="w-3 h-3" />
                        <span>{server?.name || 'Unknown Server'}</span>
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <button className="text-slate-400 hover:text-white text-xs flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button className="text-slate-400 hover:text-white text-xs flex items-center space-x-1">
                        <Code className="w-3 h-3" />
                        <span>Schema</span>
                      </button>
                      {capability.status === 'inactive' && (
                        <button className="text-green-400 hover:text-green-300 text-xs flex items-center space-x-1">
                          <Download className="w-3 h-3" />
                          <span>Install</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MCP Server Modal */}
      <MCPServerModal
        isOpen={isServerModalOpen}
        onClose={() => {
          setIsServerModalOpen(false);
          setSelectedServer(null);
        }}
        server={selectedServer}
        onServerSaved={handleServerSaved}
      />

      {/* MCP Capability Modal */}
      <MCPCapabilityModal
        isOpen={isCapabilityModalOpen}
        onClose={() => {
          setIsCapabilityModalOpen(false);
          setSelectedServer(null);
          setSelectedCapability(null);
        }}
        server={selectedServer}
        capability={selectedCapability}
        onCapabilitySaved={handleCapabilitySaved}
      />

      {/* Advanced Filter Modal */}
      <AdvancedFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={applyAdvancedFilters}
        initialFilters={activeFilters}
        filterOptions={filterOptions}
        entityType="mcp-server"
      />
    </div>
  );
};

export default MCPCapabilityManager;