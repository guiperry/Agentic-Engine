# Implementation Plan: Refactoring Golang Backend to Match JavaScript Frontend

## Overview

This document outlines the implementation plan for refactoring the existing Golang inference backend to match the new JavaScript GUI frontend features. The goal is to create a cohesive system where the backend services support all the functionality displayed in the frontend demo, while completely removing legacy WordPress dependencies and implementing proper persistence with SQLite databases.

## Current Architecture Analysis

### Frontend (JavaScript/React)
- **UI Framework**: React with TypeScript
- **Styling**: TailwindCSS
- **Key Components**:
  - Dashboard: Overview of agent activities and system status
  - AgentManager: Management of NFT-Agents
  - CapabilityStore: Repository of agent capabilities
  - TargetManager: Management of target systems
  - InferenceOrchestrator: Orchestration of inference workflows
  - Analytics: Visualization of inference data
  - Settings: System configuration

### Backend (Golang)
- **Core Services**:
  - InferenceService: Manages LLM interactions
  - DelegatorService: Handles request delegation between LLMs
  - ContextManager: Manages chunking and processing of large inputs
  - ConversationMemory: Stores conversation history
  - WordPressService: Connects to WordPress (legacy)

## Gap Analysis

1. **Agent Management**:
   - Frontend shows NFT-Agent management
   - Backend has no concept of agents, only LLM providers

2. **Target Systems**:
   - Frontend displays target system management
   - Backend only has WordPress integration

3. **Capabilities**:
   - Frontend shows capability management
   - Backend has inference capabilities but not as modular components

4. **Orchestration**:
   - Frontend shows workflow orchestration
   - Backend has basic delegation but no complex workflow support

5. **Analytics**:
   - Frontend shows analytics dashboards
   - Backend has minimal logging but no analytics

6. **Persistence**:
   - Frontend assumes persistent storage of entities
   - Backend uses in-memory storage with WordPress as the only external system

7. **Authentication**:
   - Frontend has user management UI
   - Backend lacks proper authentication system

## Implementation Plan

### Phase 0: WordPress Deprecation and Removal

#### 0.1 Identify WordPress Dependencies
- Audit codebase for all WordPress service references
- Document all WordPress-dependent functionality
- Create migration plan for each WordPress-dependent feature

#### 0.2 Create Deprecation Interfaces
- Implement adapter interfaces for WordPress functionality
- Add deprecation warnings to WordPress-related code
- Create stubs for replacement functionality

```go
// DeprecatedWordPressService wraps the legacy WordPress service with warnings
type DeprecatedWordPressService struct {
    inner *wordpress.WordPressService
}

func (d *DeprecatedWordPressService) Connect(url, username, password string) error {
    log.Println("WARNING: Using deprecated WordPress service. This functionality will be removed in a future version.")
    return d.inner.Connect(url, username, password)
}

// Additional methods with deprecation warnings...
```

#### 0.3 Remove WordPress Dependencies
- Remove WordPress service imports from main.go
- Delete WordPress-related UI components
- Remove WordPress service package entirely
- Update documentation to reflect removal

### Phase 1: Database Implementation

#### 1.1 Set Up Authentication Database with SQLite
- Implement SQLite database for user authentication
- Create schema for users, roles, and permissions
- Implement repository layer for auth entities
- Add migration tools for schema updates

```go
// AuthDB manages the authentication database
type AuthDB struct {
    db *sql.DB
}

// NewAuthDB creates a new authentication database connection
func NewAuthDB(dbPath string) (*AuthDB, error) {
    db, err := sql.Open("sqlite3", dbPath)
    if err != nil {
        return nil, fmt.Errorf("failed to open auth database: %w", err)
    }
    
    // Initialize schema if needed
    if err := initAuthSchema(db); err != nil {
        db.Close()
        return nil, err
    }
    
    return &AuthDB{db: db}, nil
}

// User represents an authenticated user
type User struct {
    ID        int64     `json:"id"`
    Username  string    `json:"username"`
    Email     string    `json:"email"`
    Role      string    `json:"role"`
    CreatedAt time.Time `json:"created_at"`
    // Password hash and other auth fields omitted
}

// UserRepository handles user persistence
type UserRepository struct {
    db *sql.DB
}

// CreateUser adds a new user to the database
func (r *UserRepository) CreateUser(user *User, password string) error {
    // Hash password, store user
    // ...
}
```

#### 1.2 Set Up Domain Database with chromem-go
- Implement chromem-go for domain entities persistence
- Create collections for agents, targets, capabilities, and workflows
- Implement repository layer for domain entities
- Add data migration and synchronization tools

