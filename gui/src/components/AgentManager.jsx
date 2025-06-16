import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus,
  Bot,
  Zap,
  Eye,
  MoreVertical,
  Play,
  Pause,
  Square,
  Settings,
  Target,
  Activity,
  Clock
} from 'lucide-react';
import AgentCreationModal from './modals/AgentCreationModal';
import AgentDeploymentModal from './modals/AgentDeploymentModal';
import AgentConfigModal from './modals/AgentConfigModal';
import AdvancedFilterModal from './modals/AdvancedFilterModal';
import AgentDetailModal from './modals/AgentDetailModal';
import { fetchAgents, updateAgent, deleteAgent } from '../utils/api';

export const AgentManager = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: 'All Agents' },
    { id: 'active', name: 'Active' },
    { id: 'idle', name: 'Idle' },
    { id: 'deployed', name: 'Deployed' },
    { id: 'maintenance', name: 'Maintenance' },
  ];

  const [agents, setAgents] = useState([]);

  // Fetch agents from the API
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setIsLoading(true);
        // Assuming user ID 1 for now - in a real app, this would come from auth context
        const fetchedAgents = await fetchAgents(1);
        
        // Transform the API response to match our UI format
        const formattedAgents = fetchedAgents.map(agent => ({
          id: agent.id,
          name: agent.name,
          collection: agent.collection || '',
          image: agent.image_url || 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=400',
          status: agent.status || 'idle',
          currentTarget: null, // These would come from deployment data in a real app
          capability: null,
          deployedSince: null,
          totalInferences: 0,
          successRate: 0,
          lastActivity: agent.updated_at ? new Date(agent.updated_at).toLocaleString() : 'Never',
          capabilities: agent.capabilities || [],
          targetTypes: agent.target_types || [],
          createdAt: agent.created_at || new Date().toISOString(),
          owner: 'User',
          type: agent.type || 'standard',
          config: agent.config || '{}'
        }));
        
        setAgents(formattedAgents);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
        setError('Failed to load agents. Please try again later.');
        
        // Fallback to sample data for demo purposes
        setAgents([
          {
            id: '1',
            name: 'CyberPunk Agent #7804',
            collection: 'CyberPunk Collective',
            image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=400',
            status: 'idle',
            currentTarget: null,
            capability: null,
            deployedSince: null,
            totalInferences: 0,
            successRate: 0,
            lastActivity: 'Never',
            capabilities: ['Web Analysis', 'Data Extraction', 'Content Monitoring'],
            targetTypes: ['Browser', 'Web APIs', 'Social Media'],
            createdAt: new Date().toISOString(),
            owner: 'User'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'from-green-400 to-emerald-500';
      case 'deployed':
        return 'from-blue-400 to-indigo-500';
      case 'monitoring':
        return 'from-purple-400 to-pink-500';
      case 'idle':
        return 'from-gray-400 to-gray-500';
      case 'maintenance':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'deployed':
        return <Target className="w-4 h-4" />;
      case 'monitoring':
        return <Activity className="w-4 h-4" />;
      case 'idle':
        return <Pause className="w-4 h-4" />;
      case 'maintenance':
        return <Settings className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  // Filter options for the advanced filter modal
  const filterOptions = {
    fields: [
      { id: 'name', name: 'Name' },
      { id: 'collection', name: 'Collection' },
      { id: 'status', name: 'Status' },
      { id: 'capability', name: 'Capability' },
      { id: 'currentTarget', name: 'Current Target' },
      { id: 'successRate', name: 'Success Rate' },
      { id: 'totalInferences', name: 'Total Inferences' },
      { id: 'createdAt', name: 'Created Date' },
      { id: 'owner', name: 'Owner' }
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

  // Check if an agent matches the advanced filters
  const matchesAdvancedFilters = (agent) => {
    if (activeFilters.length === 0) return true;
    
    return activeFilters.every(filter => {
      const { field, operator, value } = filter;
      const agentValue = agent[field];
      
      // Handle null/undefined values
      if (agentValue === null || agentValue === undefined) {
        return operator === 'not_equals' || operator === 'not_contains';
      }
      
      // Convert to string for comparison
      const agentValueStr = String(agentValue).toLowerCase();
      const filterValueStr = String(value).toLowerCase();
      
      switch (operator) {
        case 'equals':
          return agentValueStr === filterValueStr;
        case 'not_equals':
          return agentValueStr !== filterValueStr;
        case 'contains':
          return agentValueStr.includes(filterValueStr);
        case 'not_contains':
          return !agentValueStr.includes(filterValueStr);
        case 'greater_than':
          return parseFloat(agentValueStr) > parseFloat(filterValueStr);
        case 'less_than':
          return parseFloat(agentValueStr) < parseFloat(filterValueStr);
        case 'starts_with':
          return agentValueStr.startsWith(filterValueStr);
        case 'ends_with':
          return agentValueStr.endsWith(filterValueStr);
        default:
          return true;
      }
    });
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.collection.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || agent.status === selectedCategory;
    const matchesAdvanced = matchesAdvancedFilters(agent);
    return matchesSearch && matchesCategory && matchesAdvanced;
  });

  const handleAgentCreated = (newAgent) => {
    // Add the new agent to the UI state
    setAgents(prevAgents => [...prevAgents, {
      id: newAgent.id,
      name: newAgent.name,
      collection: newAgent.collection || '',
      image: newAgent.image_url || 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: newAgent.status || 'idle',
      currentTarget: null,
      capability: null,
      deployedSince: null,
      totalInferences: 0,
      successRate: 0,
      lastActivity: 'Just now',
      capabilities: newAgent.capabilities || [],
      targetTypes: newAgent.target_types || [],
      createdAt: newAgent.created_at || new Date().toISOString(),
      owner: 'User',
      type: newAgent.type || 'standard',
      config: newAgent.config || '{}'
    }]);
    setIsCreationModalOpen(false);
  };

  const handleAgentDeployed = async (updatedAgent) => {
    try {
      // Parse the current config if it exists
      let configObj = {};
      try {
        const agent = agents.find(a => a.id === updatedAgent.id);
        if (agent && agent.config) {
          configObj = JSON.parse(agent.config);
        }
      } catch (e) {
        console.warn('Failed to parse current agent config:', e);
      }
      
      // Update the config with deployment information
      configObj = {
        ...configObj,
        collection: updatedAgent.collection,
        image_url: updatedAgent.image,
        capabilities: updatedAgent.capabilities,
        target_types: updatedAgent.targetTypes,
        status: 'active',
        current_target: updatedAgent.currentTarget,
        capability: updatedAgent.capability,
        deployed_at: new Date().toISOString()
      };
      
      // Update the agent in the backend
      const apiAgent = {
        name: updatedAgent.name,
        type: updatedAgent.type || 'standard',
        config: JSON.stringify(configObj)
      };
      
      await updateAgent(updatedAgent.id, apiAgent);
      
      // Update the UI with the deployed agent
      const deployedAgent = {
        ...updatedAgent,
        status: 'active',
        deployedSince: 'Just now',
        lastActivity: 'Just now'
      };
      
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.id === updatedAgent.id ? deployedAgent : agent
        )
      );
    } catch (error) {
      console.error('Error deploying agent:', error);
      // Handle error (e.g., show notification)
    }
    
    setIsDeploymentModalOpen(false);
    setSelectedAgent(null);
  };

  const handleAgentUpdated = async (updatedAgent) => {
    try {
      // Parse the current config if it exists
      let configObj = {};
      try {
        const agent = agents.find(a => a.id === updatedAgent.id);
        if (agent && agent.config) {
          configObj = JSON.parse(agent.config);
        }
      } catch (e) {
        console.warn('Failed to parse current agent config:', e);
      }
      
      // Update the config with new information
      configObj = {
        ...configObj,
        collection: updatedAgent.collection,
        image_url: updatedAgent.image,
        capabilities: updatedAgent.capabilities,
        target_types: updatedAgent.targetTypes,
        status: updatedAgent.status || 'idle'
      };
      
      // Update the agent in the backend
      const apiAgent = {
        name: updatedAgent.name,
        type: updatedAgent.type || 'standard',
        config: JSON.stringify(configObj)
      };
      
      await updateAgent(updatedAgent.id, apiAgent);
      
      // Update the UI
      const updatedUIAgent = {
        ...updatedAgent,
        lastActivity: 'Just now'
      };
      
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.id === updatedAgent.id ? updatedUIAgent : agent
        )
      );
    } catch (error) {
      console.error('Error updating agent:', error);
      // Handle error (e.g., show notification)
    }
    
    setIsConfigModalOpen(false);
    setSelectedAgent(null);
  };

  const handleDeployClick = (agent) => {
    setSelectedAgent(agent);
    setIsDeploymentModalOpen(true);
  };

  const handleConfigClick = (agent) => {
    setSelectedAgent(agent);
    setIsConfigModalOpen(true);
  };

  const handleViewDetails = (agent) => {
    setSelectedAgent(agent);
    setIsDetailModalOpen(true);
  };

  const handleStopAgent = async (agent) => {
    try {
      // Parse the current config if it exists
      let configObj = {};
      try {
        if (agent.config) {
          configObj = JSON.parse(agent.config);
        }
      } catch (e) {
        console.warn('Failed to parse current agent config:', e);
      }
      
      // Update the config to set the agent to idle
      configObj = {
        ...configObj,
        status: 'idle',
        current_target: null,
        capability: null,
        deployed_at: null
      };
      
      // Update the agent in the backend
      const apiAgent = {
        config: JSON.stringify(configObj)
      };
      
      await updateAgent(agent.id, apiAgent);
      
      // Create updated agent with idle status for UI
      const updatedAgent = {
        ...agent,
        status: 'idle',
        currentTarget: null,
        capability: null,
        deployedSince: null,
        lastActivity: 'Just now'
      };
      
      // Update the UI
      setAgents(prevAgents => 
        prevAgents.map(a => 
          a.id === agent.id ? updatedAgent : a
        )
      );
    } catch (error) {
      console.error('Error stopping agent:', error);
      // Handle error (e.g., show notification)
    }
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
          <h1 className="text-3xl font-bold text-white mb-2">NFT-Agent Manager</h1>
          <p className="text-slate-400">Deploy and manage your agentic NFTs across target systems and environments.</p>
          {error && (
            <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}
        </div>
        <div className="mt-4 lg:mt-0">
          <button 
            onClick={() => setIsCreationModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
            disabled={isLoading}
          >
            <Plus className="w-5 h-5" />
            <span>Create Agent</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
            />
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-300 hover:text-white hover:border-slate-600/50 transition-all duration-200 flex items-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              viewMode === 'grid' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
            }`}
            aria-label="Grid view"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
            }`}
            aria-label="List view"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersDisplay()}

      {/* Categories */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:text-white hover:border-slate-600/50'
            }`}
          >
            <span className="font-medium">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Agent Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-300">Loading agents...</p>
          </div>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <Bot className="w-16 h-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Agents Found</h3>
          <p className="text-slate-400 text-center max-w-md mb-6">
            {searchTerm || activeFilters.length > 0 || selectedCategory !== 'all' 
              ? "No agents match your current filters. Try adjusting your search criteria."
              : "You don't have any agents yet. Create your first agent to get started."}
          </p>
          <button 
            onClick={() => setIsCreationModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Agent</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={agent.image} 
                  alt={agent.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(agent.status)} text-white flex items-center space-x-1`}>
                    {getStatusIcon(agent.status)}
                    <span className="capitalize">{agent.status}</span>
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors duration-200"
                    aria-label={`View details for ${agent.name}`}
                    onClick={() => handleViewDetails(agent)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors duration-200"
                    onClick={() => handleConfigClick(agent)}
                    aria-label={`Settings for ${agent.name}`}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{agent.name}</h3>
                  <p className="text-slate-400 text-sm">{agent.collection}</p>
                </div>
                
                {agent.currentTarget && (
                  <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Current Target:</span>
                      <Target className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-white font-medium text-sm">{agent.currentTarget}</p>
                    <p className="text-slate-300 text-xs">{agent.capability}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Inferences:</span>
                    <p className="text-white font-medium">{agent.totalInferences.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Success Rate:</span>
                    <p className="text-white font-medium">{agent.successRate}%</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Capabilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 2).map((capability, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                        {capability}
                      </span>
                    ))}
                    {agent.capabilities.length > 2 && (
                      <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                        +{agent.capabilities.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {agent.status === 'idle' ? (
                    <button 
                      onClick={() => handleDeployClick(agent)}
                      className="flex-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Deploy</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStopAgent(agent)}
                      className="flex-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/30 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop</span>
                    </button>
                  )}
                  <button className="bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500/50 p-2 rounded-lg transition-all duration-200">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30 border-b border-slate-600/50">
                <tr>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Agent</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Current Target</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Inferences</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Success Rate</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Last Activity</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-700/20 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img src={agent.image} alt={agent.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="text-white font-medium">{agent.name}</p>
                          <p className="text-slate-400 text-sm">{agent.collection}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(agent.status)} text-white flex items-center space-x-1 w-fit`}>
                        {getStatusIcon(agent.status)}
                        <span className="capitalize">{agent.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {agent.currentTarget ? (
                        <div>
                          <p className="text-white font-medium">{agent.currentTarget}</p>
                          <p className="text-slate-400 text-sm">{agent.capability}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-white font-medium">{agent.totalInferences.toLocaleString()}</td>
                    <td className="py-4 px-6 text-white font-medium">{agent.successRate}%</td>
                    <td className="py-4 px-6 text-slate-300">{agent.lastActivity}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {agent.status === 'idle' ? (
                          <button 
                            onClick={() => handleDeployClick(agent)}
                            className="p-2 text-green-400 hover:text-green-300 transition-colors duration-200"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStopAgent(agent)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(agent)}
                          className="p-2 text-slate-400 hover:text-white transition-colors duration-200"
                          aria-label={`View details for ${agent.name}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleConfigClick(agent)}
                          className="p-2 text-slate-400 hover:text-white transition-colors duration-200"
                          aria-label={`Settings for ${agent.name}`}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AgentCreationModal 
        isOpen={isCreationModalOpen} 
        onClose={() => setIsCreationModalOpen(false)} 
        onAgentCreated={handleAgentCreated} 
      />
      
      <AgentDeploymentModal 
        isOpen={isDeploymentModalOpen} 
        onClose={() => {
          setIsDeploymentModalOpen(false);
          setSelectedAgent(null);
        }} 
        agent={selectedAgent} 
        onAgentDeployed={handleAgentDeployed} 
      />
      
      <AgentConfigModal 
        isOpen={isConfigModalOpen} 
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedAgent(null);
        }} 
        agent={selectedAgent} 
        onAgentUpdated={handleAgentUpdated} 
      />

      <AdvancedFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={applyAdvancedFilters}
        initialFilters={activeFilters}
        filterOptions={filterOptions}
        entityType="agent"
      />

      <AgentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAgent(null);
        }}
        agent={selectedAgent}
        onDeploy={handleDeployClick}
        onStop={handleStopAgent}
        onConfigure={handleConfigClick}
      />
    </div>
  );
};