import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  GitBranch,
  Bot,
  Target,
  Zap,
  Eye,
  Download,
  BarChart3,
  ArrowRight,
  Plus,
  Trash2
} from 'lucide-react';

export const InferenceOrchestrator = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedCapability, setSelectedCapability] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const agents = [
    {
      id: 1,
      name: 'CyberPunk Agent #7804',
      collection: 'CyberPunk Collective',
      image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=200',
      status: 'idle',
      capabilities: ['Web Analysis', 'Data Extraction', 'Content Monitoring']
    },
    {
      id: 2,
      name: 'Data Miner #3749',
      collection: 'Industrial Agents',
      image: 'https://images.pexels.com/photos/5380617/pexels-photo-5380617.jpeg?auto=compress&cs=tinysrgb&w=200',
      status: 'active',
      capabilities: ['File Analysis', 'Document Processing', 'Data Mining']
    },
    {
      id: 3,
      name: 'Security Guardian #182',
      collection: 'Defense Protocol',
      image: 'https://images.pexels.com/photos/5380613/pexels-photo-5380613.jpeg?auto=compress&cs=tinysrgb&w=200',
      status: 'idle',
      capabilities: ['Security Analysis', 'Threat Detection', 'Network Monitoring']
    }
  ];

  const targets = [
    {
      id: 1,
      name: 'Chrome Browser',
      type: 'browser',
      status: 'connected',
      capabilities: ['Web Scraping', 'DOM Analysis', 'Screenshot Capture']
    },
    {
      id: 2,
      name: 'Local File System',
      type: 'filesystem',
      status: 'connected',
      capabilities: ['File Analysis', 'Directory Scanning', 'Metadata Extraction']
    },
    {
      id: 3,
      name: 'VS Code Editor',
      type: 'application',
      status: 'limited',
      capabilities: ['Code Analysis', 'Syntax Highlighting', 'Error Detection']
    },
    {
      id: 4,
      name: 'Terminal/PowerShell',
      type: 'system',
      status: 'connected',
      capabilities: ['Command Execution', 'Process Monitoring', 'System Information']
    }
  ];

  const mcpCapabilities = [
    {
      id: 1,
      name: 'GPT-4 Vision Analysis',
      provider: 'OpenAI',
      type: 'vision',
      estimatedTime: '2-5 seconds',
      description: 'Advanced visual analysis and description generation'
    },
    {
      id: 2,
      name: 'Claude Text Analysis',
      provider: 'Anthropic',
      type: 'nlp',
      estimatedTime: '1-3 seconds',
      description: 'Natural language processing and understanding'
    },
    {
      id: 3,
      name: 'File Content Extraction',
      provider: 'Local MCP',
      type: 'extraction',
      estimatedTime: '1-2 seconds',
      description: 'Extract and analyze file contents and metadata'
    },
    {
      id: 4,
      name: 'Web Data Scraping',
      provider: 'Browser MCP',
      type: 'scraping',
      estimatedTime: '3-8 seconds',
      description: 'Extract structured data from web pages'
    }
  ];

  const orchestrationLogs = [
    {
      id: 1,
      agent: 'CyberPunk Agent #7804',
      target: 'Chrome Browser',
      capability: 'Web Data Scraping',
      status: 'completed',
      startTime: '2024-01-15T10:30:00Z',
      endTime: '2024-01-15T10:30:06Z',
      duration: '6.2s',
      result: 'Successfully extracted 247 data points from target website',
      dataExtracted: '247 items',
      successRate: 100
    },
    {
      id: 2,
      agent: 'Data Miner #3749',
      target: 'Local File System',
      capability: 'File Content Extraction',
      status: 'running',
      startTime: '2024-01-15T10:31:00Z',
      endTime: null,
      duration: '2.1s',
      result: null,
      dataExtracted: null,
      successRate: null
    },
    {
      id: 3,
      agent: 'Security Guardian #182',
      target: 'Terminal/PowerShell',
      capability: 'System Information',
      status: 'completed',
      startTime: '2024-01-15T10:29:00Z',
      endTime: '2024-01-15T10:29:03Z',
      duration: '3.1s',
      result: 'System analysis complete: 15 processes monitored, no threats detected',
      dataExtracted: '15 processes',
      successRate: 100
    },
    {
      id: 4,
      agent: 'CyberPunk Agent #7804',
      target: 'VS Code Editor',
      capability: 'Code Analysis',
      status: 'failed',
      startTime: '2024-01-15T10:28:00Z',
      endTime: '2024-01-15T10:28:10Z',
      duration: '10.0s',
      result: 'Error: Insufficient permissions to access editor workspace',
      dataExtracted: null,
      successRate: 0
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'running':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'running':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const handleRunOrchestration = () => {
    if (!selectedAgent || !selectedTarget || !selectedCapability) return;
    setIsRunning(true);
    // Simulate orchestration running
    setTimeout(() => {
      setIsRunning(false);
    }, 8000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Inference Orchestrator</h1>
          <p className="text-slate-400">Orchestrate complex inference workflows by connecting agents, targets, and capabilities.</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <button className="bg-slate-800/50 border border-slate-700/50 text-slate-300 px-4 py-2 rounded-lg hover:text-white hover:border-slate-600/50 transition-all duration-200 flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configure</span>
          </button>
          <button 
            onClick={handleRunOrchestration}
            disabled={!selectedAgent || !selectedTarget || !selectedCapability || isRunning}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Orchestrating...</span>
              </>
            ) : (
              <>
                <GitBranch className="w-5 h-5" />
                <span>Execute Workflow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Orchestration Builder */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-6">Workflow Builder</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
          {/* Agent Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Agent</h3>
            </div>
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedAgent?.id === agent.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30'
                      : 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-600/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <img 
                      src={agent.image} 
                      alt={agent.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{agent.name.split(' ')[0]} {agent.name.split(' ')[1]}</p>
                      <p className="text-slate-400 text-xs">{agent.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-slate-400" />
          </div>

          {/* Target Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Target</h3>
            </div>
            <div className="space-y-2">
              {targets.map((target) => (
                <div
                  key={target.id}
                  onClick={() => setSelectedTarget(target)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedTarget?.id === target.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30'
                      : 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-600/30'
                  }`}
                >
                  <p className="text-white font-medium text-sm">{target.name}</p>
                  <p className="text-slate-400 text-xs">{target.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-slate-400" />
          </div>

          {/* Capability Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Capability</h3>
            </div>
            <div className="space-y-2">
              {mcpCapabilities.map((capability) => (
                <div
                  key={capability.id}
                  onClick={() => setSelectedCapability(capability)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedCapability?.id === capability.id
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
                      : 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-600/30'
                  }`}
                >
                  <p className="text-white font-medium text-sm">{capability.name}</p>
                  <p className="text-slate-400 text-xs">{capability.provider}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workflow Summary */}
        {selectedAgent && selectedTarget && selectedCapability && (
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <h4 className="text-white font-semibold mb-3">Workflow Summary</h4>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-white">{selectedAgent.name}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-white">{selectedTarget.name}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-white">{selectedCapability.name}</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-2">
              Estimated execution time: {selectedCapability.estimatedTime}
            </p>
          </div>
        )}

        {/* Execution Status */}
        {isRunning && (
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Loader className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-blue-400 font-medium">Executing Workflow...</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Deploying agent to target system</span>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Initializing MCP capability</span>
                <Loader className="w-4 h-4 text-blue-400 animate-spin" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Processing inference request</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000" style={{width: '45%'}}></div>
            </div>
          </div>
        )}
      </div>

      {/* Orchestration Logs */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Orchestration Logs</h2>
            <div className="flex items-center space-x-2">
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">Export</button>
              <button className="text-slate-400 hover:text-white text-sm font-medium">Clear All</button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30">
              <tr>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">Status</th>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">Agent</th>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">Target</th>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">Capability</th>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">Duration</th>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">Result</th>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {orchestrationLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/20 transition-colors duration-200">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white font-medium">{log.agent}</td>
                  <td className="py-4 px-6 text-slate-300">{log.target}</td>
                  <td className="py-4 px-6 text-slate-300">{log.capability}</td>
                  <td className="py-4 px-6 text-slate-300">{log.duration}</td>
                  <td className="py-4 px-6">
                    {log.result ? (
                      <div>
                        <p className="text-white text-sm">{log.result.substring(0, 50)}...</p>
                        {log.dataExtracted && (
                          <p className="text-slate-400 text-xs">Data: {log.dataExtracted}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {log.result && (
                        <button className="p-1 text-slate-400 hover:text-white transition-colors duration-200">
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {log.status === 'completed' && (
                        <button className="p-1 text-slate-400 hover:text-white transition-colors duration-200">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1 text-slate-400 hover:text-white transition-colors duration-200">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};