```go
// DomainDB manages the domain entity database using chromem-go
type DomainDB struct {
    db          *chromem.DB
    collections map[string]*chromem.Collection
}

// NewDomainDB creates a new chromem-go database for domain entities
func NewDomainDB(persistencePath string) (*DomainDB, error) {
    // Configure chromem-go with optional persistence
    opts := &chromem.DBOpts{
        PersistencePath: persistencePath,
    }
    
    // Create new database
    db := chromem.NewDBWithOpts(opts)
    
    domainDB := &DomainDB{
        db:          db,
        collections: make(map[string]*chromem.Collection),
    }
    
    // Initialize collections if needed
    if err := domainDB.initCollections(); err != nil {
        return nil, err
    }
    
    return domainDB, nil
}

// initCollections ensures all required collections exist
func (db *DomainDB) initCollections() error {
    // Define collection names and their metadata
    collections := map[string]map[string]string{
        "agents": {
            "description": "Collection for agent entities",
        },
        "targets": {
            "description": "Collection for target system entities",
        },
        "capabilities": {
            "description": "Collection for capability entities",
        },
        "workflows": {
            "description": "Collection for workflow entities",
        },
    }
    
    // Create or get collections
    for name, metadata := range collections {
        collection, err := db.db.GetOrCreateCollection(name, metadata, nil)
        if err != nil {
            return fmt.Errorf("failed to create collection %s: %w", name, err)
        }
        
        db.collections[name] = collection
    }
    
    return nil
}

// AgentRepository handles agent persistence in chromem-go
type AgentRepository struct {
    collection *chromem.Collection
}

// CreateAgent adds a new agent to the database
func (r *AgentRepository) CreateAgent(ctx context.Context, agent *Agent) error {
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
    }
    
    // Create document for chromem-go
    doc := chromem.Document{
        ID:       agent.ID,
        Content:  fmt.Sprintf("%s is a %s agent with capabilities for %s", agent.Name, agent.Collection, strings.Join(agent.Capabilities, ", ")),
        Metadata: metadata,
    }
    
    // Store agent in chromem-go
    return r.collection.AddDocuments(ctx, []chromem.Document{doc}, runtime.NumCPU())
}

// GetAgentByID retrieves an agent by ID
func (r *AgentRepository) GetAgentByID(ctx context.Context, id string) (*Agent, error) {
    // Get document by ID
    docs, err := r.collection.Get(ctx, []string{id})
    if err != nil {
        return nil, err
    }
    
    if len(docs) == 0 {
        return nil, fmt.Errorf("agent not found: %s", id)
    }
    
    // Convert document to Agent
    doc := docs[0]
    createdAt, _ := time.Parse(time.RFC3339, doc.Metadata["created_at"])
    ownerID, _ := strconv.ParseInt(doc.Metadata["owner_id"], 10, 64)
    
    agent := &Agent{
        ID:           doc.ID,
        Name:         doc.Metadata["name"],
        Collection:   doc.Metadata["collection"],
        ImageURL:     doc.Metadata["image_url"],
        Status:       doc.Metadata["status"],
        TokenID:      doc.Metadata["token_id"],
        ContractAddr: doc.Metadata["contract_addr"],
        OwnerID:      ownerID,
        CreatedAt:    createdAt,
    }
    
    return agent, nil
}

// FindSimilarAgents finds agents similar to the given query
func (r *AgentRepository) FindSimilarAgents(ctx context.Context, query string, limit int) ([]*Agent, error) {
    // Query chromem-go for similar agents
    results, err := r.collection.Query(ctx, query, limit, nil, nil)
    if err != nil {
        return nil, err
    }
    
    // Convert results to Agents
    agents := make([]*Agent, len(results))
    for i, result := range results {
        createdAt, _ := time.Parse(time.RFC3339, result.Metadata["created_at"])
        ownerID, _ := strconv.ParseInt(result.Metadata["owner_id"], 10, 64)
        
        agents[i] = &Agent{
            ID:           result.ID,
            Name:         result.Metadata["name"],
            Collection:   result.Metadata["collection"],
            ImageURL:     result.Metadata["image_url"],
            Status:       result.Metadata["status"],
            TokenID:      result.Metadata["token_id"],
            ContractAddr: result.Metadata["contract_addr"],
            OwnerID:      ownerID,
            CreatedAt:    createdAt,
        }
    }
    
    return agents, nil
}

// Additional repositories for other domain entities...
```

#### 1.3 Implement Database Management
- Create migration framework for SQLite schema evolution
- Implement initial schema creation scripts for authentication database
- Add version tracking for database schemas
- Develop chromem-go collection management and backup functionality

```go
// SQLite Migration represents a database schema change
type Migration struct {
    Version     int
    Description string
    UpSQL       string
    DownSQL     string
}

// SQLiteMigrator handles database schema migrations
type SQLiteMigrator struct {
    db         *sql.DB
    migrations []Migration
}

// MigrateUp applies all pending migrations
func (m *SQLiteMigrator) MigrateUp() error {
    // Apply migrations in order
    // ...
}

// ChromemManager handles chromem-go database management
type ChromemManager struct {
    db *chromem.DB
}

// SyncCollections ensures all collections exist with proper settings
func (m *ChromemManager) SyncCollections(collections map[string]map[string]string) error {
    for name, metadata := range collections {
        _, err := m.db.GetOrCreateCollection(name, metadata, nil)
        if err != nil {
            return fmt.Errorf("failed to sync collection %s: %w", name, err)
        }
    }
    
    return nil
}

// BackupDatabase creates a backup of the entire database
func (m *ChromemManager) BackupDatabase(ctx context.Context, backupPath string) error {
    // Open file for writing
    file, err := os.Create(backupPath)
    if err != nil {
        return fmt.Errorf("failed to create backup file: %w", err)
    }
    defer file.Close()
    
    // Export database to file
    return m.db.Export(ctx, file, &chromem.ExportOpts{
        Compress: true,  // Use gzip compression
        Encrypt:  false, // No encryption for simplicity
    })
}

// RestoreDatabase restores the database from a backup
func (m *ChromemManager) RestoreDatabase(ctx context.Context, backupPath string) error {
    // Open file for reading
    file, err := os.Open(backupPath)
    if err != nil {
        return fmt.Errorf("failed to open backup file: %w", err)
    }
    defer file.Close()
    
    // Import database from file
    return m.db.Import(ctx, file, &chromem.ImportOpts{
        Compressed: true,  // File is gzip compressed
        Encrypted:  false, // File is not encrypted
    })
}
```

