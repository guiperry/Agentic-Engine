package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"Inference_Engine/database"

	"github.com/gorilla/mux"
)

// SimpleAPIServer provides a simplified REST API for the inference engine
type SimpleAPIServer struct {
	db        *database.SimpleDomainDB
	agentRepo *database.SimpleAgentRepository
	router    *mux.Router
	server    *http.Server
}

// NewSimpleAPIServer creates a new simple API server
func NewSimpleAPIServer(port int, persistencePath string) (*SimpleAPIServer, error) {
	// Initialize database
	db, err := database.NewSimpleDomainDB(persistencePath)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	// Get or create agents collection
	agentCollection, err := db.GetOrCreateCollection("agents")
	if err != nil {
		return nil, fmt.Errorf("failed to create agents collection: %w", err)
	}

	// Initialize repositories
	agentRepo := database.NewSimpleAgentRepository(agentCollection)

	// Create router
	router := mux.NewRouter()

	// Create server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	apiServer := &SimpleAPIServer{
		db:        db,
		agentRepo: agentRepo,
		router:    router,
		server:    server,
	}

	// Setup routes
	apiServer.setupRoutes()

	return apiServer, nil
}

// setupRoutes configures the API routes
func (s *SimpleAPIServer) setupRoutes() {
	// API prefix
	api := s.router.PathPrefix("/api/v1").Subrouter()

	// CORS middleware
	s.router.Use(s.corsMiddleware)

	// Health check
	api.HandleFunc("/health", s.healthHandler).Methods("GET")

	// Agent routes
	api.HandleFunc("/agents", s.createAgentHandler).Methods("POST")
	api.HandleFunc("/agents", s.getAgentsHandler).Methods("GET")
	api.HandleFunc("/agents/{id}", s.getAgentHandler).Methods("GET")

	// Settings routes
	api.HandleFunc("/settings/api-keys", s.handleAPIKeys).Methods("POST")
	api.HandleFunc("/inference/models", s.handleInferenceModels).Methods("GET")
	api.HandleFunc("/inference/moa/{type}", s.handleMOASettings).Methods("POST")

	// Static file serving for UI
	s.router.PathPrefix("/").Handler(http.FileServer(http.Dir("./static/")))
}

// corsMiddleware adds CORS headers
func (s *SimpleAPIServer) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Start starts the API server
func (s *SimpleAPIServer) Start() error {
	log.Printf("Starting Simple API server on %s", s.server.Addr)
	return s.server.ListenAndServe()
}

// Stop stops the API server
func (s *SimpleAPIServer) Stop(ctx context.Context) error {
	log.Println("Stopping Simple API server...")
	return s.server.Shutdown(ctx)
}

// Health check handler
func (s *SimpleAPIServer) healthHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().UTC(),
		"version":   "1.0.0",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Create agent handler
func (s *SimpleAPIServer) createAgentHandler(w http.ResponseWriter, r *http.Request) {
	var agent database.SimpleAgent
	if err := json.NewDecoder(r.Body).Decode(&agent); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Set default values
	if agent.Status == "" {
		agent.Status = "active"
	}
	if agent.Collection == "" {
		agent.Collection = "default"
	}

	// Create agent
	ctx := context.Background()
	if err := s.agentRepo.CreateAgent(ctx, &agent); err != nil {
		log.Printf("Error creating agent: %v", err)
		http.Error(w, "Failed to create agent", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(agent)
}

// Get agents handler
func (s *SimpleAPIServer) getAgentsHandler(w http.ResponseWriter, r *http.Request) {
	// Get owner ID from query parameter
	ownerIDStr := r.URL.Query().Get("owner_id")
	if ownerIDStr == "" {
		http.Error(w, "owner_id parameter is required", http.StatusBadRequest)
		return
	}

	ownerID, err := strconv.ParseInt(ownerIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid owner_id", http.StatusBadRequest)
		return
	}

	// Get agents
	ctx := context.Background()
	agents, err := s.agentRepo.GetAgentsByOwner(ctx, ownerID)
	if err != nil {
		log.Printf("Error getting agents: %v", err)
		http.Error(w, "Failed to get agents", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(agents)
}

// Get agent handler
func (s *SimpleAPIServer) getAgentHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	ctx := context.Background()
	agent, err := s.agentRepo.GetAgentByID(ctx, id)
	if err != nil {
		log.Printf("Error getting agent: %v", err)
		http.Error(w, "Agent not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(agent)
}

// CreateSampleData creates some sample data for testing
func (s *SimpleAPIServer) CreateSampleData() error {
	ctx := context.Background()

	// Sample agents
	sampleAgents := []*database.SimpleAgent{
		{
			Name:         "Alpha Agent",
			Collection:   "Genesis",
			ImageURL:     "https://example.com/alpha.png",
			Status:       "active",
			Capabilities: []string{"web_scraping", "data_analysis"},
			TokenID:      "1",
			ContractAddr: "0x123...",
			OwnerID:      1,
		},
		{
			Name:         "Beta Agent",
			Collection:   "Genesis",
			ImageURL:     "https://example.com/beta.png",
			Status:       "active",
			Capabilities: []string{"api_integration", "automation"},
			TokenID:      "2",
			ContractAddr: "0x123...",
			OwnerID:      1,
		},
		{
			Name:         "Gamma Agent",
			Collection:   "Advanced",
			ImageURL:     "https://example.com/gamma.png",
			Status:       "active",
			Capabilities: []string{"machine_learning", "prediction"},
			TokenID:      "3",
			ContractAddr: "0x456...",
			OwnerID:      2,
		},
	}

	// Create sample agents
	for _, agent := range sampleAgents {
		if err := s.agentRepo.CreateAgent(ctx, agent); err != nil {
			return fmt.Errorf("failed to create sample agent %s: %w", agent.Name, err)
		}
		log.Printf("Created sample agent: %s", agent.Name)
	}

	return nil
}

// API Key settings handler
func (s *SimpleAPIServer) handleAPIKeys(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Provider string `json:"provider"`
		APIKey   string `json:"apiKey"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// In a real implementation, you would:
	// 1. Validate the API key
	// 2. Store it securely (encrypted)
	// 3. Update environment variables or config

	// For now, we'll just acknowledge the save
	log.Printf("API Key saved for provider: %s", request.Provider)

	response := map[string]interface{}{
		"status":   "success",
		"message":  "API key saved successfully",
		"provider": request.Provider,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Inference models handler
func (s *SimpleAPIServer) handleInferenceModels(w http.ResponseWriter, r *http.Request) {
	// In a real implementation, you would query your inference service
	// For now, return static model lists
	models := map[string][]string{
		"primary": {
			"llama-4-scout-17b-16e-instruct",
			"gpt-4",
			"claude-3-sonnet",
		},
		"fallback": {
			"gemini-1.5-flash-latest",
			"deepseek-chat",
			"gemini-1.5-pro-latest",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models)
}

// MOA settings handler
func (s *SimpleAPIServer) handleMOASettings(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	modelType := vars["type"] // "primary" or "fallback"

	var request struct {
		Model string `json:"model"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// In a real implementation, you would:
	// 1. Validate the model exists
	// 2. Update your inference service configuration
	// 3. Restart or reload the inference service

	log.Printf("MOA %s model set to: %s", modelType, request.Model)

	response := map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("MOA %s model updated successfully", modelType),
		"type":    modelType,
		"model":   request.Model,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
