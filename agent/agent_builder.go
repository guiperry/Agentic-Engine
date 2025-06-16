package agent

import (
	"fmt"
	"github.com/google/uuid"
)

// AgentConfig represents the configuration for an agent
type AgentConfig struct {
	AgentID          string                 `json:"agent_id,omitempty"`
	AgentType        string                 `json:"agent_type"`
	Name             string                 `json:"name"`
	Model            string                 `json:"model,omitempty"`
	Instruction      string                 `json:"instruction,omitempty"`
	Description      string                 `json:"description,omitempty"`
	UseSearch        bool                   `json:"use_search,omitempty"`
	UseCodeExecution bool                   `json:"use_code_execution,omitempty"`
	UseVertexSearch  bool                   `json:"use_vertex_search,omitempty"`
	VertexDatastoreID string                `json:"vertex_datastore_id,omitempty"`
	CustomTools      []Tool                 `json:"custom_tools,omitempty"`
	SubAgents        []string               `json:"sub_agents,omitempty"`
	MaxIterations    int                    `json:"max_iterations,omitempty"`
	ExtraParams      map[string]interface{} `json:"extra_params,omitempty"`
}

// Tool represents a tool configuration for an agent
type Tool struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Endpoint    string                 `json:"endpoint"`
	Parameters  map[string]interface{} `json:"parameters"`
}

// AgentBuilder manages the creation and execution of agents
type AgentBuilder struct {
	registry *AgentRegistry
}

// NewAgentBuilder creates a new agent builder
func NewAgentBuilder(dbPath string) (*AgentBuilder, error) {
	// Create the agent registry
	registry, err := NewAgentRegistry(dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create agent registry: %v", err)
	}

	return &AgentBuilder{
		registry: registry,
	}, nil
}

// BuildAgent creates a new agent
func (b *AgentBuilder) BuildAgent(config AgentConfig) (string, error) {
	// Generate an agent ID if not provided
	if config.AgentID == "" {
		config.AgentID = uuid.New().String()
	}

	// Convert config to map for storage
	configMap := map[string]interface{}{
		"agent_id":            config.AgentID,
		"agent_type":          config.AgentType,
		"name":                config.Name,
		"model":               config.Model,
		"instruction":         config.Instruction,
		"description":         config.Description,
		"use_search":          config.UseSearch,
		"use_code_execution":  config.UseCodeExecution,
		"use_vertex_search":   config.UseVertexSearch,
		"vertex_datastore_id": config.VertexDatastoreID,
		"custom_tools":        config.CustomTools,
		"sub_agents":          config.SubAgents,
		"max_iterations":      config.MaxIterations,
	}

	// Add extra parameters if provided
	if config.ExtraParams != nil {
		for k, v := range config.ExtraParams {
			configMap[k] = v
		}
	}

	// Store the agent configuration in the registry
	if err := b.registry.RegisterAgent(config.AgentID, configMap); err != nil {
		return "", fmt.Errorf("failed to register agent: %v", err)
	}

	return config.AgentID, nil
}

// GetAgent retrieves an agent configuration
func (b *AgentBuilder) GetAgent(agentID string) (AgentConfig, error) {
	// Get the agent configuration from the registry
	configMap, err := b.registry.GetAgent(agentID)
	if err != nil {
		return AgentConfig{}, fmt.Errorf("failed to get agent: %v", err)
	}

	// Convert map to AgentConfig
	config := AgentConfig{
		AgentID:          configMap["agent_id"].(string),
		AgentType:        configMap["agent_type"].(string),
		Name:             configMap["name"].(string),
		Model:            configMap["model"].(string),
		Instruction:      configMap["instruction"].(string),
		Description:      configMap["description"].(string),
		UseSearch:        configMap["use_search"].(bool),
		UseCodeExecution: configMap["use_code_execution"].(bool),
		UseVertexSearch:  configMap["use_vertex_search"].(bool),
		VertexDatastoreID: configMap["vertex_datastore_id"].(string),
	}

	// Convert max_iterations
	if maxIter, ok := configMap["max_iterations"].(float64); ok {
		config.MaxIterations = int(maxIter)
	}

	// Convert sub_agents
	if subAgents, ok := configMap["sub_agents"].([]interface{}); ok {
		config.SubAgents = make([]string, len(subAgents))
		for i, sa := range subAgents {
			config.SubAgents[i] = sa.(string)
		}
	}

	// Convert custom_tools
	if customTools, ok := configMap["custom_tools"].([]interface{}); ok {
		config.CustomTools = make([]Tool, len(customTools))
		for i, ct := range customTools {
			toolMap := ct.(map[string]interface{})
			config.CustomTools[i] = Tool{
				Name:        toolMap["name"].(string),
				Description: toolMap["description"].(string),
				Endpoint:    toolMap["endpoint"].(string),
				Parameters:  toolMap["parameters"].(map[string]interface{}),
			}
		}
	}

	return config, nil
}

// DeleteAgent deletes an agent
func (b *AgentBuilder) DeleteAgent(agentID string) error {
	return b.registry.DeleteAgent(agentID)
}

// ListAgents lists all agents
func (b *AgentBuilder) ListAgents() ([]string, error) {
	return b.registry.ListAgents()
}

// Close closes the agent builder
func (b *AgentBuilder) Close() error {
	return b.registry.Close()
}