import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Check, 
  AlertCircle,
  Zap,
  Target,
  Bot
} from 'lucide-react';

const AgentCreationModal = ({ isOpen, onClose, onAgentCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    collection: '',
    imageURL: '',
    capabilities: [],
    targetTypes: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [availableCapabilities, setAvailableCapabilities] = useState([]);
  const [availableTargetTypes, setAvailableTargetTypes] = useState([]);

  // Sample data for capabilities and target types
  // In a real implementation, these would be fetched from the API
  useEffect(() => {
    // Simulating API fetch
    setAvailableCapabilities([
      { id: 'web_analysis', name: 'Web Analysis' },
      { id: 'data_extraction', name: 'Data Extraction' },
      { id: 'content_monitoring', name: 'Content Monitoring' },
      { id: 'file_analysis', name: 'File Analysis' },
      { id: 'document_processing', name: 'Document Processing' },
      { id: 'security_analysis', name: 'Security Analysis' },
      { id: 'code_analysis', name: 'Code Analysis' }
    ]);

    setAvailableTargetTypes([
      { id: 'browser', name: 'Browser' },
      { id: 'filesystem', name: 'File System' },
      { id: 'application', name: 'Applications' },
      { id: 'system', name: 'System' },
      { id: 'network', name: 'Network' }
    ]);
  }, []);

  // Sample image options
  const sampleImages = [
    'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/5380617/pexels-photo-5380617.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/5380613/pexels-photo-5380613.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/5380665/pexels-photo-5380665.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/5380668/pexels-photo-5380668.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/5380671/pexels-photo-5380671.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageSelect = (url) => {
    setFormData(prev => ({ ...prev, imageURL: url }));
    
    // Clear error for imageURL if it exists
    if (errors.imageURL) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.imageURL;
        return newErrors;
      });
    }
  };

  const handleCapabilityToggle = (capabilityId) => {
    setFormData(prev => {
      const newCapabilities = prev.capabilities.includes(capabilityId)
        ? prev.capabilities.filter(id => id !== capabilityId)
        : [...prev.capabilities, capabilityId];
      
      return { ...prev, capabilities: newCapabilities };
    });
    
    // Clear error for capabilities if it exists
    if (errors.capabilities) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.capabilities;
        return newErrors;
      });
    }
  };

  const handleTargetTypeToggle = (targetTypeId) => {
    setFormData(prev => {
      const newTargetTypes = prev.targetTypes.includes(targetTypeId)
        ? prev.targetTypes.filter(id => id !== targetTypeId)
        : [...prev.targetTypes, targetTypeId];
      
      return { ...prev, targetTypes: newTargetTypes };
    });
    
    // Clear error for targetTypes if it exists
    if (errors.targetTypes) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.targetTypes;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Agent name is required';
    }
    
    if (!formData.collection.trim()) {
      newErrors.collection = 'Collection name is required';
    }
    
    if (!formData.imageURL) {
      newErrors.imageURL = 'Please select an image for your agent';
    }
    
    if (formData.capabilities.length === 0) {
      newErrors.capabilities = 'Select at least one capability';
    }
    
    if (formData.targetTypes.length === 0) {
      newErrors.targetTypes = 'Select at least one target type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Prepare the agent data for the API
      const agentData = {
        name: formData.name,
        collection: formData.collection,
        image_url: formData.imageURL,
        status: 'idle', // Default status for new agents
        capabilities: formData.capabilities,
        target_types: formData.targetTypes,
        owner_id: 1, // Assuming user ID 1 for now
        token_id: Math.floor(Math.random() * 10000).toString(), // Generate a random token ID
        contract_addr: '0x123...' // Placeholder contract address
      };
      
      // Simulate API call
      // const response = await fetch('/api/v1/agents', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(agentData),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to create agent');
      // }
      
      // const data = await response.json();
      
      setSubmitStatus('success');
      
      // Notify parent component of successful creation
      if (onAgentCreated) {
        onAgentCreated({
          id: Date.now(), // Temporary ID for demo
          ...agentData
        });
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          collection: '',
          imageURL: '',
          capabilities: [],
          targetTypes: []
        });
        setSubmitStatus(null);
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error creating agent:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-slate-800 rounded-xl border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Create New NFT-Agent</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-slate-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter agent name (e.g., CyberPunk Agent #7804)"
                  className={`w-full bg-slate-700/50 border ${errors.name ? 'border-red-500/50' : 'border-slate-600/50'} rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="collection" className="block text-sm font-medium text-slate-300 mb-2">
                  Collection
                </label>
                <input
                  type="text"
                  id="collection"
                  name="collection"
                  value={formData.collection}
                  onChange={handleChange}
                  placeholder="Enter collection name (e.g., CyberPunk Collective)"
                  className={`w-full bg-slate-700/50 border ${errors.collection ? 'border-red-500/50' : 'border-slate-600/50'} rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.collection && (
                  <p className="mt-1 text-sm text-red-400">{errors.collection}</p>
                )}
              </div>
            </div>
            
            {/* Agent Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Agent Image</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select an image for your agent
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {sampleImages.map((url, index) => (
                    <div 
                      key={index}
                      onClick={() => handleImageSelect(url)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        formData.imageURL === url 
                          ? 'border-purple-500 ring-2 ring-purple-500/50' 
                          : 'border-transparent hover:border-slate-500'
                      }`}
                    >
                      <img 
                        src={url} 
                        alt={`Agent image option ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      {formData.imageURL === url && (
                        <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {errors.imageURL && (
                  <p className="mt-1 text-sm text-red-400">{errors.imageURL}</p>
                )}
              </div>
            </div>
            
            {/* Capabilities */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Capabilities</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select capabilities for your agent
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableCapabilities.map((capability) => (
                    <div 
                      key={capability.id}
                      onClick={() => handleCapabilityToggle(capability.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                        formData.capabilities.includes(capability.id)
                          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30'
                          : 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-600/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{capability.name}</span>
                        {formData.capabilities.includes(capability.id) && (
                          <Check className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.capabilities && (
                  <p className="mt-1 text-sm text-red-400">{errors.capabilities}</p>
                )}
              </div>
            </div>
            
            {/* Target Types */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Target Types</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select target types your agent can interact with
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableTargetTypes.map((targetType) => (
                    <div 
                      key={targetType.id}
                      onClick={() => handleTargetTypeToggle(targetType.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                        formData.targetTypes.includes(targetType.id)
                          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30'
                          : 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-600/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{targetType.name}</span>
                        {formData.targetTypes.includes(targetType.id) && (
                          <Check className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.targetTypes && (
                  <p className="mt-1 text-sm text-red-400">{errors.targetTypes}</p>
                )}
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/80">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors duration-200"
            >
              Cancel
            </button>
            
            <div className="flex items-center space-x-3">
              {submitStatus === 'success' && (
                <div className="flex items-center text-green-400 space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Agent created successfully!</span>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="flex items-center text-red-400 space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to create agent</span>
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>Create Agent</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCreationModal;