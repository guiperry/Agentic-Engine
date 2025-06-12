# Agentic Inference Engine

## Overview

The Agentic Inference Engine is a comprehensive platform for designing, deploying, and managing autonomous AI agents in an easy t use no-code interface. Built with a powerful Go backend and a modern React-based user interface, it empowers users to define complex goals, equip agents with diverse capabilities, and orchestrate their operations to achieve sophisticated outcomes. The engine supports multiple AI language models (including Cerebras, Gemini, and DeepSeek) to drive intelligent decision-making and task execution.

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
3.  **Build and Run:**
    ```bash
    go run .
    ```
    Or build an executable:
    ```bash
    go build -o wordpress-inference-engine .
    ./wordpress-inference-engine
    ```

## Usage

1.  **Settings Tab:**
    *   Go to the "Settings" tab first (selected by default on startup).
    *   Under "WordPress Connection", enter your site URL, WordPress username, and an Application Password. Check "Remember Me" and provide a "Site Name" if you want to save these details. Click "Connect".
    *   Under "Inference Settings", ensure the correct API keys are loaded from your `.env` file or environment variables.

2.  **Manager Tab:**
    *   Once connected, the status bar should show "Connected" and the window title will display the site name.
    *   The list of pages from your WordPress site will load automatically.
    *   Select a page to view its preview (requires Chrome/Chromium).
    *   Click "Refresh Preview" to update the preview if needed.
    *   Click "Load Content to Generator" to use the current page's content as source material in the Generator tab.

3.  **Generator Tab:**
    *   Add source content using "Add Source" (for local files) or by loading from the Manager tab.
    *   Enter a detailed prompt in the "Prompt" box.
    *   Click "Generate Content".
    *   Review the generated content in the "Generated Content" box.
    *   Use "Save to File" or "Save to WordPress" (select target page if multiple WP sources were used).

4.  **Inference Chat Tab:**
    *   Enter messages in the chat interface to interact with the AI model.
    *   View the conversation history in the chat display.

5.  **Test Inference Tab:**
    *   Enter a prompt and click "Test Inference" to get a direct response from the configured AI model.
    *   View application logs in the console widget at the bottom of this tab.

## Configuration Details

*   **API Keys:** Stored as environment variables (`CEREBRAS_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`). Using a `.env` file is recommended.
*   **Saved Sites:** Connection details marked "Remember Me" are saved in JSON format at `~/.wordpress-inference/saved_sites.json`. Passwords are encrypted (currently using Base64 encoding - **consider stronger encryption for production use**).
*   **LLM Providers:** The application is configured to use Cerebras as the primary provider with Gemini and DeepSeek as fallbacks.
*   **Context Management:** Large content is automatically processed using the Context Manager, which splits content into manageable chunks based on token limits.

## WordPress Setup: Application Passwords

This application requires **Application Passwords** for connecting to your WordPress site. Standard user passwords will not work.

1.  Log in to your WordPress admin dashboard.
2.  Go to "Users" -> "Profile".
3.  Scroll down to the "Application Passwords" section.
4.  Enter a name for the application (e.g., "Inference Engine") and click "Add New Application Password".
5.  **Important:** Copy the generated password immediately. You will **not** be able to see it again.
6.  Use this generated password in the "Application Password" field in the application's settings.

## Dependencies

*   **Fyne:** Cross-platform GUI toolkit for Go (v2.5.5).
*   **chromedp:** Headless browser library for capturing page screenshots.
*   **godotenv:** For loading `.env` files.
*   **gollm:** Library for interacting with LLM providers (using a custom fork).
*   **tiktoken-go:** For token counting and estimation.

## Advanced Features

### Context Manager

The Context Manager handles large text inputs by:
* Splitting content into manageable chunks using different strategies (paragraph, sentence, or token-based)
* Processing each chunk with the AI model
* Reassembling the results into a coherent output

This allows processing of content that would otherwise exceed the token limits of the underlying models.

### LLM Provider Fallback

The application implements a sophisticated fallback mechanism:
* Attempts to use the primary provider (Cerebras) first
* If the primary provider fails or is unavailable, automatically falls back to alternative providers (Gemini, DeepSeek)
* Provides seamless experience even when specific providers have issues

## License

*(Placeholder: Specify the license, e.g., MIT, Apache 2.0)*
