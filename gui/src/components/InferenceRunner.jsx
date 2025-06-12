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
  Zap,
  Image,
  FileText,
  Download,
  Eye,
  BarChart3
} from 'lucide-react';

export const InferenceRunner = () => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedCapabilities, setSelectedCapabilities] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const nfts = [
    {
      id: 1,
      name: 'CryptoPunk #7804',
      collection: 'CryptoPunks',
      image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      id: 2,
      name: 'Bored Ape #3749',
      collection: 'BAYC',
      image: 'https://images.pexels.com/photos/5380617/pexels-photo-5380617.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      id: 3,
      name: 'Art Blocks #182',
      collection: 'Art Blocks Curated',
      image: 'https://images.pexels.com/photos/5380613/pexels-photo-5380613.jpeg?auto=compress&cs=tinysrgb&w=200',
    }
  ];

  const capabilities = [
    {
      id: 1,
      name: 'GPT-4 Vision Analysis',
      type: 'vision',
      icon: Image,
      estimatedTime: '2-5 seconds',
      description: 'Analyze visual content and generate detailed descriptions'
    },
    {
      id: 2,
      name: 'Claude Sentiment Analysis',
      type: 'nlp',
      icon: FileText,
      estimatedTime: '1-3 seconds',
      description: 'Analyze sentiment and emotional context'
    },
    {
      id: 3,
      name: 'Style Classification',
      type: 'analysis',
      icon: BarChart3,
      estimatedTime: '3-8 seconds',
      description: 'Classify artistic style and characteristics'
    },
    {
      id: 4,
      name: 'Color Palette Extraction',
      type: 'vision',
      icon: Image,
      estimatedTime: '1-2 seconds',
      description: 'Extract dominant colors and palette information'
    }
  ];

  const inferenceLogs = [
    {
      id: 1,
      nft: 'CryptoPunk #7804',
      capability: 'GPT-4 Vision Analysis',
      status: 'completed',
      startTime: '2024-01-15T10:30:00Z',
      endTime: '2024-01-15T10:30:04Z',
      duration: '4.2s',
      result: 'Pixelated character with distinctive features identified. Male punk with mohawk hairstyle, earring, and sunglasses.'
    },
    {
      id: 2,
      nft: 'Bored Ape #3749',
      capability: 'Style Classification',
      status: 'running',
      startTime: '2024-01-15T10:31:00Z',
      endTime: null,
      duration: '2.1s',
      result: null
    },
    {
      id: 3,
      nft: 'Art Blocks #182',
      capability: 'Color Palette Extraction',
      status: 'completed',
      startTime: '2024-01-15T10:29:00Z',
      endTime: '2024-01-15T10:29:02Z',
      duration: '1.8s',
      result: 'Primary colors: #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7'
    },
    {
      id: 4,
      nft: 'CryptoPunk #7804',
      capability: 'Claude Sentiment Analysis',
      status: 'failed',
      startTime: '2024-01-15T10:28:00Z',
      endTime: '2024-01-15T10:28:10Z',
      duration: '10.0s',
      result: 'Error: Rate limit exceeded. Please try again later.'
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

  const handleRunInference = () => {
    if (!selectedNFT || selectedCapabilities.length === 0) return;
    setIsRunning(true);
    // Simulate inference running
    setTimeout(() => {
      setIsRunning(false);
    }, 5000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Inference Runner</h1>
          <p className="text-slate-400">Execute AI-powered analysis on your NFT assets with real-time monitoring.</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <button className="bg-slate-800/50 border border-slate-700/50 text-slate-300 px-4 py-2 rounded-lg hover:text-white hover:border-slate-600/50 transition-all duration-200 flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configure</span>
          </button>
          <button 
            onClick={handleRunInference}
            disabled={!selectedNFT || selectedCapabilities.length === 0 || isRunning}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Run Inference</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NFT Selection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-4">Select NFT</h2>
          <div className="space-y-3">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                onClick={() => setSelectedNFT(nft)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedNFT?.id === nft.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                    : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30'
                }`}
              >
                <img 
                  src={nft.image} 
                  alt={nft.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-white font-medium">{nft.name}</p>
                  <p className="text-slate-400 text-sm">{nft.collection}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capability Selection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-4">Select Capabilities</h2>
          <div className="space-y-3">
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              const isSelected = selectedCapabilities.includes(capability.id);
              
              return (
                <div
                  key={capability.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCapabilities(prev => prev.filter(id => id !== capability.id));
                    } else {
                      setSelectedCapabilities(prev => [...prev, capability.id]);
                    }
                  }}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30'
                      : 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-600/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-medium">{capability.name}</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{capability.description}</p>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">{capability.estimatedTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-4">Execution Status</h2>
          {selectedNFT && selectedCapabilities.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={selectedNFT.image} 
                    alt={selectedNFT.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{selectedNFT.name}</p>
                    <p className="text-slate-400 text-sm">{selectedCapabilities.length} capabilities selected</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {selectedCapabilities.map((capId) => {
                    const capability = capabilities.find(c => c.id === capId);
                    return (
                      <div key={capId} className="flex items-center justify-between py-2">
                        <span className="text-slate-300 text-sm">{capability?.name}</span>
                        <span className="text-slate-400 text-sm">{capability?.estimatedTime}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {isRunning && (
                <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-blue-400 font-medium">Running Inference...</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000" style={{width: '60%'}}></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-400">Select an NFT and capabilities to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Inference Logs */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Inference Logs</h2>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">Clear All</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30">
              <tr>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">Status</th>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">NFT</th>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">Capability</th>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">Duration</th>
                <th className="text-left py-3 px-6 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {inferenceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/20 transition-colors duration-200">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white font-medium">{log.nft}</td>
                  <td className="py-4 px-6 text-slate-300">{log.capability}</td>
                  <td className="py-4 px-6 text-slate-300">{log.duration}</td>
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