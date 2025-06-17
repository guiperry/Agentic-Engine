// API utility functions for the Agentic Engine

// Base API URL - adjust based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/v1' 
  : 'http://localhost:8080/api/v1';

// Agent interfaces based on the backend model in api/agent_service.go
export interface Agent {
  id: string;
  owner_id: number;
  name: string;
  type: string;
  config: string;
  created_at?: string;
  updated_at?: string;
  
  // Frontend-specific fields (not in backend model)
  collection?: string;
  image_url?: string;
  status?: string;
  capabilities?: string[];
  target_types?: string[];
}

export interface AgentCreationRequest {
  name: string;
  type: string;
  config: string;
  
  // Frontend-specific fields to be stored in config
  collection?: string;
  image_url?: string;
  capabilities?: string[];
  target_types?: string[];
}

// Agent API functions
export const fetchAgents = async (ownerId: number): Promise<Agent[]> => {
  // ownerId is currently not used in the API call but kept for future implementation
  try {
    // The backend API doesn't support query parameters for filtering by owner_id
    // Instead, it uses the user ID from the authentication context
    const response = await fetch(`${API_BASE_URL}/agents`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process each agent to extract frontend-specific fields from config
    return data.agents.map((agent: Agent) => {
      let configData: Record<string, any> = {};
      try {
        if (agent.config) {
          configData = JSON.parse(agent.config);
        }
      } catch (e) {
        console.warn(`Failed to parse config for agent ${agent.id}:`, e);
      }
      
      return {
        ...agent,
        collection: configData && 'collection' in configData ? configData.collection : '',
        image_url: configData && 'image_url' in configData ? configData.image_url : '',
        capabilities: configData && 'capabilities' in configData ? configData.capabilities : [],
        target_types: configData && 'target_types' in configData ? configData.target_types : [],
        status: configData && 'status' in configData ? configData.status : 'idle'
      };
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

export const fetchAgentById = async (id: string): Promise<Agent> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch agent: ${response.statusText}`);
    }
    
    const data = await response.json();
    const agent = data.agent;
    
    // Extract frontend-specific fields from config
    let configData: Record<string, any> = {};
    try {
      if (agent.config) {
        configData = JSON.parse(agent.config);
      }
    } catch (e) {
      console.warn(`Failed to parse config for agent ${agent.id}:`, e);
    }
    
    return {
      ...agent,
      collection: configData && 'collection' in configData ? configData.collection : '',
      image_url: configData && 'image_url' in configData ? configData.image_url : '',
      capabilities: configData && 'capabilities' in configData ? configData.capabilities : [],
      target_types: configData && 'target_types' in configData ? configData.target_types : [],
      status: configData && 'status' in configData ? configData.status : 'idle'
    };
  } catch (error) {
    console.error(`Error fetching agent ${id}:`, error);
    throw error;
  }
};

export const createAgent = async (agentData: AgentCreationRequest): Promise<Agent> => {
  try {
    // Prepare the agent data according to the backend model
    const configObj = {
      collection: agentData.collection || '',
      image_url: agentData.image_url || '',
      capabilities: agentData.capabilities || [],
      target_types: agentData.target_types || [],
      status: 'idle'
    };
    
    // Create the API request payload
    const apiPayload = {
      name: agentData.name,
      type: agentData.type || 'standard',
      config: agentData.config || JSON.stringify(configObj)
    };
    
    const response = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Parse the config string to extract frontend-specific fields
    let configData: Record<string, any> = {};
    try {
      if (data.agent.config) {
        configData = JSON.parse(data.agent.config);
      }
    } catch (e) {
      console.warn('Failed to parse agent config:', e);
    }
    
    // Combine backend data with frontend-specific fields from config
    return {
      ...data.agent,
      collection: configData && 'collection' in configData ? configData.collection : '',
      image_url: configData && 'image_url' in configData ? configData.image_url : '',
      capabilities: configData && 'capabilities' in configData ? configData.capabilities : [],
      target_types: configData && 'target_types' in configData ? configData.target_types : [],
      status: configData && 'status' in configData ? configData.status : 'idle'
    };
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
};

export const updateAgent = async (id: string, agentData: Partial<Agent>): Promise<Agent> => {
  try {
    // First, get the current agent to merge with updates
    const currentAgent = await fetchAgentById(id);
    
    // Parse the current config
    interface AgentConfig {
      collection?: string;
      image_url?: string;
      capabilities?: string[];
      target_types?: string[];
      status?: string;
    }
    
    let configObj: AgentConfig = {};
    try {
      configObj = JSON.parse(currentAgent.config);
    } catch (e) {
      console.warn('Failed to parse current agent config:', e);
    }
    
    // Update the config object with new frontend-specific fields
    if (agentData.collection !== undefined) configObj.collection = agentData.collection;
    if (agentData.image_url !== undefined) configObj.image_url = agentData.image_url;
    if (agentData.capabilities !== undefined) configObj.capabilities = agentData.capabilities;
    if (agentData.target_types !== undefined) configObj.target_types = agentData.target_types;
    if (agentData.status !== undefined) configObj.status = agentData.status;
    
    // Create the API request payload
    const apiPayload: Partial<Agent> = {
      name: agentData.name !== undefined ? agentData.name : currentAgent.name,
      type: agentData.type !== undefined ? agentData.type : currentAgent.type,
      config: JSON.stringify(configObj)
    };
    
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update agent: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Parse the updated config string to extract frontend-specific fields
    let updatedConfigData: Record<string, any> = {};
    try {
      if (data.agent.config) {
        updatedConfigData = JSON.parse(data.agent.config);
      }
    } catch (e) {
      console.warn('Failed to parse updated agent config:', e);
    }
    
    // Combine backend data with frontend-specific fields from config
    return {
      ...data.agent,
      collection: updatedConfigData && 'collection' in updatedConfigData ? updatedConfigData.collection : '',
      image_url: updatedConfigData && 'image_url' in updatedConfigData ? updatedConfigData.image_url : '',
      capabilities: updatedConfigData && 'capabilities' in updatedConfigData ? updatedConfigData.capabilities : [],
      target_types: updatedConfigData && 'target_types' in updatedConfigData ? updatedConfigData.target_types : [],
      status: updatedConfigData && 'status' in updatedConfigData ? updatedConfigData.status : 'idle'
    };
  } catch (error) {
    console.error(`Error updating agent ${id}:`, error);
    throw error;
  }
};

export const deleteAgent = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete agent: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error deleting agent ${id}:`, error);
    throw error;
  }
};

// Workflow interfaces
export interface WorkflowRequest {
  agent_id: string;
  target_id: string;
  capability_id: string;
  input: Record<string, any>;
}

export interface Workflow {
  id: string;
  status: string;
  start_time: string;
  end_time?: string;
  agent_id: string;
  target_id: string;
  capability_id: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  owner_id: number;
}

// Workflow API functions
export const startWorkflow = async (workflowData: WorkflowRequest): Promise<Workflow> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflowData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to start workflow: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.workflow;
  } catch (error) {
    console.error('Error starting workflow:', error);
    throw error;
  }
};

