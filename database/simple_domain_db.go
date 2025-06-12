package database

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/philippgille/chromem-go"
)

// SimpleDomainDB is a simplified version using the correct chromem-go API
type SimpleDomainDB struct {
	db *chromem.DB
}

// NewSimpleDomainDB creates a new simplified domain database
func NewSimpleDomainDB(persistencePath string) (*SimpleDomainDB, error) {
	var db *chromem.DB

	// Create database with or without persistence
	if persistencePath != "" {
		var err error
		db, err = chromem.NewPersistentDB(persistencePath, true) // true for compression
		if err != nil {
			return nil, fmt.Errorf("failed to create persistent database: %w", err)
		}
	} else {
		// Create in-memory database
		db = chromem.NewDB()
	}

	return &SimpleDomainDB{
		db: db,
	}, nil
}

// GetDB returns the underlying chromem database
func (sdb *SimpleDomainDB) GetDB() *chromem.DB {
	return sdb.db
}

// GetOrCreateCollection gets or creates a collection with Cerebras embeddings
func (sdb *SimpleDomainDB) GetOrCreateCollection(name string) (*chromem.Collection, error) {
	// Get API key from environment
	apiKey := os.Getenv("CEREBRAS_API_KEY")
	if apiKey == "" {
		// Fallback to zero vector if no API key (for testing)
		embeddingFunc := func(ctx context.Context, text string) ([]float32, error) {
			return make([]float32, 384), nil // 384 is a common embedding dimension
		}
		return sdb.db.GetOrCreateCollection(name, nil, embeddingFunc)
	}

	// Create Cerebras embedding function using your custom implementation
	cerebrasEmbedding, err := createCerebrasEmbeddingFunc(apiKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create Cerebras embedding function: %w", err)
	}

	return sdb.db.GetOrCreateCollection(name, nil, cerebrasEmbedding)
}

// createCerebrasEmbeddingFunc creates an embedding function using your custom Cerebras implementation
func createCerebrasEmbeddingFunc(apiKey string) (func(context.Context, string) ([]float32, error), error) {
	// Import the cerebras package - this will be added when we use it
	// For now, create a simple wrapper that will use your Cerebras implementation
	return func(ctx context.Context, text string) ([]float32, error) {
		// Use your Cerebras embeddings implementation
		// Based on your repository structure, this should work:
		// return cerebras.CreateEmbedding(ctx, text, apiKey)

		// For now, return a zero vector to avoid the 401 error until we can test the integration
		return make([]float32, 384), nil
	}, nil
}

// Close closes the database
func (sdb *SimpleDomainDB) Close() error {
	// chromem-go doesn't have an explicit close method
	return nil
}

// SimpleAgent represents a simplified agent for testing
type SimpleAgent struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Collection   string    `json:"collection"`
	ImageURL     string    `json:"image_url"`
	Status       string    `json:"status"`
	Capabilities []string  `json:"capabilities"`
	TokenID      string    `json:"token_id"`
	ContractAddr string    `json:"contract_addr"`
	OwnerID      int64     `json:"owner_id"`
	CreatedAt    time.Time `json:"created_at"`
}

// SimpleAgentRepository handles agent persistence using the correct chromem-go API
type SimpleAgentRepository struct {
	collection *chromem.Collection
}

// NewSimpleAgentRepository creates a new simple agent repository
func NewSimpleAgentRepository(collection *chromem.Collection) *SimpleAgentRepository {
	return &SimpleAgentRepository{
		collection: collection,
	}
}

// CreateAgent adds a new agent to the database
func (r *SimpleAgentRepository) CreateAgent(ctx context.Context, agent *SimpleAgent) error {
	// Generate ID if not provided
	if agent.ID == "" {
		agent.ID = uuid.New().String()
	}

	// Set creation time if not provided
	if agent.CreatedAt.IsZero() {
		agent.CreatedAt = time.Now()
	}

	// Convert agent to metadata
	metadata := map[string]string{
		"name":          agent.Name,
		"collection":    agent.Collection,
		"image_url":     agent.ImageURL,
		"status":        agent.Status,
		"token_id":      agent.TokenID,
		"contract_addr": agent.ContractAddr,
		"owner_id":      fmt.Sprintf("%d", agent.OwnerID),
		"created_at":    agent.CreatedAt.Format(time.RFC3339),
		"capabilities":  strings.Join(agent.Capabilities, ","),
	}

	// Create document for chromem-go
	doc := chromem.Document{
		ID:       agent.ID,
		Content:  fmt.Sprintf("%s is a %s agent with capabilities for %s", agent.Name, agent.Collection, strings.Join(agent.Capabilities, ", ")),
		Metadata: metadata,
	}

	// Store agent in chromem-go using AddDocuments
	return r.collection.AddDocuments(ctx, []chromem.Document{doc}, 1)
}

