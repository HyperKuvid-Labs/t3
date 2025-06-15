import google.generativeai as genai
import re
import networkx as nx
from typing import List, Set
import ast 
import os 
import json
import string


genai.configure(api_key="AIzaSyAb56f8gsiKgrg7ry3UWcuiDbGQsLMFJj0")


GENERATABLE_FILES = {
    '.py', '.html', '.css', '.js', '.md', '.yml', '.yaml', '.env', '.txt', '.png', '.ico', '.sh','.jsx','.tsx','.ts','.json','.ejs','.json'}
GENERATABLE_FILENAMES = {
    'Dockerfile', 'README.md', '.gitignore', 'requirements.txt', 'docker-compose.yml', '.env'
    'package.json',
    'tsconfig.json',
    'webpack.config.js',
    'babel.config.js',
    '.babelrc',
    'vite.config.js',  
    '.eslintrc.js',
    '.prettierrc',
    'index.js',       
    'server.js',      
    'app.js',         
}

class TreeNode:
    def __init__(self, value):
        self.value = value
        self.children = []
        self.is_file = False

    def add_child(self, child_node):
        print("Adding child node:", child_node.value)
        self.children.append(child_node)
    
    def print_tree(self, level=0, prefix=""):
        if level == 0:
            print(self.value)
        else:
            print(prefix + "├── " + self.value)
        
        for i, child in enumerate(self.children):
            is_last = i == len(self.children) - 1
            child.print_tree(
                level + 1, 
                prefix + ("    " if is_last else "│   ")
            )

    def dfsTraverse(self):
        print("Current node value: ", self.value)
        for child in self.children:
            child.dfsTraverse()


class DepenedencyAnalyzer:
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_file(self, file_path: str, content: str):
        self.graph.add_node(file_path)
        dependencies = self.extract_dependencies(file_path, content)
        for dep in dependencies:
            self.graph.add_edge(file_path, dep)
    
    def extract_dependencies(self, file_path: str, content: str) -> Set[str]:
        dependencies = set()
        file_dir = os.path.dirname(file_path)
        
        if file_path.endswith("py"):
            try:
                tree = ast.parse(content)
                for node in ast.walk(tree):
                    if isinstance(node, ast.Import):
                        for alias in node.names:
                            dependencies.add(alias.name)
                        
                    elif isinstance(node, ast.ImportFrom):
                        module = node.module
                        level = node.level

                        if level > 0:
                            rel_path = "." + level + (f".{module}" if module else "")
                            rel_module = self.resolve_relative_import(file_dir, rel_path)
                            if rel_module:
                                dependencies.add(rel_module)
                        elif module:
                            dependencies.add(module)

            except Exception as e:
                print(f"Error parsing {file_path}: {e}")

        elif file_path.endswith(".html"):
            includes = re.findall(r'{%s\*(include|extends)\s+[\'"]([^\'"]+)[\'"]\s*%}', content)
            for _, templates in includes:
                dependencies.add(templates)
            
        elif file_path.endswith(".css"):
            imports = re.findall(r'@import\s+[\'"]([^\'"]+)[\'"]', content)
            for imp in imports:
                dependencies.add(imp)
            
        elif file_path.endswith((".js", ".jsx", ".ts", ".tsx")):
            imports = re.findall(r'import\s+[\'"]([^\'"]+)[\'"]', content)
            for imp in imports:
                dependencies.add(imp)
        
        elif file_path.endswith(".json"):
            try:
                data = json.loads(content)
                for key in ['dependencies', 'devDependencies', 'peerDependencies']:
                    deps = data.get(key, {})
                    for dep in deps:
                        dependencies.add(dep)
            except Exception as e:
                print(f"Error parsing JSON in {file_path}: {e}")
        
        return dependencies

    def resolve_relative_import(self, file_path: str, rel_path: str) -> str:
        parts = file_path.split(os.sep)
        rel_depth = rel_path.count('.')
        module_name = rel_path.replace('.', '').lstrip(os.sep)

        base_parts = parts[:-rel_depth] if rel_depth <= len(parts) else []
        if module_name:
            base_parts.append(module_name.replace('.', os.sep))
        
        resolved_base_path = os.path.join(*base_parts)

        extensions = ['.py', '.js', '.ts', '.jsx', '.tsx']
        for ext in extensions:
            if os.path.exists(resolved_base_path + ext):
                return resolved_base_path + ext
            elif os.path.exists(os.path.join(resolved_base_path, 'index' + ext)):
                return os.path.join(resolved_base_path, 'index' + ext)

        return None

    def get_dependencies(self, file_path: str) -> List[str]:
        return list(self.graph.successors(file_path))
    
    def get_dependents(self, file_path: str) -> List[str]:
        return list(self.graph.predecessors(file_path))
    
    def get_all_nodes(self) -> List[str]:
        return list(self.graph.nodes)
    
    def visualize_graph(self):
        try:
            import matplotlib.pyplot as pl
            pos = nx.spring_layout(self.graph)
            nx.draw(self.graph, pos, with_labels=True, arrows=True, node_size=2000, node_color='lightblue', font_size=10, font_color='black', edge_color='gray')
            pl.title("Dependency Graph")
            pl.show()
        except ImportError:
            print("Matplotlib is not installed. Skipping graph visualization.")