export const fetchWorkflow = async (id: string): Promise<Workflow> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workflow: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.workflow;
  } catch (error) {
    console.error(`Error fetching workflow ${id}:`, error);
    throw error;
  }
};

export const fetchWorkflows = async (): Promise<Workflow[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workflows`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.workflows;
  } catch (error) {
    console.error('Error fetching workflows:', error);
    throw error;
  }
};

export const cancelWorkflow = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}/cancel`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to cancel workflow: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error canceling workflow ${id}:`, error);
    throw error;
  }
};

// ADK Agent interfaces
export interface ADKAgentConfig {
  agent_id?: string;
  agent_type: 'llm' | 'sequential' | 'parallel' | 'loop';
  name: string;
  model?: string;
  instruction?: string;
  description?: string;
  use_search?: boolean;
  use_code_execution?: boolean;
  use_vertex_search?: boolean;
  vertex_datastore_id?: string;
  custom_tools?: ADKTool[];
  sub_agents?: string[];
  max_iterations?: number;
  extra_params?: Record<string, any>;
}

export interface ADKTool {
  name: string;
  description: string;
  endpoint: string;
  parameters: Record<string, any>;
}

// ADK Agent API functions
export const createADKAgent = async (config: ADKAgentConfig): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/adk/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create ADK agent: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.agent_id;
  } catch (error) {
    console.error('Error creating ADK agent:', error);
    throw error;
  }
};

export const runADKAgent = async (
  agentId: string, 
  input: string, 
  sessionId: string = 'default'
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/adk/agents/${agentId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        session_id: sessionId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to run ADK agent: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error(`Error running ADK agent ${agentId}:`, error);
    throw error;
  }
};

export const getADKAgent = async (agentId: string): Promise<ADKAgentConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/adk/agents/${agentId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get ADK agent: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.agent;
  } catch (error) {
    console.error(`Error getting ADK agent ${agentId}:`, error);
    throw error;
  }
};

export const listADKAgents = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/adk/agents`);
    
    if (!response.ok) {
      throw new Error(`Failed to list ADK agents: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.agents;
  } catch (error) {
    console.error('Error listing ADK agents:', error);
    throw error;
  }
};

export const deleteADKAgent = async (agentId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/adk/agents/${agentId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete ADK agent: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error deleting ADK agent ${agentId}:`, error);
    throw error;
  }
};

// ADK Agent-to-Agent (A2A) Communication Interfaces
export interface DiscoveredAgent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  endpoint: string;
}

export interface AgentMessage {
  sender_id: string;
  recipient_id: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AgentTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
}

export interface AgentCapabilities {
  agent_id: string;
  capabilities: string[];
  updated_at: string;
}

// ADK Agent-to-Agent (A2A) Communication API functions
export const discoverAgents = async (): Promise<DiscoveredAgent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/discover`);
    
    if (!response.ok) {
      throw new Error(`Failed to discover agents: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.agents;
  } catch (error) {
    console.error('Error discovering agents:', error);
    throw error;
  }
};

export const sendAgentMessage = async (
  recipientId: string,
  content: string,
  metadata?: Record<string, any>
): Promise<AgentMessage> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient_id: recipientId,
        content,
        metadata
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send agent message: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error sending agent message:', error);
    throw error;
  }
};

export const getAgentTask = async (taskId: string): Promise<AgentTask> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/tasks/${taskId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get agent task: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.task;
  } catch (error) {
    console.error(`Error getting agent task ${taskId}:`, error);
    throw error;
  }
};

export const updateAgentCapabilities = async (
  agentId: string,
  capabilities: string[]
): Promise<AgentCapabilities> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/capabilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agentId,
        capabilities
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update agent capabilities: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.capabilities;
  } catch (error) {
    console.error(`Error updating capabilities for agent ${agentId}:`, error);
    throw error;
  }
};