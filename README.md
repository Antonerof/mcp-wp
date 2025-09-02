# WordPress MCP Server

This is a Model Context Protocol (MCP) server for WordPress, allowing you to interact with your WordPress site using natural language via an MCP-compatible client like Claude for Desktop. This server exposes various WordPress data and functionality as MCP tools.

## Usage 

### MCP Clients (Any Editor)

Works with any MCP-compatible editor or client. Point your editor at the server command and provide WordPress credentials via environment variables.

1. Create a `.env` with:
    - `WORDPRESS_API_URL`
    - `WORDPRESS_USERNAME`
    - `WORDPRESS_PASSWORD`
2. Choose a launch command for your client:
    - Use published package: `npx -y @instawp/mcp-wp`
    - Use local build: `node ./build/server.js`
    - Dev mode (optional): `node --loader tsx src/server.ts`
3. In your editor’s MCP settings, add a server with stdio transport:
    - name: `wordpress`
    - command: one of the above
    - env: load from `.env` or set inline in the client config
4. Restart your editor/client.

#### Example: Claude Desktop

1. Install [Claude Desktop](https://claude.ai/download) and open Settings → Developer.
2. Click “Edit Config” and use `claude_desktop_config.json.example` from this repo as a template.
3. Provide an absolute path to `build/server.js` (or use the `npx` command) and set the WordPress env vars.
4. Save and restart Claude Desktop. For credentials, see [Application Passwords](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide#Getting-Credentials).

#### Example: VS Code

Use VS Code to run and debug the MCP server while your MCP client (any editor) connects over stdio.

1. Open this folder in VS Code and create a `.env` (see vars above).
2. Install deps in the integrated terminal: `npm install`.
3. Run the server:
     - Dev (watch): `npm run dev`
     - Built: `npm start` (after `npm run build`)
4. Optional debug config (`.vscode/launch.json`):

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Dev: tsx server.ts",
            "runtimeExecutable": "node",
            "runtimeArgs": ["--loader", "tsx", "src/server.ts"],
            "envFile": "${workspaceFolder}/.env",
            "cwd": "${workspaceFolder}"
        },
        {
            "type": "node",
            "request": "launch",
            "name": "Built: build/server.js",
            "program": "${workspaceFolder}/build/server.js",
            "envFile": "${workspaceFolder}/.env",
            "cwd": "${workspaceFolder}"
        }
    ]
}
```

#### Example: MCP server config (JSON)

Register this server with any MCP client that accepts JSON configuration.

Using the published package (npx):

```json
{
    "mcpServers": {
        "wordpress": {
            "command": "npx",
            "args": ["-y", "@instawp/mcp-wp"],
            "env": {
                "WORDPRESS_API_URL": "https://your-wordpress-site.com",
                "WORDPRESS_USERNAME": "wp_username",
                "WORDPRESS_PASSWORD": "your_application_password"
            }
        }
    }
}
```

Using a local build:

```json
{
    "mcpServers": {
        "wordpress": {
            "command": "node",
            "args": ["./build/server.js"],
            "env": {
                "WORDPRESS_API_URL": "https://your-wordpress-site.com",
                "WORDPRESS_USERNAME": "wp_username",
                "WORDPRESS_PASSWORD": "your_application_password"
            }
        }
    }
}
```


## Features

This server currently provides tools to interact with core WordPress data:

### **Unified Content Management** (8 tools)
Handles ALL content types (posts, pages, custom post types) with a single set of intelligent tools:

*   `list_content`: List any content type with filtering and pagination
*   `get_content`: Get specific content by ID and type
*   `create_content`: Create new content of any type
*   `update_content`: Update existing content of any type
*   `delete_content`: Delete content of any type
*   `discover_content_types`: Find all available content types on your site
*   `find_content_by_url`: Smart URL resolver that can find and optionally update content from any WordPress URL
*   `get_content_by_slug`: Search by slug across all content types

### **Unified Taxonomy Management** (8 tools)
Handles ALL taxonomies (categories, tags, custom taxonomies) with a single set of tools:

*   `discover_taxonomies`: Find all available taxonomies on your site
*   `list_terms`: List terms in any taxonomy
*   `get_term`: Get specific term by ID
*   `create_term`: Create new term in any taxonomy
*   `update_term`: Update existing term
*   `delete_term`: Delete term from any taxonomy
*   `assign_terms_to_content`: Assign terms to any content type
*   `get_content_terms`: Get all terms for any content

### **Specialized Tools**

*   **Media:**
    *   `list_media`: List all media items (supports pagination and searching).
    *   `get_media`: Retrieve a specific media item by ID.
    *   `create_media`: Create a new media item from a URL.
    *   `update_media`: Update an existing media item.
    *   `delete_media`: Delete a media item.
*   **Users:**
    *   `list_users`: List all users with filtering, sorting, and pagination options.
    *   `get_user`: Retrieve a specific user by ID.
    *   `create_user`: Create a new user.
    *   `update_user`: Update an existing user.
    *   `delete_user`: Delete a user.
*   **Comments:**
    *   `list_comments`: List all comments with filtering, sorting, and pagination options.
    *   `get_comment`: Retrieve a specific comment by ID.
    *   `create_comment`: Create a new comment.
    *   `update_comment`: Update an existing comment.
    *   `delete_comment`: Delete a comment.
*   **Plugins:**
    *   `list_plugins`: List all plugins installed on the site.
    *   `get_plugin`: Retrieve details about a specific plugin.
    *   `activate_plugin`: Activate a plugin.
    *   `deactivate_plugin`: Deactivate a plugin.
    *   `create_plugin`: Create a new plugin.
*   **Plugin Repository:**
    *   `search_plugins`: Search for plugins in the WordPress.org repository.
    *   `get_plugin_info`: Get detailed information about a plugin from the repository.

*   **Block Types:**
    *   `list_block_types`: List all available Gutenberg block types (core and custom). Optional filters: `context` (view|embed|edit) and `namespace` (e.g., "core").
    *   `get_block_type`: Get details for a specific block type by name (e.g., `core/paragraph`, `core/heading`). Optional `context`.

### **Key Advantages**

#### Smart URL Resolution
The `find_content_by_url` tool can:
- Take any WordPress URL and automatically find the corresponding content
- Detect content types from URL patterns (e.g., `/documentation/` → documentation custom post type)
- Optionally update the content in a single operation
- Works with posts, pages, and any custom post types

#### Universal Content Operations
All content operations use a single `content_type` parameter:
```json
{
  "content_type": "post",        // for blog posts
  "content_type": "page",        // for static pages  
  "content_type": "product",     // for WooCommerce products
  "content_type": "documentation" // for custom post types
}
```

#### Universal Taxonomy Operations
All taxonomy operations use a single `taxonomy` parameter:
```json
{
  "taxonomy": "category",        // for categories
  "taxonomy": "post_tag",        // for tags
  "taxonomy": "product_category", // for WooCommerce
  "taxonomy": "skill"            // for custom taxonomies
}
```

#### Gutenberg Block Discovery
Discover and inspect Gutenberg blocks available on your site. Helpful for building block-based content programmatically or validating supported block capabilities.

## Using with npx and .env file

You can run this MCP server directly using npx without installing it globally:

```bash
npx -y @instawp/mcp-wp
```

Make sure you have a `.env` file in your current directory with the following variables:

```env
WORDPRESS_API_URL=https://your-wordpress-site.com
WORDPRESS_USERNAME=wp_username
WORDPRESS_PASSWORD=wp_app_password
```

## Development

### Prerequisites

*   **Node.js and npm:** Ensure you have Node.js (version 18 or higher) and npm installed.
*   **WordPress Site:** You need an active WordPress site with the REST API enabled.
*   **WordPress API Authentication:** Set up authentication for the WordPress REST API. This typically requires an authentication plugin or method (like Application Passwords).
*   **MCP Client:** You need an application that can communicate with the MCP Server. Currently, Claude Desktop is recommended.

### Installation and Setup

1.  **Clone the Repository:**

    ```bash
    git clone <repository_url>
    cd wordpress-mcp-server
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Create a `.env` file:**

    Create a `.env` file in the root of your project directory and add your WordPress API credentials:

    ```env
    WORDPRESS_API_URL=https://your-wordpress-site.com
    WORDPRESS_USERNAME=wp_username
    WORDPRESS_PASSWORD=wp_app_password
    ```

    Replace the placeholders with your actual values.