def refine_prompt(prompt: str) -> str:
    resp = genai.GenerativeModel("gemini-2.5-flash-preview-05-20").generate_content(
        contents=f"""
            You are a senior MERN stack architect. Your task is to take a high-level project idea and generate a detailed prompt that instructs a language model to output a production-ready MERN folder structure, including all directories and file names, but no file contents or code.

            Analyse the {prompt} first—if it lacks clarity or scope, elaborate on it appropriately before proceeding. If the prompt is already detailed, return it as is.

            project_name : {prompt}

            Follow these rules when writing the refined prompt:

            📦 Prompt Template to Generate:
            Project Name: <project_name>

            Generate the folder structure only (no code or file contents) for a MERN stack project named <project_name>.

            This project is a <brief description of the system>, with the following key features:

            <List the core user-facing features and workflows>

            <List different user roles and their capabilities>

            Use MERN best practices:

            - Keep backend and frontend in separate folders: `client/` and `server/`
            - Backend uses Express.js, MongoDB, Mongoose ODM, and JWT for auth
            - Frontend uses React, React Router, Redux/Context API for state management
            - Organize React components into pages, components, and hooks
            - Follow MVC architecture on the server side
            - Use dotenv for environment configuration
            - Use ESLint and Prettier for code linting/formatting
            - Use nodemon for development and concurrently for full-stack dev

            Required Root Files/Folders:
            - client/ (React frontend)
            - server/ (Node.js backend)
            - .env
            - .env.example
            - .gitignore
            - README.md
            - package.json (workspace-level or individual for both client/server)
            - Dockerfile, docker-compose.yml (if needed)

            Inside `client/`:
            - src/
                - components/
                - pages/
                - hooks/
                - context/
                - utils/
                - services/
                - App.js / App.tsx
                - index.js / index.tsx
                - assets/ (images, icons, fonts)
                - styles/
            - public/
                - index.html
                - favicon.ico

            Inside `server/`:
            - config/ (DB connection, JWT setup, etc.)
            - controllers/
            - routes/
            - models/
            - middleware/
            - utils/
            - validations/
            - app.js
            - server.js
            - tests/
            - package.json

            Additional Technical Requirements:
            - RESTful API structure with versioning (e.g., /api/v1)
            - Folder for Swagger/Postman API docs (optional)
            - Include nodemon.json for backend auto-reload
            - Docker and CI/CD placeholders like .github/workflows/

            Example Input:
            Input: Task management app like Trello

            Expected Refined Prompt Output:
            Project Name: task_manager

            Generate the folder structure only (no code or file contents) for a MERN project named task_manager.

            This project is a task management system similar to Trello, with the following key features:

            - Users can create projects, add tasks, assign team members.
            - Drag-and-drop interface for task management.
            - Real-time updates using WebSockets.
            - Admins can manage users and permissions.

            User Roles and Capabilities:

            - Users: Create and manage tasks within assigned projects.
            - Admins: Manage all projects, users, and settings.

            Follow modern MERN architecture practices:

            - Separate client and server codebases.
            - Use modular folder organization and maintainable code structure.
            - Keep environment variables in .env.
            - Use ESLint, Prettier, nodemon, and concurrently.

            Return only the folder structure as a tree view. Do not include any code or file content.

        """
    )
    return resp.text

def generate_folder_struct(prompt: string) -> string:
    resp = genai.GenerativeModel("gemini-2.5-pro-preview-05-06").generate_content(
        contents = prompt
    )

    return resp.text

