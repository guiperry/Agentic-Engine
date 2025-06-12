import React, { useState } from 'react';
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

export const AgentManager = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const categories = [
    { id: 'all', name: 'All Agents' },
    { id: 'active', name: 'Active' },
    { id: 'idle', name: 'Idle' },
    { id: 'deployed', name: 'Deployed' },
    { id: 'maintenance', name: 'Maintenance' },
  ];

  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'CyberPunk Agent #7804',
      collection: 'CyberPunk Collective',
      image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'active',
      currentTarget: 'Chrome Browser',
      capability: 'Web Scraping Analysis',
      deployedSince: '2 hours ago',
      totalInferences: 247,
      successRate: 98.7,
      lastActivity: '2 minutes ago',
      capabilities: ['Web Analysis', 'Data Extraction', 'Content Monitoring'],
      targetTypes: ['Browser', 'Web APIs', 'Social Media']
    },
    {
      id: 2,
      name: 'Data Miner #3749',
      collection: 'Industrial Agents',
      image: 'https://images.pexels.com/photos/5380617/pexels-photo-5380617.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'deployed',
      currentTarget: 'Local File System',
      capability: 'Document Classification',
      deployedSince: '1 day ago',
      totalInferences: 1847,
      successRate: 94.2,
      lastActivity: '5 minutes ago',
      capabilities: ['File Analysis', 'Document Processing', 'Data Mining'],
      targetTypes: ['File System', 'Databases', 'Archives']
    },
    {
      id: 3,
      name: 'Security Guardian #182',
      collection: 'Defense Protocol',
      image: 'https://images.pexels.com/photos/5380613/pexels-photo-5380613.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'monitoring',
      currentTarget: 'Network Interface',
      capability: 'Threat Detection',
      deployedSince: '6 hours ago',
      totalInferences: 892,
      successRate: 99.1,
      lastActivity: '12 minutes ago',
      capabilities: ['Security Analysis', 'Threat Detection', 'Network Monitoring'],
      targetTypes: ['Network', 'System Processes', 'Security Logs']
    },
    {
      id: 4,
      name: 'Code Reviewer #7894',
      collection: 'Developer Tools',
      image: 'https://images.pexels.com/photos/5380665/pexels-photo-5380665.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'idle',
      currentTarget: null,
      capability: null,
      deployedSince: null,
      totalInferences: 156,
      successRate: 87.3,
      lastActivity: '2 hours ago',
      capabilities: ['Code Analysis', 'Quality Assessment', 'Bug Detection'],
      targetTypes: ['IDE', 'Git Repositories', 'Code Files']
    },
    {
      id: 5,
      name: 'Media Processor #1256',
      collection: 'Creative Suite',
      image: 'https://images.pexels.com/photos/5380668/pexels-photo-5380668.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'active',
      currentTarget: 'Adobe Photoshop',
      capability: 'Image Enhancement',
      deployedSince: '30 minutes ago',
      totalInferences: 67,
      successRate: 96.8,
      lastActivity: '1 minute ago',
      capabilities: ['Image Processing', 'Media Analysis', 'Creative Enhancement'],
      targetTypes: ['Creative Software', 'Media Files', 'Design Tools']
    },
    {
      id: 6,
      name: 'System Monitor #4523',
      collection: 'Operations Center',
      image: 'https://images.pexels.com/photos/5380671/pexels-photo-5380671.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'maintenance',
      currentTarget: null,
      capability: null,
      deployedSince: null,
      totalInferences: 2341,
      successRate: 91.7,
      lastActivity: '1 day ago',
      capabilities: ['System Monitoring', 'Performance Analysis', 'Resource Management'],
      targetTypes: ['Operating System', 'Hardware', 'System Processes']
    }
  ]);

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

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.collection.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || agent.status === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAgentCreated = (newAgent) => {
    setAgents(prevAgents => [...prevAgents, { ...newAgent, id: prevAgents.length + 1 }]);
    setIsCreationModalOpen(false);
  };

  const handleAgentDeployed = (updatedAgent) => {
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === updatedAgent.id ? updatedAgent : agent
      )
    );
    setIsDeploymentModalOpen(false);
    setSelectedAgent(null);
  };

  const handleAgentUpdated = (updatedAgent) => {
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === updatedAgent.id ? updatedAgent : agent
      )
    );
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

  const handleStopAgent = (agent) => {
    // In a real implementation, this would call an API to stop the agent
    const updatedAgent = {
      ...agent,
      status: 'idle',
      currentTarget: null,
      capability: null,
      deployedSince: null
    };
    
    setAgents(prevAgents => 
      prevAgents.map(a => 
        a.id === agent.id ? updatedAgent : a
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">NFT-Agent Manager</h1>
          <p className="text-slate-400">Deploy and manage your agentic NFTs across target systems and environments.</p>
        </div>
        <div className="mt-4 lg:mt-0">
          <button 
            onClick={() => setIsCreationModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
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
          <button className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-300 hover:text-white hover:border-slate-600/50 transition-all duration-200 flex items-center space-x-2">
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
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

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
      {viewMode === 'grid' ? (
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
                  <button className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors duration-200">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors duration-200"
                    onClick={() => handleConfigClick(agent)}
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
                        <button className="p-2 text-slate-400 hover:text-white transition-colors duration-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleConfigClick(agent)}
                          className="p-2 text-slate-400 hover:text-white transition-colors duration-200"
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
    </div>
  );
};