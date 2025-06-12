import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  Monitor,
  Globe,
  Folder,
  Terminal,
  Smartphone,
  Server,
  Database,
  Code,
  Image,
  Settings,
  Eye,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  Shield,
  Lock
} from 'lucide-react';

export const TargetManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Targets', icon: Server },
    { id: 'browser', name: 'Browsers', icon: Globe },
    { id: 'filesystem', name: 'File Systems', icon: Folder },
    { id: 'application', name: 'Applications', icon: Code },
    { id: 'system', name: 'System', icon: Terminal },
    { id: 'network', name: 'Network', icon: Wifi },
    { id: 'mobile', name: 'Mobile', icon: Smartphone },
  ];

  const targets = [
    {
      id: 1,
      name: 'Chrome Browser',
      type: 'browser',
      category: 'Web Browser',
      status: 'connected',
      activeAgents: 8,
      lastActivity: '2 minutes ago',
      capabilities: ['Web Scraping', 'DOM Analysis', 'Cookie Management', 'Screenshot Capture'],
      permissions: ['read', 'write', 'execute'],
      security: 'high',
      version: '120.0.6099.109',
      platform: 'Windows 11',
      connectionMethod: 'Chrome Extension API',
      dataAccess: ['Browsing History', 'Bookmarks', 'Active Tabs', 'Downloads'],
      restrictions: ['No Private Browsing', 'No Payment Info'],
      icon: Globe
    },
    {
      id: 2,
      name: 'Local File System',
      type: 'filesystem',
      category: 'Storage',
      status: 'connected',
      activeAgents: 12,
      lastActivity: '5 minutes ago',
      capabilities: ['File Analysis', 'Directory Scanning', 'Content Indexing', 'Metadata Extraction'],
      permissions: ['read', 'write'],
      security: 'medium',
      version: 'NTFS',
      platform: 'Windows 11',
      connectionMethod: 'File System API',
      dataAccess: ['Documents', 'Downloads', 'Desktop', 'Pictures'],
      restrictions: ['No System Files', 'No Hidden Folders'],
      icon: Folder
    },
    {
      id: 3,
      name: 'VS Code Editor',
      type: 'application',
      category: 'Development Tool',
      status: 'limited',
      activeAgents: 3,
      lastActivity: '18 minutes ago',
      capabilities: ['Code Analysis', 'Syntax Highlighting', 'Error Detection', 'Refactoring'],
      permissions: ['read'],
      security: 'high',
      version: '1.85.1',
      platform: 'Windows 11',
      connectionMethod: 'VS Code Extension',
      dataAccess: ['Open Files', 'Workspace', 'Git Status'],
      restrictions: ['Read-only Access', 'No File Modification'],
      icon: Code
    },
    {
      id: 4,
      name: 'Terminal/PowerShell',
      type: 'system',
      category: 'System Interface',
      status: 'connected',
      activeAgents: 6,
      lastActivity: '1 minute ago',
      capabilities: ['Command Execution', 'Process Monitoring', 'System Information', 'Log Analysis'],
      permissions: ['read', 'execute'],
      security: 'high',
      version: '7.4.0',
      platform: 'Windows 11',
      connectionMethod: 'PowerShell API',
      dataAccess: ['System Processes', 'Environment Variables', 'Command History'],
      restrictions: ['No Admin Commands', 'Sandboxed Execution'],
      icon: Terminal
    },
    {
      id: 5,
      name: 'Network Interface',
      type: 'network',
      category: 'Network Monitor',
      status: 'monitoring',
      activeAgents: 4,
      lastActivity: '12 minutes ago',
      capabilities: ['Traffic Analysis', 'Connection Monitoring', 'Bandwidth Tracking', 'Security Scanning'],
      permissions: ['read'],
      security: 'high',
      version: 'Ethernet/WiFi',
      platform: 'Windows 11',
      connectionMethod: 'Network API',
      dataAccess: ['Connection Status', 'Traffic Stats', 'Active Connections'],
      restrictions: ['No Packet Injection', 'Monitor Only'],
      icon: Wifi
    },
    {
      id: 6,
      name: 'Adobe Photoshop',
      type: 'application',
      category: 'Creative Software',
      status: 'connected',
      activeAgents: 2,
      lastActivity: '30 minutes ago',
      capabilities: ['Image Processing', 'Layer Analysis', 'Filter Application', 'Export Automation'],
      permissions: ['read', 'write'],
      security: 'medium',
      version: '2024 (25.0)',
      platform: 'Windows 11',
      connectionMethod: 'CEP Extension',
      dataAccess: ['Open Documents', 'Layer Structure', 'History'],
      restrictions: ['No Cloud Access', 'Local Files Only'],
      icon: Image
    },
    {
      id: 7,
      name: 'iPhone 15 Pro',
      type: 'mobile',
      category: 'Mobile Device',
      status: 'disconnected',
      activeAgents: 0,
      lastActivity: '2 hours ago',
      capabilities: ['App Monitoring', 'Notification Analysis', 'Usage Tracking', 'Photo Analysis'],
      permissions: [],
      security: 'high',
      version: 'iOS 17.2',
      platform: 'iOS',
      connectionMethod: 'Mobile App Bridge',
      dataAccess: [],
      restrictions: ['Requires App Installation', 'Limited Permissions'],
      icon: Smartphone
    },
    {
      id: 8,
      name: 'PostgreSQL Database',
      type: 'database',
      category: 'Database',
      status: 'connected',
      activeAgents: 5,
      lastActivity: '8 minutes ago',
      capabilities: ['Query Execution', 'Schema Analysis', 'Data Mining', 'Performance Monitoring'],
      permissions: ['read'],
      security: 'high',
      version: '15.4',
      platform: 'Docker Container',
      connectionMethod: 'Database Driver',
      dataAccess: ['Public Schema', 'User Tables', 'Query Logs'],
      restrictions: ['Read-only Access', 'No DDL Operations'],
      icon: Database
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'monitoring':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'limited':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'disconnected':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'maintenance':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'monitoring':
        return <Eye className="w-4 h-4" />;
      case 'limited':
        return <AlertTriangle className="w-4 h-4" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4" />;
      case 'maintenance':
        return <Settings className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getSecurityColor = (security) => {
    switch (security) {
      case 'high':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : Server;
  };

  const filteredTargets = targets.filter(target => {
    const matchesSearch = target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || target.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Target System Manager</h1>
          <p className="text-slate-400">Connect and manage target systems where your NFT-Agents can operate.</p>
        </div>
        <div className="mt-4 lg:mt-0">
          <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Target</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search target systems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-300 hover:text-white hover:border-slate-600/50 transition-all duration-200 flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </div>

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

      {/* Target Systems Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTargets.map((target) => {
          const Icon = target.icon;
          return (
            <div key={target.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{target.name}</h3>
                    <p className="text-slate-400 text-sm">{target.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(target.status)}`}>
                    {getStatusIcon(target.status)}
                    <span className="capitalize">{target.status}</span>
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Active Agents:</span>
                    <span className="text-white font-medium">{target.activeAgents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Platform:</span>
                    <span className="text-white font-medium">{target.platform}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Version:</span>
                    <span className="text-white font-medium">{target.version}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Security:</span>
                    <div className="flex items-center space-x-1">
                      <Shield className={`w-3 h-3 ${getSecurityColor(target.security)}`} />
                      <span className={`font-medium capitalize ${getSecurityColor(target.security)}`}>
                        {target.security}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Connection:</span>
                    <span className="text-white font-medium text-xs">{target.connectionMethod}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Last Activity:</span>
                    <span className="text-white font-medium text-xs">{target.lastActivity}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {target.permissions.map((permission, index) => (
                      <span key={index} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30 flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>{permission}</span>
                      </span>
                    ))}
                    {target.permissions.length === 0 && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                        No permissions
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm mb-2">Capabilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {target.capabilities.slice(0, 3).map((capability, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                        {capability}
                      </span>
                    ))}
                    {target.capabilities.length > 3 && (
                      <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                        +{target.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {target.status === 'disconnected' ? (
                  <button className="flex-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Connect</span>
                  </button>
                ) : (
                  <button className="flex-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/30 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                    <Pause className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                )}
                <button className="bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500/50 p-2 rounded-lg transition-all duration-200">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500/50 p-2 rounded-lg transition-all duration-200">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};