def generate_file_metadata(context: str, filepath: str, refined_prompt: str, tree: str, json_file_name: str, file_content: str) -> str:
    file_type = os.path.splitext(filepath)[1]
    filename = os.path.basename(filepath)

    prompt = f"""You are analyzing a file from a MERN (MongoDB, Express.js, React, Node.js) project. Generate a detailed yet concise metadata description that captures its purpose, structure, and relationships.

        **File Information**
        - File Name: {filename}
        - File Type: {file_type} (e.g., .js, .jsx, .ts, .tsx, .json, .css)
        - Project Location: {context} (e.g., client/src/components, server/routes, server/models)
        - Project Idea: {refined_prompt}
        - Project Structure:
        {tree}
        - File Content:
        {file_content}

        **What to include in your response:**
        1. A concise 2–3 sentence summary of what this file does and how it fits into the MERN project.
        2. If it's a React file (.jsx/.tsx/.js/.ts):
           - Describe the component’s role, props, hooks used, and how it fits in the UI.
        3. If it's a backend file (.js/.ts under server):
           - Explain its function (route handler, controller, model, middleware, config, etc.).
           - List any Express/Mongoose logic used.
        4. If it's a static file (.css/.json):
           - Summarize the styles or configuration it contains.
        5. List **which other files or modules this file is directly coupled with**, either via import/require or usage.
        6. Mention any external packages (e.g., express, mongoose, react-router-dom, axios, redux, dotenv) used in this file.

        **Response Format:**
        - Return only the raw description text (no markdown, bullets, or headings).
        - Do not include any code or formatting artifacts.
    """

    resp = genai.GenerativeModel("gemini-2.5-pro-preview-05-06").generate_content(
        contents=prompt
    )

    return resp.text


def generate_file_content(context: str, filepath: str, refined_prompt: str, tree: str, json_file_name: str) -> str:
    file_type = os.path.splitext(filepath)[1]
    filename = os.path.basename(filepath)

    prompt = f"""Generate the content of a MERN (MongoDB, Express.js, React, Node.js) project file.

        Details:
        - File Name: {filename}
        - File Type: {file_type} (e.g., .js, .jsx, .ts, .tsx, .json, .css)
        - Project Context: {context} (e.g., client/src/components, server/routes, server/models, public/)
        - Project Idea: {refined_prompt}
        - Full Folder Structure: {tree}

        Requirements:

        For Frontend React Files (.js, .jsx, .ts, .tsx):
        - Create functional components with hooks (e.g., useState, useEffect)
        - Use clean, modular React code with proper folder-based structuring
        - Use meaningful props and component abstraction
        - Avoid inline styling and logic in JSX
        - Use comments and PropTypes (or TypeScript interfaces) where applicable

        For Backend Node/Express Files:
        - Follow modular Express.js structure (separate routes, controllers, middleware, models)
        - Use async/await with error handling
        - For models, use Mongoose and define proper schema types
        - Add middleware, config, or route logic as needed

        For JSON Files:
        - Return only properly formatted JSON

        For CSS Files:
        - Use modular CSS (or SCSS if applicable)
        - Follow naming conventions (e.g., BEM)
        - Ensure responsiveness and layout compatibility

        Output:
        - Return only the raw code as it would appear in the file (no markdown or explanation)
    """

    response = genai.GenerativeModel("gemini-2.5-flash-preview-05-20").generate_content(
        contents=prompt
    )

    return response.text