### Phase 2: Core Backend API Refactoring

#### 2.1 Create RESTful API Layer
- Implement a new HTTP server in Golang using standard library or Gin
- Define API endpoints that match frontend requirements
- Implement CORS support for local development
- Add JWT authentication middleware

```go
// Example API structure with authentication
func setupRouter(authService *AuthService) *gin.Engine {
    router := gin.Default()
    
    // CORS middleware
    router.Use(cors.Default())
    
    // Public routes
    public := router.Group("/api/v1")
    {
        public.POST("/auth/login", authService.Login)
        public.POST("/auth/register", authService.Register)
    }
    
    // Protected routes
    protected := router.Group("/api/v1")
    protected.Use(authMiddleware(authService))
    {
        // Agent endpoints
        protected.GET("/agents", getAgents)
        protected.POST("/agents", createAgent)
        protected.GET("/agents/:id", getAgent)
        protected.PUT("/agents/:id", updateAgent)
        protected.DELETE("/agents/:id", deleteAgent)
        
        // Target endpoints
        protected.GET("/targets", getTargets)
        protected.POST("/targets", createTarget)
        // ...
        
        // Capability endpoints
        protected.GET("/capabilities", getCapabilities)
        // ...
        
        // Orchestration endpoints
        protected.POST("/orchestrate", orchestrateWorkflow)
        protected.GET("/orchestration/:id", getOrchestrationStatus)
        // ...
        
        // Analytics endpoints
        protected.GET("/analytics/summary", getAnalyticsSummary)
        // ...
    }
    
    return router
}

// JWT authentication middleware
func authMiddleware(authService *AuthService) gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
            return
        }
        
        // Validate token
        userID, err := authService.ValidateToken(strings.TrimPrefix(token, "Bearer "))
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            return
        }
        
        // Set user ID in context
        c.Set("userID", userID)
        c.Next()
    }
}
```

#### 2.2 Refactor InferenceService
- Modify to support agent-based architecture
- Add support for agent metadata and NFT properties
- Implement agent state management
- Connect to domain database for persistence

```go
// Agent represents an NFT-Agent
type Agent struct {
    ID           string    `json:"id" db:"id"`
    Name         string    `json:"name" db:"name"`
    Collection   string    `json:"collection" db:"collection"`
    ImageURL     string    `json:"image_url" db:"image_url"`
    Status       string    `json:"status" db:"status"`
    Capabilities []string  `json:"capabilities" db:"-"` // Handled separately in DB
    CreatedAt    time.Time `json:"created_at" db:"created_at"`
    // NFT-specific properties
    TokenID      string    `json:"token_id" db:"token_id"`
    ContractAddr string    `json:"contract_addr" db:"contract_addr"`
    // Owner information
    OwnerID      int64     `json:"owner_id" db:"owner_id"`
}

// AgentService manages NFT-Agents
type AgentService struct {
    repository   *AgentRepository
    capService   *CapabilityService
    inferService *InferenceService
    mutex        sync.RWMutex
}

// NewAgentService creates a new agent service with database persistence
func NewAgentService(repo *AgentRepository, capService *CapabilityService, inferService *InferenceService) *AgentService {
    return &AgentService{
        repository:   repo,
        capService:   capService,
        inferService: inferService,
    }
}

// GetAgent retrieves an agent by ID
func (s *AgentService) GetAgent(id string) (*Agent, error) {
    return s.repository.GetAgentByID(id)
}

// ListAgents retrieves all agents for a user
func (s *AgentService) ListAgents(userID int64) ([]*Agent, error) {
    return s.repository.GetAgentsByOwner(userID)
}

// CreateAgent creates a new agent
func (s *AgentService) CreateAgent(agent *Agent) error {
    // Validate agent data
    if err := s.validateAgent(agent); err != nil {
        return err
    }
    
    // Generate ID if not provided
    if agent.ID == "" {
        agent.ID = uuid.New().String()
    }
    
    // Set creation timestamp
    agent.CreatedAt = time.Now()
    
    // Save to database
    return s.repository.CreateAgent(agent)
}
```

### Phase 3: Domain Model Implementation

#### 3.1 Implement Agent Domain
- Create agent data models with database mappings
- Implement agent repository for SQLite persistence
- Add agent service layer with business logic
- Implement agent capability assignment

#### 3.2 Implement Target System Domain
- Create target system data models with database mappings
- Implement target system repository for SQLite persistence
- Add target system service layer with business logic

```go
// TargetSystem represents a system that agents can interact with
type TargetSystem struct {
    ID           string    `json:"id" db:"id"`
    Name         string    `json:"name" db:"name"`
    Type         string    `json:"type" db:"type"` // browser, filesystem, application, etc.
    Status       string    `json:"status" db:"status"`
    Capabilities []string  `json:"capabilities" db:"-"` // Handled separately in DB
    LastActivity time.Time `json:"last_activity" db:"last_activity"`
    // Owner information
    OwnerID      int64     `json:"owner_id" db:"owner_id"`
}

// TargetRepository handles target system persistence
type TargetRepository struct {
    db *sql.DB
}

// TargetService manages target systems
type TargetService struct {
    repository *TargetRepository
    mutex      sync.RWMutex
}

// GetTarget retrieves a target by ID
func (s *TargetService) GetTarget(id string) (*TargetSystem, error) {
    return s.repository.GetTargetByID(id)
}

// ListTargets retrieves all targets for a user
func (s *TargetService) ListTargets(userID int64) ([]*TargetSystem, error) {
    return s.repository.GetTargetsByOwner(userID)
}
```

