package agent

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/philippgille/chromem-go"
)

// AgentRegistry manages agent storage and retrieval using chromem-go
type AgentRegistry struct {
	db         *chromem.DB
	collection *chromem.Collection
}

// NewAgentRegistry creates a new agent registry
func NewAgentRegistry(dbPath string) (*AgentRegistry, error) {
	// Create a new persistent database
	db, err := chromem.NewPersistentDB(dbPath, false)
	if err != nil {
		return nil, fmt.Errorf("failed to create chromem-go database: %v", err)
	}

	// Get or create the agents collection
	collection, err := db.GetOrCreateCollection("adk_agents", nil, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get/create agents collection: %v", err)
	}

	return &AgentRegistry{
		db:         db,
		collection: collection,
	}, nil
}

// RegisterAgent stores an agent configuration in the registry
func (r *AgentRegistry) RegisterAgent(agentID string, config map[string]interface{}) error {
	// Convert config to JSON for storage
	configJSON, err := json.Marshal(config)
	if err != nil {
		return fmt.Errorf("failed to marshal agent config: %v", err)
	}

	// Create metadata for search
	metadata := map[string]string{
		"agent_id":   agentID,
		"agent_type": config["agent_type"].(string),
		"name":       config["name"].(string),
	}

	// Create document for chromem-go
	doc := chromem.Document{
		ID:       agentID,
		Content:  string(configJSON),
		Metadata: metadata,
	}

	// Store agent in chromem-go
	ctx := context.Background()
	err = r.collection.AddDocument(ctx, doc)
	if err != nil {
		return fmt.Errorf("failed to store agent: %v", err)
	}

	return nil
}

// GetAgent retrieves an agent configuration from the registry
func (r *AgentRegistry) GetAgent(agentID string) (map[string]interface{}, error) {
	// Get the document from the collection
	ctx := context.Background()
	doc, err := r.collection.GetByID(ctx, agentID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve agent: %v", err)
	}

	// Parse the JSON content
	var config map[string]interface{}
	if err := json.Unmarshal([]byte(doc.Content), &config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal agent config: %v", err)
	}

	return config, nil
}

// DeleteAgent removes an agent from the registry
func (r *AgentRegistry) DeleteAgent(agentID string) error {
	// Delete the document from the collection
	ctx := context.Background()
	err := r.collection.Delete(ctx, nil, nil, agentID)
	if err != nil {
		return fmt.Errorf("failed to delete agent: %v", err)
	}

	return nil
}

// ListAgents returns a list of all agent IDs
func (r *AgentRegistry) ListAgents() ([]string, error) {
	// Query all documents from the collection
	ctx := context.Background()
	// Use a query that will match all documents
	results, err := r.collection.Query(ctx, "", 1000, nil, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to list agents: %v", err)
	}

	// Extract IDs directly from results
	ids := make([]string, len(results))
	for i, result := range results {
		ids[i] = result.ID
	}

	return ids, nil
}

// Close is a no-op since chromem.DB doesn't have a Close method
// This method is provided for interface compatibility
func (r *AgentRegistry) Close() error {
	// The chromem.DB doesn't have a Close method in the current version
	// This is a no-op for now
	return nil
}