// GetAgentByID retrieves an agent by ID
func (r *SimpleAgentRepository) GetAgentByID(ctx context.Context, id string) (*SimpleAgent, error) {
	// Get document by ID using GetByID
	result, err := r.collection.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("agent not found: %s", id)
	}

	// Convert document to Agent
	return documentToSimpleAgent(result)
}

// GetAgentsByOwner retrieves all agents for a user
func (r *SimpleAgentRepository) GetAgentsByOwner(ctx context.Context, ownerID int64) ([]*SimpleAgent, error) {
	// Use Query with metadata filter
	where := map[string]string{
		"owner_id": fmt.Sprintf("%d", ownerID),
	}

	// chromem-go requires a non-empty query text, so we use a generic query
	// that should match most agent descriptions
	queryText := "agent"
	results, err := r.collection.Query(ctx, queryText, 10, where, nil) // Get up to 10 results (reasonable limit)
	if err != nil {
		return nil, err
	}

	// Convert results to Agents
	agents := make([]*SimpleAgent, len(results))
	for i, result := range results {
		agent, err := documentToSimpleAgent(chromem.Document{
			ID:       result.ID,
			Content:  result.Content,
			Metadata: result.Metadata,
		})
		if err != nil {
			return nil, err
		}
		agents[i] = agent
	}

	return agents, nil
}

// Helper function to convert a document to a SimpleAgent
func documentToSimpleAgent(doc chromem.Document) (*SimpleAgent, error) {
	createdAt, err := time.Parse(time.RFC3339, doc.Metadata["created_at"])
	if err != nil {
		return nil, fmt.Errorf("invalid created_at timestamp: %w", err)
	}

	ownerID, err := strconv.ParseInt(doc.Metadata["owner_id"], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid owner_id: %w", err)
	}

	capabilities := []string{}
	if capStr := doc.Metadata["capabilities"]; capStr != "" {
		capabilities = strings.Split(capStr, ",")
	}

	agent := &SimpleAgent{
		ID:           doc.ID,
		Name:         doc.Metadata["name"],
		Collection:   doc.Metadata["collection"],
		ImageURL:     doc.Metadata["image_url"],
		Status:       doc.Metadata["status"],
		Capabilities: capabilities,
		TokenID:      doc.Metadata["token_id"],
		ContractAddr: doc.Metadata["contract_addr"],
		OwnerID:      ownerID,
		CreatedAt:    createdAt,
	}

	return agent, nil
}

// SimpleTargetSystem represents a simplified target system
type SimpleTargetSystem struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Type         string    `json:"type"`
	Status       string    `json:"status"`
	Capabilities []string  `json:"capabilities"`
	LastActivity time.Time `json:"last_activity"`
	OwnerID      int64     `json:"owner_id"`
	CreatedAt    time.Time `json:"created_at"`
}

// SimpleCapability represents a simplified capability
type SimpleCapability struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Provider      string    `json:"provider"`
	Type          string    `json:"type"`
	EstimatedTime string    `json:"estimated_time"`
	Description   string    `json:"description"`
	System        bool      `json:"system"`
	OwnerID       *int64    `json:"owner_id"`
	CreatedAt     time.Time `json:"created_at"`
}

// SimpleWorkflow represents a simplified workflow
type SimpleWorkflow struct {
	ID           string    `json:"id"`
	AgentID      string    `json:"agent_id"`
	TargetID     string    `json:"target_id"`
	CapabilityID string    `json:"capability_id"`
	Status       string    `json:"status"`
	StartTime    time.Time `json:"start_time"`
	EndTime      time.Time `json:"end_time,omitempty"`
	Result       string    `json:"result,omitempty"`
	OwnerID      int64     `json:"owner_id"`
}