def should_generate_content(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    filename = os.path.basename(filepath)
    return ext in GENERATABLE_FILES or filename in GENERATABLE_FILENAMES

def dfs_tree_and_gen(
    root: TreeNode,
    refined_prompt: str,
    tree_structure: str,
    project_name: str,
    current_path: str = "",
    parent_context: str = "",
    json_file_name: str = "",
    metadata_dict: dict = None,
    dependency_analyzer: DepenedencyAnalyzer = None,
    is_top_level: bool = True
) -> None:
    # if metadata_dict is None:
    #     if json_file_name and os.path.exists(json_file_name):
    #         try:
    #             with open(json_file_name, 'r') as f:
    #                 metadata_dict = json.load(f)
    #         except Exception:
    #             metadata_dict = {}
    #     else:
    #         metadata_dict = {}

    clean_name = root.value.split('#')[0].strip()
    clean_name = clean_name.replace('(', '').replace(')', '')
    clean_name = clean_name.replace('uploads will go here, e.g., ', '')

    if is_top_level:
        full_path = os.path.join(project_name, clean_name)
    else:
        full_path = os.path.join(current_path, clean_name)

    context = os.path.join(parent_context, clean_name) if parent_context else clean_name

    # Traverse context into nested dict
    # path_part = context.split('/')
    # current_dict = metadata_dict
    # for part in path_part[:-1]:
    #     if part and part not in current_dict:
    #         current_dict[part] = {}
    #     if part:
    #         current_dict = current_dict[part]

    if root.is_file:
        parent_dir = os.path.dirname(full_path)
        if parent_dir and not os.path.exists(parent_dir):
            os.makedirs(parent_dir, exist_ok=True)

        if should_generate_content(full_path):
            try:
                content =generate_file_content(
                    context=context,
                    filepath=full_path,
                    refined_prompt=refined_prompt,
                    tree=tree_structure,
                    json_file_name=json_file_name
                )
                metadata = generate_file_metadata(
                    context = context,
                    filepath = full_path,
                    refined_prompt=refined_prompt,
                    tree=tree_structure,
                    json_file_name=json_file_name,
                    file_content=content
                )
                with open(full_path, 'w') as f:
                    f.write(content)
                # parts = context.split('/')
                # current = metadata_dict[project_name]
                # for part in parts[:-1]:
                #     current = current.setdefault(part, {})
                # current[parts[-1]] = {
                #     "type": "file",
                #     "description": metadata,
                #     "path": full_path
                # }

                if dependency_analyzer:
                    dependency_analyzer.add_file(full_path, content=content)
                
                metadata_dict[project_name].append({
                    "path": full_path,
                    "description": metadata,
                })
                print(f"Generated content for {full_path}")

                # current_dict[clean_name] = {
                #     "type": "file",
                #     "description": metadata,
                #     "path": full_path
                # }
            except Exception as e:
                print(f"Error generating file {full_path}: {e}")
        else:
            print(f"Skipping file: {full_path}")

    else:
        try:
            os.makedirs(full_path, exist_ok=True)
            print(f"Created directory: {full_path}")
            # current_dict[clean_name] = {"type": "directory"}
            for child in root.children:
                dfs_tree_and_gen(
                    root=child,
                    refined_prompt=refined_prompt,
                    tree_structure=tree_structure,
                    project_name=project_name,
                    current_path=full_path,
                    parent_context=context,
                    json_file_name=json_file_name,
                    metadata_dict=metadata_dict,
                    dependency_analyzer=dependency_analyzer,
                    is_top_level=False
                )
        except OSError as e:
            print(f"Error creating directory {full_path}: {e}")
            return

    # if is_top_level and json_file_name:
    #     with open(json_file_name, 'w') as f:
    #         json.dump(metadata_dict, f, indent=4)


def check_file_coupleness(metadata_dict, file_content, file_path, actual_dependencies):
    prompt = f"""
    You are an expert MERN (MongoDB, Express, React, Node.js) code reviewer.

    You are reviewing the coupling accuracy of a file in a MERN stack project by comparing:
    1. The actual imports and module/component usage in the file.
    2. The declared `couples_with` list in the project’s metadata.
    3. The dependencies extracted via static analysis.

    Your goal is to verify whether the declared couplings are complete, precise, and consistent with the file’s true behavior.

    ---

    **File Path**: {file_path}

    ---

    **File Content**:
    {file_content}

    ---

    **Declared Metadata Couplings** (`couples_with`):
    {metadata_dict.get('couples_with', [])}

    ---

    **Statically Detected Dependencies (from code analysis)**:
    {actual_dependencies}

    ---

    **Instructions**:
    - Analyze the file’s actual imports, requires, component usage, API calls, and logical dependencies.
    - Compare that to the declared couplings in the metadata (`couples_with`).
    - Then compare both with the dependencies inferred via static analysis (`actual_dependencies`).
    - If you find discrepancies, please describe them and suggest corrections.
    - Determine if:
      1. All real dependencies are properly captured in the metadata.
      2. There are incorrect or missing entries in the metadata.
      3. The file has any syntax or runtime errors affecting dependency resolution.

    ---

    **Return ONLY this exact JSON format**:
    {{
    "correctness": "correct" or "incorrect",
    "changes_needed": "clear explanation of what’s missing, extra, or incorrect (empty string if everything is accurate)"
    }}

    ---

    **Examples**:

    Example 1 (Correct):
    {{
    "correctness": "correct",
    "changes_needed": ""
    }}

    Example 2 (Incorrect):
    {{
    "correctness": "incorrect",
    "changes_needed": "The file imports `axios` and `../utils/api.js`, but only `react-router-dom` is listed in metadata. Metadata is missing `axios` and `utils/api`. Also, `redux/store.js` is incorrectly listed but unused."
    }}
    """

    resp = genai.GenerativeModel("gemini-2.5-pro-preview-05-06").generate_content(
        contents=prompt
    )

    cleaned_response = resp.text.strip('`').replace('json\n', '').strip()
    try:
        data = json.loads(cleaned_response)
        correctness = data["correctness"]
        changes_needed = data["changes_needed"]
        return correctness, changes_needed
    except json.JSONDecodeError:
        return "undetermined", f"Could not parse response: {resp.text}. Please check the model's output format."