4.  **Build the Server:**

    ```bash
    npm run build
    ```

5. **Configure Claude Desktop:**

   * Open Claude Desktop settings and navigate to the "Developer" tab.
   * Click "Edit Config" to open the `claude_desktop_config.json` file.
   * Add a new server configuration under the `mcpServers` section. You will need to provide the **absolute** path to the `build/server.js` file and your WordPress environment variables.
   * Save the configuration.

### Running the Server

Once you've configured Claude Desktop, the server should start automatically whenever Claude Desktop starts.

You can also run the server directly from the command line for testing:

```bash
npm start
```

or in development mode:

```bash
npm run dev
```

### Security

*   **Never commit your API keys or secrets to version control.**
*   **Use HTTPS for communication between the client and server.**
*   **Validate all inputs received from the client to prevent injection attacks.**
*   **Implement proper error handling and rate limiting.**

## Project Overview

### Architecture

The server uses a **unified tool architecture** to reduce complexity:

```
src/
├── server.ts                    # MCP server entry point
├── wordpress.ts                 # WordPress REST API client
├── cli.ts                      # CLI interface
├── types/
│   └── wordpress-types.ts      # TypeScript definitions
└── tools/
    ├── index.ts                # Tool aggregation
    ├── unified-content.ts      # Universal content management (8 tools)
    ├── unified-taxonomies.ts   # Universal taxonomy management (8 tools)
    ├── media.ts               # Media management (~5 tools)
    ├── users.ts               # User management (~5 tools)
    ├── comments.ts            # Comment management (~5 tools)
    ├── plugins.ts             # Plugin management (~5 tools)
    └── plugin-repository.ts   # WordPress.org plugin search (~2 tools)
    └── block-types.ts         # Gutenberg block types listing and inspection (2 tools)
```

### Key Features

- **Smart URL Resolution**: Automatically detect content types from URLs and find corresponding content
- **Universal Content Management**: Single set of tools handles posts, pages, and custom post types
- **Universal Taxonomy Management**: Single set of tools handles categories, tags, and custom taxonomies
- **Type Safety**: Full TypeScript support with Zod schema validation
- **Comprehensive Logging**: Detailed API request/response logging for debugging
- **Error Handling**: Graceful error handling with informative messages

### Getting Started

1. Clone the repository and install dependencies with `npm install`
2. Create a `.env` file with your WordPress credentials
3. Build the project with `npm run build`
4. Configure Claude Desktop with the server
5. Start using natural language to manage your WordPress site!

### Contribution

Feel free to open issues or make pull requests to improve this project. Check out `CLAUDE.md` for detailed development guidelines.