#### 3.3 Implement Capability Domain
- Create capability data models with database mappings
- Implement capability repository for SQLite persistence
- Add capability service layer with business logic

```go
// Capability represents a function that agents can perform
type Capability struct {
    ID            string    `json:"id" db:"id"`
    Name          string    `json:"name" db:"name"`
    Provider      string    `json:"provider" db:"provider"`
    Type          string    `json:"type" db:"type"`
    EstimatedTime string    `json:"estimated_time" db:"estimated_time"`
    Description   string    `json:"description" db:"description"`
    // System capability or user-defined
    System        bool      `json:"system" db:"system"`
    // Owner information (null for system capabilities)
    OwnerID       *int64    `json:"owner_id" db:"owner_id"`
}

// CapabilityRepository handles capability persistence
type CapabilityRepository struct {
    db *sql.DB
}

// CapabilityService manages capabilities
type CapabilityService struct {
    repository *CapabilityRepository
    mutex      sync.RWMutex
}

// GetCapability retrieves a capability by ID
func (s *CapabilityService) GetCapability(id string) (*Capability, error) {
    return s.repository.GetCapabilityByID(id)
}

// ListCapabilities retrieves all capabilities available to a user
func (s *CapabilityService) ListCapabilities(userID int64) ([]*Capability, error) {
    return s.repository.GetCapabilitiesForUser(userID)
}

// CreateCapability creates a new user-defined capability
func (s *CapabilityService) CreateCapability(capability *Capability) error {
    // Validate capability data
    if err := s.validateCapability(capability); err != nil {
        return err
    }
    
    // Generate ID if not provided
    if capability.ID == "" {
        capability.ID = uuid.New().String()
    }
    
    // Save to database
    return s.repository.CreateCapability(capability)
}
```

### Phase 4: Orchestration Engine

#### 4.1 Implement Workflow Engine
- Create workflow data models with database mappings
- Implement workflow repository for SQLite persistence
- Implement workflow execution engine
- Add support for sequential and parallel execution

```go
// Workflow represents an orchestration workflow
type Workflow struct {
    ID           string    `json:"id" db:"id"`
    AgentID      string    `json:"agent_id" db:"agent_id"`
    TargetID     string    `json:"target_id" db:"target_id"`
    CapabilityID string    `json:"capability_id" db:"capability_id"`
    Status       string    `json:"status" db:"status"`
    StartTime    time.Time `json:"start_time" db:"start_time"`
    EndTime      time.Time `json:"end_time,omitempty" db:"end_time"`
    Result       string    `json:"result,omitempty" db:"result"`
    // Owner information
    OwnerID      int64     `json:"owner_id" db:"owner_id"`
}

// WorkflowRepository handles workflow persistence
type WorkflowRepository struct {
    db *sql.DB
}

// WorkflowEngine orchestrates workflows
type WorkflowEngine struct {
    repository        *WorkflowRepository
    agentService      *AgentService
    targetService     *TargetService
    capabilityService *CapabilityService
    inferenceService  *InferenceService
    mutex             sync.RWMutex
}

// ExecuteWorkflow runs a workflow with the specified components
func (e *WorkflowEngine) ExecuteWorkflow(workflow *Workflow) error {
    // Update workflow status
    workflow.Status = "running"
    workflow.StartTime = time.Now()
    
    if err := e.repository.UpdateWorkflow(workflow); err != nil {
        return fmt.Errorf("failed to update workflow status: %w", err)
    }
    
    // Execute in a goroutine to allow for async processing
    go func() {
        result, err := e.executeWorkflowInternal(workflow)
        
        // Update workflow with result
        if err != nil {
            workflow.Status = "failed"
            workflow.Result = err.Error()
        } else {
            workflow.Status = "completed"
            workflow.Result = result
        }
        
        workflow.EndTime = time.Now()
        if updateErr := e.repository.UpdateWorkflow(workflow); updateErr != nil {
            log.Printf("Failed to update workflow result: %v", updateErr)
        }
    }()
    
    return nil
}

// executeWorkflowInternal handles the actual execution logic
func (e *WorkflowEngine) executeWorkflowInternal(workflow *Workflow) (string, error) {
    // Get components
    agent, err := e.agentService.GetAgent(workflow.AgentID)
    if err != nil {
        return "", fmt.Errorf("failed to get agent: %w", err)
    }
    
    target, err := e.targetService.GetTarget(workflow.TargetID)
    if err != nil {
        return "", fmt.Errorf("failed to get target: %w", err)
    }
    
    capability, err := e.capabilityService.GetCapability(workflow.CapabilityID)
    if err != nil {
        return "", fmt.Errorf("failed to get capability: %w", err)
    }
    
    // Validate compatibility
    if !e.validateCompatibility(agent, target, capability) {
        return "", errors.New("incompatible agent, target, or capability")
    }
    
    // Execute capability using inference service
    return e.inferenceService.GenerateTextForAgent(
        workflow.AgentID,
        workflow.TargetID,
        workflow.CapabilityID,
        fmt.Sprintf("Execute %s on %s", capability.Name, target.Name),
    )
}
```

