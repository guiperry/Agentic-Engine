# Agentic Inference Engine

## Overview

The Agentic Inference Engine is a comprehensive platform for designing, deploying, and managing autonomous AI agents in an easy to use no-code interface. Built with a powerful Go backend and a modern React-based user interface, it empowers users to define complex goals, equip agents with diverse capabilities, and orchestrate their operations to achieve sophisticated outcomes. The engine supports multiple AI language models (including Cerebras, Gemini, and DeepSeek) to drive intelligent decision-making and task execution.

## Features

*   **Dashboard:** A centralized view for monitoring agent activity, system status, and key performance indicators.
*   **Agent Manager:**
    *   Create, configure, and manage multiple AI agents.
    *   Define agent profiles, base prompts, and operational parameters.
*   **Capability Store:**
    *   Discover, enable, and configure various capabilities (tools, skills, data connectors) for your agents.
    *   Extensible architecture to add custom capabilities.
*   **Target Manager:**
    *   Define and manage objectives, goals, or tasks for agents to pursue.
    *   Track progress towards targets.
*   **Inference Orchestrator:**
    *   Coordinate complex workflows involving multiple agents or sequential tasks.
    *   Manage the flow of information and control between agents and capabilities.
*   **Analytics & Logging:**
    *   View detailed logs of agent operations and decision-making processes.
    *   Analyze agent performance and identify areas for improvement.
*   **AI Model Integration:**
    *   Configure and switch between various AI language models (e.g., Cerebras, Gemini, DeepSeek).
    *   Supports multiple AI providers (Cerebras, Gemini, DeepSeek).
*   **Settings Management:**
    *   Configure AI provider API keys and preferences.
    *   Manage application-level settings and user preferences.
*   **Modern Web Interface:**
    *   Intuitive and responsive user interface built with React and Tailwind CSS.
    *   Accessible via a web browser.
*   **Advanced Context Management:**
    *   Process large text inputs that exceed token limits by intelligently chunking content.
    *   Multiple chunking strategies (paragraph-based, sentence-based, token-based).
*   **LLM Provider Fallback:**
    *   Robust mechanism to switch to backup LLM providers if a primary provider fails.

## Architecture

The Agentic Inference Engine employs a client-server architecture:
*   **Backend:** Developed in Go, responsible for agent logic, AI model interaction, task orchestration, and API services.
*   **Frontend:** A single-page application (SPA) built with React and TypeScript, providing a rich user interface for interacting with the engine.

## Setup and Installation

### Prerequisites

*   **Go:** Version 1.21 or later (for the backend). [https://go.dev/doc/install](https://go.dev/doc/install)
*   **Node.js and npm/yarn:** For managing frontend dependencies and running the React development server. [https://nodejs.org/](https://nodejs.org/)
*   **AI Provider Account:** An account with Cerebras, Google (for Gemini), or DeepSeek to obtain API keys.

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd Wordpress-Inference-Engine
    ```
2.  **Configure API Keys (Optional but Recommended):**
    *   Create a file named `.env` in the project's root directory.
    *   Add your API keys to this file:
        ```dotenv
        CEREBRAS_API_KEY=your_cerebras_api_key_here
        GEMINI_API_KEY=your_gemini_api_key_here
        DEEPSEEK_API_KEY=your_deepseek_api_key_here
        ```
    *   The application will load these keys on startup. Alternatively, you can set these as system environment variables.

3.  **Setup Backend:**
    *   Navigate to the backend directory.
    *   Build the backend:
        ```bash
        go build -o agentic-engine-backend .
        ```

4.  **Setup Frontend:**
    *   Navigate to the frontend directory (e.g., `cd gui`):
        ```bash
        cd gui
        ```
    *   Install dependencies:
        ```bash
        npm install
        # or
        yarn install
        ```

### Running the Application

1.  **Start the Backend:**
    *   From the backend directory:
        ```bash
        ./agentic-engine-backend
        # or
        go run .
        ```
    *   The backend server will typically start on a port like `localhost:8080` (confirm from backend configuration/logs).

2.  **Start the Frontend:**
    *   From the frontend directory (`gui`):
        ```bash
        npm run dev
        # or
        yarn dev
        ```
    *   This will start the React development server, usually on `localhost:5173` (or similar, check your Vite/React scripts config).
    *   Open your web browser and navigate to the frontend URL.

## Usage

Once the backend and frontend are running, access the application through your web browser.

1.  **Settings:**
    *   Navigate to the "Settings" view.
    *   Verify or configure your AI Provider API keys and other application settings.

2.  **Agent Manager:**
    *   Go to "Agents" to create new AI agents or manage existing ones.
    *   Define their purpose, base instructions, and select the AI models they should use.

3.  **Capability Store:**
    *   Explore "Capabilities" to see available tools and integrations.
    *   Enable and configure capabilities that your agents will need to perform their tasks (e.g., web search, file access, data analysis tools).

4.  **Target Manager:**
    *   In "Targets," define specific goals or objectives for your agents.
    *   Assign agents to targets and specify any necessary input data or parameters.

5.  **Inference Orchestrator:**
    *   Use the "Orchestrator" to design and initiate complex workflows.
    *   Monitor the execution of multi-step processes and agent interactions.

6.  **Dashboard & Analytics:**
    *   The "Dashboard" provides an overview of ongoing activities and system health.
    *   Check "Analytics" for detailed logs, performance metrics, and insights into agent behavior.

## Configuration Details

*   **API Keys:** AI provider API keys (`CEREBRAS_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`) are typically managed via a `.env` file in the backend directory or through environment variables.
*   **Backend Configuration:** Further backend settings (e.g., server port, database connections if any) might be configurable via a `config.json` or environment variables, as defined by the backend implementation.
*   **LLM Providers:** The application supports multiple LLM providers, with configuration options available in the Settings view to select primary and fallback models.

## Dependencies (Illustrative)

### Backend (Go)
*   **Gin Gonic / Echo / net/http:** (Or other Go web framework) For building REST APIs.
*   **godotenv:** For loading `.env` files.
*   **gollm:** Library for interacting with LLM providers (potentially a custom fork).
*   **tiktoken-go:** For token counting and estimation.

### Frontend (React)
*   **React:** JavaScript library for building user interfaces.
*   **TypeScript:** Superset of JavaScript adding static typing.
*   **Tailwind CSS:** Utility-first CSS framework.
*   **Vite:** Frontend build tool and development server.
*   **Axios / Fetch API:** For making HTTP requests to the backend.

## Advanced Features

### Agentic Framework
The core of the engine is its agentic framework, enabling:
*   **Goal-Oriented Autonomy:** Agents can pursue high-level goals by breaking them down into actionable steps.
*   **Dynamic Tool Use:** Agents can select and utilize capabilities from the Capability Store based on task requirements.
*   **Planning and Reasoning:** Leveraging LLMs, agents can plan sequences of actions and reason about their environment.
*   **Extensibility:** Designed for adding new agents, capabilities, and orchestration patterns.

### Context Manager
Handles large data inputs for LLMs by:
*   Intelligently splitting content into manageable chunks.
*   Processing each chunk with the AI model.
*   Synthesizing results to maintain coherence.

### LLM Provider Fallback
Ensures operational resilience by:
*   Attempting tasks with the primary configured AI provider.
*   Automatically switching to secondary/tertiary providers in case of failure or unavailability.

## License

*MIT, Apache 2.0*

## Contributing 
We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.