#### 4.2 Enhance DelegatorService
- Modify to support workflow-based delegation
- Add support for capability-specific execution
- Implement target system integration
- Store execution history in database

### Phase 5: Analytics and Monitoring

#### 5.1 Implement Analytics Service
- Create analytics data models with database mappings
- Implement analytics repository for SQLite persistence
- Implement data collection mechanisms
- Add aggregation and reporting functions

```go
// AnalyticsService collects and processes analytics data
type AnalyticsService struct {
    repository     *AnalyticsRepository
    workflowEngine *WorkflowEngine
    agentService   *AgentService
    mutex          sync.RWMutex
}

// AnalyticsSummary provides an overview of system activity
type AnalyticsSummary struct {
    ActiveAgents    int     `json:"active_agents"`
    TargetSystems   int     `json:"target_systems"`
    InferencesToday int     `json:"inferences_today"`
    SuccessRate     float64 `json:"success_rate"`
    // Additional metrics
    TotalWorkflows  int     `json:"total_workflows"`
    AvgDuration     float64 `json:"avg_duration_ms"`
    TopCapabilities []struct {
        Name  string `json:"name"`
        Count int    `json:"count"`
    } `json:"top_capabilities"`
}

// GetSummary returns a summary of system analytics
func (s *AnalyticsService) GetSummary(userID int64) (*AnalyticsSummary, error) {
    // Get active agents count
    agents, err := s.agentService.ListAgents(userID)
    if err != nil {
        return nil, fmt.Errorf("failed to get agents: %w", err)
    }
    
    activeAgents := 0
    for _, agent := range agents {
        if agent.Status == "active" || agent.Status == "deployed" {
            activeAgents++
        }
    }
    
    // Get workflow statistics
    workflowStats, err := s.repository.GetWorkflowStats(userID)
    if err != nil {
        return nil, fmt.Errorf("failed to get workflow stats: %w", err)
    }
    
    // Get top capabilities
    topCapabilities, err := s.repository.GetTopCapabilities(userID, 5)
    if err != nil {
        return nil, fmt.Errorf("failed to get top capabilities: %w", err)
    }
    
    return &AnalyticsSummary{
        ActiveAgents:    activeAgents,
        TargetSystems:   workflowStats.TargetCount,
        InferencesToday: workflowStats.TodayCount,
        SuccessRate:     workflowStats.SuccessRate,
        TotalWorkflows:  workflowStats.TotalCount,
        AvgDuration:     workflowStats.AvgDuration,
        TopCapabilities: topCapabilities,
    }, nil
}

// TrackWorkflowExecution records workflow execution metrics
func (s *AnalyticsService) TrackWorkflowExecution(workflow *Workflow, duration time.Duration) error {
    return s.repository.RecordWorkflowExecution(workflow, duration)
}
```

#### 5.2 Implement Monitoring System
- Create monitoring data models with database mappings
- Implement real-time monitoring with WebSocket support
- Add alerting mechanisms
- Implement system health checks

```go
// MonitoringService provides real-time system monitoring
type MonitoringService struct {
    repository *MonitoringRepository
    clients    map[string]*websocket.Conn
    mutex      sync.RWMutex
}

// SystemHealth represents the current health of the system
type SystemHealth struct {
    Status           string    `json:"status"` // "healthy", "degraded", "unhealthy"
    Components       []string  `json:"components"`
    LastChecked      time.Time `json:"last_checked"`
    ActiveWorkflows  int       `json:"active_workflows"`
    SystemLoad       float64   `json:"system_load"`
    MemoryUsage      float64   `json:"memory_usage"`
    DatabaseLatency  float64   `json:"database_latency_ms"`
    InferenceLatency float64   `json:"inference_latency_ms"`
}

// StartMonitoring begins periodic health checks
func (s *MonitoringService) StartMonitoring(interval time.Duration) {
    ticker := time.NewTicker(interval)
    go func() {
        for range ticker.C {
            health := s.CheckHealth()
            s.BroadcastUpdate(health)
            s.repository.RecordHealthCheck(health)
            
            // Check for alert conditions
            if health.Status == "unhealthy" {
                s.TriggerAlert(health)
            }
        }
    }()
}

// HandleWebSocket manages a client WebSocket connection
func (s *MonitoringService) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
    // Upgrade HTTP connection to WebSocket
    conn, err := websocket.Upgrade(w, r, nil, 1024, 1024)
    if err != nil {
        http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
        return
    }
    
    // Generate client ID
    clientID := uuid.New().String()
    
    // Store connection
    s.mutex.Lock()
    s.clients[clientID] = conn
    s.mutex.Unlock()
    
    // Send initial health data
    health := s.CheckHealth()
    conn.WriteJSON(health)
    
    // Handle disconnection
    go func() {
        for {
            // Read messages to detect disconnection
            if _, _, err := conn.ReadMessage(); err != nil {
                s.mutex.Lock()
                delete(s.clients, clientID)
                s.mutex.Unlock()
                conn.Close()
                break
            }
        }
    }()
}
```

### Phase 6: Authentication and Authorization

#### 6.1 Implement User Authentication
- Create user authentication service
- Implement JWT token generation and validation
- Add password hashing and verification
- Implement user registration and login endpoints

```go
// AuthService handles user authentication
type AuthService struct {
    repository *UserRepository
    jwtSecret  []byte
}

// NewAuthService creates a new authentication service
func NewAuthService(repo *UserRepository, jwtSecret string) *AuthService {
    return &AuthService{
        repository: repo,
        jwtSecret:  []byte(jwtSecret),
    }
}

// Login authenticates a user and returns a JWT token
func (s *AuthService) Login(c *gin.Context) {
    var credentials struct {
        Username string `json:"username" binding:"required"`
        Password string `json:"password" binding:"required"`
    }
    
    if err := c.ShouldBindJSON(&credentials); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }
    
    // Get user from database
    user, err := s.repository.GetUserByUsername(credentials.Username)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }
    
    // Verify password
    if !s.verifyPassword(user, credentials.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }
    
    // Generate JWT token
    token, err := s.generateToken(user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "token": token,
        "user": gin.H{
            "id":       user.ID,
            "username": user.Username,
            "email":    user.Email,
            "role":     user.Role,
        },
    })
}

// generateToken creates a new JWT token for a user
func (s *AuthService) generateToken(user *User) (string, error) {
    // Create token with claims
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "sub":  user.ID,
        "name": user.Username,
        "role": user.Role,
        "exp":  time.Now().Add(time.Hour * 24).Unix(),
    })
    
    // Sign and return token
    return token.SignedString(s.jwtSecret)
}
```

#### 6.2 Implement Authorization
- Create role-based access control system
- Implement permission checking middleware
- Add user role management
- Implement resource ownership validation

```go
// Permission represents an action that can be performed
type Permission string

const (
    PermissionReadAgent       Permission = "agent:read"
    PermissionCreateAgent     Permission = "agent:create"
    PermissionUpdateAgent     Permission = "agent:update"
    PermissionDeleteAgent     Permission = "agent:delete"
    PermissionExecuteWorkflow Permission = "workflow:execute"
    // Additional permissions...
)

// Role represents a set of permissions
type Role struct {
    Name        string       `json:"name" db:"name"`
    Permissions []Permission `json:"permissions" db:"-"` // Handled separately in DB
}

// RoleRepository handles role persistence
type RoleRepository struct {
    db *sql.DB
}

// AuthorizationService handles permission checking
type AuthorizationService struct {
    roleRepository *RoleRepository
}

// HasPermission checks if a user has a specific permission
func (s *AuthorizationService) HasPermission(userID int64, permission Permission) (bool, error) {
    // Get user's role
    role, err := s.roleRepository.GetRoleForUser(userID)
    if err != nil {
        return false, fmt.Errorf("failed to get user role: %w", err)
    }
    
    // Check if role has permission
    for _, p := range role.Permissions {
        if p == permission {
            return true, nil
        }
    }
    
    return false, nil
}

// RequirePermission creates middleware that checks for a specific permission
func (s *AuthorizationService) RequirePermission(permission Permission) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get user ID from context (set by auth middleware)
        userID, exists := c.Get("userID")
        if !exists {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }
        
        // Check permission
        hasPermission, err := s.HasPermission(userID.(int64), permission)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to check permission"})
            return
        }
        
        if !hasPermission {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
            return
        }
        
        c.Next()
    }
}
```

### Phase 7: Integration and Testing

#### 7.1 Frontend-Backend Integration
- Update frontend to use real API endpoints
- Implement authentication flow in frontend
- Add error handling and loading states
- Create WebSocket connections for real-time updates

#### 7.2 End-to-End Testing
- Create test suite for API endpoints
- Implement integration tests for workflows
- Add performance testing
- Implement database testing with test fixtures

```go
// TestAgentAPI tests the agent API endpoints
func TestAgentAPI(t *testing.T) {
    // Set up test environment
    router, cleanup := setupTestEnvironment()
    defer cleanup()
    
    // Create test client
    client := &http.Client{}
    
    // Login to get token
    token := loginTestUser(t, client, router)
    
    // Test creating an agent
    agent := &Agent{
        Name:       "Test Agent",
        Collection: "Test Collection",
        ImageURL:   "https://example.com/image.jpg",
        Status:     "idle",
    }
    
    // Serialize agent to JSON
    agentJSON, err := json.Marshal(agent)
    require.NoError(t, err)
    
    // Create request
    req, err := http.NewRequest("POST", "/api/v1/agents", bytes.NewBuffer(agentJSON))
    require.NoError(t, err)
    
    // Add authorization header
    req.Header.Set("Authorization", "Bearer "+token)
    req.Header.Set("Content-Type", "application/json")
    
    // Execute request
    resp := httptest.NewRecorder()
    router.ServeHTTP(resp, req)
    
    // Check response
    require.Equal(t, http.StatusCreated, resp.Code)
    
    // Parse response
    var createdAgent Agent
    err = json.Unmarshal(resp.Body.Bytes(), &createdAgent)
    require.NoError(t, err)
    
    // Verify agent was created with ID
    require.NotEmpty(t, createdAgent.ID)
    require.Equal(t, agent.Name, createdAgent.Name)
    
    // Test retrieving the agent
    req, err = http.NewRequest("GET", "/api/v1/agents/"+createdAgent.ID, nil)
    require.NoError(t, err)
    req.Header.Set("Authorization", "Bearer "+token)
    
    resp = httptest.NewRecorder()
    router.ServeHTTP(resp, req)
    
    require.Equal(t, http.StatusOK, resp.Code)
    
    // Additional tests...
}
```

#### 7.3 Documentation
- Update API documentation with OpenAPI/Swagger
- Create user guides
- Document system architecture
- Add developer documentation for extending the system

### Phase 8: Deployment and DevOps

#### 8.1 Containerization
- Create Docker containers for the application
- Implement Docker Compose for local development
- Add Kubernetes manifests for production deployment

#### 8.2 CI/CD Pipeline
- Set up GitHub Actions for continuous integration
- Implement automated testing
- Add deployment automation
- Implement database migration in CI/CD

#### 8.3 Monitoring and Logging
- Set up centralized logging
- Implement metrics collection
- Add alerting for production issues
- Create dashboards for system monitoring

## Implementation Details

### Agent Implementation

The Agent domain will be implemented as follows:

1. **Data Model**: Define Agent struct with all necessary fields and database mappings
2. **Repository**: Implement SQLite repository for agent persistence
3. **Service**: Implement business logic for agent management
4. **API**: Expose RESTful endpoints for agent operations with authentication

### Target System Implementation

The Target System domain will be implemented as follows:

1. **Data Model**: Define TargetSystem struct with all necessary fields and database mappings
2. **Repository**: Implement SQLite repository for target system persistence
3. **Service**: Implement business logic for target system management
4. **API**: Expose RESTful endpoints for target system operations with authentication

### Capability Implementation

The Capability domain will be implemented as follows:

1. **Data Model**: Define Capability struct with all necessary fields and database mappings
2. **Repository**: Implement SQLite repository for capability persistence
3. **Service**: Implement business logic for capability management
4. **API**: Expose RESTful endpoints for capability operations with authentication

### Workflow Orchestration Implementation

The Workflow Orchestration will be implemented as follows:

1. **Data Model**: Define Workflow struct with all necessary fields and database mappings
2. **Repository**: Implement SQLite repository for workflow persistence
3. **Engine**: Implement workflow execution engine with support for different capability types
4. **Service**: Implement business logic for workflow management
5. **API**: Expose RESTful endpoints for workflow operations with authentication

## Adapting Existing Code

### InferenceService Adaptation

The existing InferenceService will be adapted to support the new architecture:

```go
// Modify InferenceService to support agent-based architecture
func (s *InferenceService) GenerateTextForAgent(agentID string, targetID string, capabilityID string, promptText string) (string, error) {
    // Get agent, target, and capability
    agent, err := s.agentService.GetAgent(agentID)
    if err != nil {
        return "", fmt.Errorf("failed to get agent: %w", err)
    }
    
    target, err := s.targetService.GetTarget(targetID)
    if err != nil {
        return "", fmt.Errorf("failed to get target: %w", err)
    }
    
    capability, err := s.capabilityService.GetCapability(capabilityID)
    if err != nil {
        return "", fmt.Errorf("failed to get capability: %w", err)
    }
    
    // Validate compatibility
    if !s.validateCompatibility(agent, target, capability) {
        return "", errors.New("incompatible agent, target, or capability")
    }
    
    // Construct prompt based on capability
    enhancedPrompt := s.constructPromptForCapability(capability, promptText)
    
    // Track start time for analytics
    startTime := time.Now()
    
    // Use existing generation method
    result, err := s.GenerateText(capability.Provider, enhancedPrompt, "")
    
    // Record execution for analytics
    duration := time.Since(startTime)
    s.analyticsService.RecordInference(agent, target, capability, duration, err == nil)
    
    return result, err
}
```

### DelegatorService Adaptation

The DelegatorService will be adapted to support workflow orchestration:

```go
// Modify DelegatorService to support workflow orchestration
func (d *DelegatorService) ExecuteWorkflow(workflow *Workflow) error {
    // Get agent, target, and capability
    agent, err := d.agentService.GetAgent(workflow.AgentID)
    if err != nil {
        return fmt.Errorf("failed to get agent: %w", err)
    }
    
    target, err := d.targetService.GetTarget(workflow.TargetID)
    if err != nil {
        return fmt.Errorf("failed to get target: %w", err)
    }
    
    capability, err := d.capabilityService.GetCapability(workflow.CapabilityID)
    if err != nil {
        return fmt.Errorf("failed to get capability: %w", err)
    }
    
    // Update workflow status
    workflow.Status = "running"
    workflow.StartTime = time.Now()
    
    if err := d.workflowRepository.UpdateWorkflow(workflow); err != nil {
        return fmt.Errorf("failed to update workflow status: %w", err)
    }
    
    // Execute capability on target using agent
    result, err := d.executeCapability(agent, target, capability)
    
    // Update workflow status
    if err != nil {
        workflow.Status = "failed"
        workflow.Result = err.Error()
    } else {
        workflow.Status = "completed"
        workflow.Result = result
    }
    
    workflow.EndTime = time.Now()
    
    // Record execution in database
    if updateErr := d.workflowRepository.UpdateWorkflow(workflow); updateErr != nil {
        // Log error but don't fail the operation
        log.Printf("Failed to update workflow: %v", updateErr)
    }
    
    // Record analytics
    duration := workflow.EndTime.Sub(workflow.StartTime)
    d.analyticsService.TrackWorkflowExecution(workflow, duration)
    
    return err
}
```

## Database Schema

### Authentication Database

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    name TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL
);

-- Role permissions junction table
CREATE TABLE role_permissions (
    role_name TEXT NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_name, permission_id),
    FOREIGN KEY (role_name) REFERENCES roles(name) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- API tokens table
CREATE TABLE api_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    description TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Domain Database with chromem-go

chromem-go is an embeddable vector database for Go with a Chroma-like interface and zero third-party dependencies. It provides in-memory storage with optional persistence, making it ideal for our domain entities. Here's how the domain entities will be structured:

#### Collections Structure

1. **agents Collection**
   - Document ID: Agent UUID
   - Content: Textual description of the agent and its capabilities
   - Metadata:
     - name: Agent name
     - collection: NFT collection name
     - image_url: URL to agent image
     - status: Agent status (idle, active, etc.)
     - token_id: NFT token ID
     - contract_addr: NFT contract address
     - owner_id: Owner user ID
     - created_at: Creation timestamp

2. **targets Collection**
   - Document ID: Target UUID
   - Content: Textual description of the target system
   - Metadata:
     - name: Target system name
     - type: Target type (browser, filesystem, etc.)
     - status: Target status (connected, disconnected, etc.)
     - owner_id: Owner user ID
     - last_activity: Last activity timestamp
     - created_at: Creation timestamp

3. **capabilities Collection**
   - Document ID: Capability UUID
   - Content: Detailed description of the capability
   - Metadata:
     - name: Capability name
     - provider: Provider name (OpenAI, Anthropic, etc.)
     - type: Capability type (vision, nlp, etc.)
     - estimated_time: Estimated execution time
     - system: Whether it's a system capability
     - owner_id: Owner user ID (for user-defined capabilities)
     - created_at: Creation timestamp

4. **workflows Collection**
   - Document ID: Workflow UUID
   - Content: Description of the workflow and its results
   - Metadata:
     - agent_id: Agent UUID
     - target_id: Target UUID
     - capability_id: Capability UUID
     - status: Workflow status (running, completed, failed)
     - start_time: Start timestamp
     - end_time: End timestamp
     - result: Execution result summary
     - owner_id: Owner user ID
     - created_at: Creation timestamp

5. **analytics Collection**
   - Document ID: Analytics UUID
   - Content: Detailed description of the analytics event
   - Metadata:
     - workflow_id: Workflow UUID
     - agent_id: Agent UUID
     - target_id: Target UUID
     - capability_id: Capability UUID
     - duration_ms: Execution duration in milliseconds
     - success: Whether execution was successful
     - timestamp: Execution timestamp

#### Relationships

Relationships between entities will be maintained through reference IDs in metadata. For example, a workflow document will contain references to the agent, target, and capability IDs involved in the workflow.

#### Persistence and Backup

chromem-go provides optional persistence with the following features:
- In-memory storage for fast access
- Optional immediate persistence to disk
- Backup and restore functionality
- Export and import to/from a single file (with optional compression and encryption)

#### Similarity Search

chromem-go provides vector-based similarity search, which will be used for:
- Finding similar agents based on capabilities
- Discovering related workflows
- Identifying patterns in analytics data
- Recommending capabilities for specific targets

This approach leverages chromem-go's strengths in semantic search while maintaining the relational aspects needed for the application, all without requiring a separate database server.


## Timeline and Milestones

### Milestone 0: WordPress Removal (Week 1)
- Identify and document WordPress dependencies
- Create deprecation interfaces
- Remove WordPress service

### Milestone 1: Database Implementation (Week 2-3)
- Set up SQLite authentication database
- Set up ChromaDB for domain entities
- Implement repositories for both databases
- Create database migrations and collection management

### Milestone 2: Core API Layer (Week 4-5)
- Set up HTTP server
- Implement authentication
- Implement basic API endpoints
- Add CORS support

### Milestone 3: Domain Models (Week 6-7)
- Implement Agent domain
- Implement Target System domain
- Implement Capability domain

### Milestone 4: Orchestration Engine (Week 8-9)
- Implement Workflow Engine
- Enhance DelegatorService
- Add support for workflow execution

### Milestone 5: Analytics and Monitoring (Week 10-11)
- Implement Analytics Service
- Implement Monitoring System
- Add reporting functions
- Implement WebSocket for real-time updates

### Milestone 6: Integration and Testing (Week 12-13)
- Integrate frontend with backend
- Implement end-to-end testing
- Create documentation

### Milestone 7: Deployment and DevOps (Week 14)
- Set up containerization
- Implement CI/CD pipeline
- Configure monitoring and logging

## Conclusion

This implementation plan provides a comprehensive roadmap for refactoring the Golang backend to match the JavaScript frontend features. By following this plan, we will create a cohesive system where the backend services support all the functionality displayed in the frontend demo.

The plan focuses on:
1. Removing WordPress dependencies
2. Implementing proper database persistence with SQLite (authentication) and ChromaDB (domain entities)
3. Creating a secure authentication and authorization system
4. Building a RESTful API layer
5. Implementing domain models for agents, targets, and capabilities
6. Building a workflow orchestration engine
7. Adding analytics and monitoring
8. Integrating and testing the system

This approach ensures that the backend will be able to support all the features shown in the frontend demo while providing a modern, maintainable architecture that can be extended in the future. The use of ChromaDB for domain entities will enable powerful semantic search capabilities and facilitate AI-driven features like agent recommendations and capability matching.