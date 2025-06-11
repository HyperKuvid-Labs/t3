import google.generativeai as genai
import string
import os 
import json
import re
from tqdm import tqdm
import networkx as nx
import ast 
from typing import List, Set

genai.configure(api_key="AIzaSyAb56f8gsiKgrg7ry3UWcuiDbGQsLMFJj0")

#this is still confidential, so i want you guys to not use in any of your projects yet.

#models
# models/embedding-gecko-001
# models/gemini-1.0-pro-vision-latest
# models/gemini-pro-vision
# models/gemini-1.5-pro-latest
# models/gemini-1.5-pro-001
# models/gemini-1.5-pro-002
# models/gemini-1.5-pro
# models/gemini-1.5-flash-latest
# models/gemini-1.5-flash-001
# models/gemini-1.5-flash-001-tuning
# models/gemini-1.5-flash
# models/gemini-1.5-flash-002
# models/gemini-1.5-flash-8b
# models/gemini-1.5-flash-8b-001
# models/gemini-1.5-flash-8b-latest
# models/gemini-1.5-flash-8b-exp-0827
# models/gemini-1.5-flash-8b-exp-0924
# models/gemini-2.5-pro-exp-03-25
# models/gemini-2.5-pro-preview-03-25
# models/gemini-2.5-flash-preview-04-17
# models/gemini-2.5-flash-preview-05-20
# models/gemini-2.5-flash-preview-04-17-thinking
# models/gemini-2.5-pro-preview-05-06
# models/gemini-2.0-flash-exp
# models/gemini-2.0-flash
# models/gemini-2.0-flash-001
# models/gemini-2.0-flash-exp-image-generation
# models/gemini-2.0-flash-lite-001
# models/gemini-2.0-flash-lite
# models/gemini-2.0-flash-preview-image-generation
# models/gemini-2.0-flash-lite-preview-02-05
# models/gemini-2.0-flash-lite-preview
# models/gemini-2.0-pro-exp
# models/gemini-2.0-pro-exp-02-05

GENERATABLE_FILES = {
    '.py', '.html', '.css', '.js', '.md', '.yml', '.yaml', '.env', '.txt', '.png', '.ico', '.sh'
}
GENERATABLE_FILENAMES = {
    'Dockerfile', 'README.md', '.gitignore', 'requirements.txt', 'docker-compose.yml', '.env'
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
            
        elif file_path.endswith(".js"):
            imports = re.findall(r'import\s+[\'"]([^\'"]+)[\'"]', content)
            for imp in imports:
                dependencies.add(imp)
        
        return dependencies
    
    def resolve_relative_import(self, file_path: str, rel_path: str) -> str:
        parts = file_path.split(os.sep)
        rel_depth = rel_path.count('.')
        module_name = rel_path.replace('.', '')
        bse_parts = parts[:-rel_depth]
        if module_name:
            bse_parts.append(module_name.replace('.', os.sep))
        resolved_path = os.path.join(*bse_parts)
        if not resolved_path.endswith('.py'):
            resolved_path += '.py'
        return resolved_path if os.path.exists(resolved_path) else None
    
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
            print("punda matplotlib is not installed. Skipping graph visualization.")

def refine_prompt(prompt: string) ->  string:
    resp = genai.GenerativeModel("gemini-2.5-flash-preview-05-20").generate_content(
        contents = f"""
            You are a senior Django architect. Your task is to take a high-level project idea and generate a detailed prompt that instructs a language model to output a production-ready Django folder structure, including all directories and file names, but no file contents or code.

            Analyse the {prompt} first—if it lacks clarity or scope, elaborate on it appropriately before proceeding. If the prompt is already detailed, return it as is.

            project_name : {prompt}

            Follow these rules when writing the refined prompt:
            Prompt Template to Generate:
            Project Name : <project_name>

            Generate the folder structure only (no code or file contents) for a Django project named <project_name>.

            This project is a <brief description of the system>, with the following key features:

            <List the core user-facing features and workflows>

            <List different user roles and their capabilities>

            Use Django best practices:

            Modular, reusable apps with clear separation of concerns.

            Strictly include manage.py in the root directory to run the server.

            Follow the standard project layout for production-grade systems.

            Include standard folders and files for:

            Static files: static/

            Templates: templates/

            Media uploads: media/

            Configuration: config/

            The apps should include, but are not limited to:

            accounts – handles authentication, user registration, and profile management.

            events – responsible for event models, creation, and management.

            dashboard – provides tailored dashboards for each user role.

            core – houses shared utilities, context processors, and project-wide settings.

            Follow Django naming conventions and proper project structuring.

            Return only the folder structure with relevant file names in a tree view format.
            Do not include any code or file contents.

            Additional Technical Requirements & Best Practices:
            Maintain modularity and reusability across all Django apps.

            Use a standard production layout:

            Root project directory with manage.py

            Configuration directory (e.g., config/ or <project_name>_config/)

            App directories under the root (e.g., accounts/, events/, dashboard/, core/, etc.)

            Static assets in static/, templates in templates/, and user uploads in media/

            Include requirements.txt, .env.example, .env, README.md, .gitignore

            Placeholders for Docker and CI/CD: Dockerfile, docker-compose.yml, .github/workflows/, etc.

            Each app should have: migrations/, static/, templates/, tests/, and Django standard files (models.py, views.py, etc.)

            The config/ folder must contain settings.py, urls.py, wsgi.py, and asgi.py

            📌 Front-End Styling & Scripting Guidelines:
            Avoid all inline JavaScript. All JavaScript logic must reside in external .js files organized under a centralized static/js/ directory or within app-specific static folders.

            Leverage Bootstrap CSS framework for UI styling. Include Bootstrap via CDN or local files within the static/ directory. Do not mix custom styles with Bootstrap’s core files—place all overrides or additions in separate .css files.

            Ensure front-end templates link only to external JavaScript and CSS resources to promote maintainability, reusability, and separation of concerns.

            Example Input:
            Input: events management portal

            Expected Refined Prompt Output:
            Project Name : events_management_portal

            Generate the folder structure only (no code or file contents) for a Django project named events_management_portal.

            The project is an Event Management System with the following key features:

            Users can register, log in, and browse upcoming events.

            Organizers can create, edit, and manage events.

            Admins can approve, reject, or delete submitted events.

            A custom dashboard is available for each user type.

            User Roles and Capabilities:

            Users: Register, log in, view, and register for events.

            Organizers: Manage events they create.

            Admins: Moderate all content, manage users, and oversee events.

            Use Django best practices:

            Structure the project with modular and reusable apps.

            Avoid inline JavaScript. Place all JS in separate files under static/js/.

            Use Bootstrap for all styling. Include Bootstrap via CDN or local static files.

            Follow standard production layout with clear app boundaries and reusable templates.

            Include folders for:

            static/

            templates/

            media/

            config/

            Apps to include:

            accounts

            events

            dashboard

            core

            Include standard Django files such as:

            manage.py in the root

            __init__.py, admin.py, apps.py, models.py, views.py, urls.py, tests.py in each app

            settings.py, urls.py, wsgi.py, and asgi.py in config/

            Return only the complete end-to-end folder structure in a tree view format. Do not include any file content or code.


"""
    )

    return resp.text

# for model in genai.list_models():
#     print(model.name)


# response = genai.GenerativeModel("gemini-2.5-pro-preview-05-06").generate_content(
#     contents = '''Generate the folder structure only (no files or code) for a Django project named event_portal.
#     The project is an Event Management System with the following key features:

#     Users can register, log in, and browse upcoming events.

#     Organizers can create and manage events.

#     Admins can approve or reject submitted events.

#     Includes a dashboard for both users and organizers.

#     Use Django best practices: apps should be modular and reusable.

#     Include standard folders for static files, templates, media, and configuration.

#     Use apps like: accounts, events, dashboard, and core.

#     Follow conventional Django naming and project structuring.
#     Return just the whole end to end production-based folder structure as a tree view along with the file names, not any code'''
# )

def generate_folder_struct(prompt: string) -> string:
    resp = genai.GenerativeModel("gemini-2.5-pro-preview-05-06").generate_content(
        contents = prompt
    )

    return resp.text

def generate_file_metadata(context: str, filepath: str, refined_prompt: str, tree: str, json_file_name: str, file_content: str) -> str:
    file_type = os.path.splitext(filepath)[1]
    filename = os.path.basename(filepath)

    prompt = f"""You are analyzing a file from a Django project. Generate a detailed yet concise metadata description that captures its purpose, structure, and relationships.

        **File Information**
        - File Name: {filename}
        - File Type: {file_type} (e.g., .py, .html, .css)
        - Project Location: {context} (e.g., models, views, static/css, templates/)
        - Project Idea: {refined_prompt}
        - Project Structure:
        {tree}
        - File Content:
        {file_content}

        **What to include in your response:**
        1. A concise 2–3 sentence summary of what this file does and how it fits into the Django project.
        2. If it's a Python file:
        - Mention key classes, functions, models, or signal handlers.
        3. If it's a template (HTML):
        - Describe the view/component it supports and any template inheritance.
        4. If it's a static file (CSS/JS):
        - Explain the styling or client-side logic it contributes to.
        5. List **which other files or modules this file is directly coupled with**, either through imports, usage, or template inclusion.
        6. Mention any external packages or Django modules (e.g., `django.contrib.auth`) used here.

        **Response Format:**
        - Return only the raw description text (no markdown, bullets, or headings).
        - Do not include any code or formatting artifacts.
    """

    resp = genai.GenerativeModel("gemini-2.5-pro-preview-05-06").generate_content(
        contents = prompt
    )

    return resp.text

def generate_file_content(context: str, filepath: str, refined_prompt: str, tree: str, json_file_name: str) -> str:
    
    file_type = os.path.splitext(filepath)[1]
    filename = os.path.basename(filepath)
    
    prompt = f"""Generate the content of a Django project file.

        Details:
        - File Name: {filename}
        - File Type: {file_type} (e.g., Python, HTML, CSS, JavaScript)
        - Project Context: {context} (e.g., models, views, static/css, static/js, templates, etc.)
        - Project Idea: {refined_prompt}
        - Full Folder Structure: {tree}

        Requirements:
        - Follow Django best practices relevant to the file type
        - Include only necessary imports or links
        - Use docstrings and inline comments for clarity where applicable

        For Python files:
        - Add type hints
        - Keep code clean, modular, and maintainable

        For HTML template files:
        - Use Django template inheritance where applicable
        - Write clean, semantic HTML
        - Avoid inline javaScript
        - Use Django template tags and filters as needed

        For CSS files:
        - Write modular, reusable styles
        - Follow BEM or other naming conventions if applicable
        - Ensure responsive design if relevant

        For JavaScript files:
        - Write clean, modular code
        - Use unobtrusive JavaScript practices (no inline JS in templates)
        - Include comments for clarity

        Output:
        - Return only the raw code as it would appear in the file (no markdown or extra formatting)
    """
    
    response = genai.GenerativeModel("gemini-2.5-flash-preview-05-20").generate_content(
        contents=prompt
    )

    # metadata = generate_file_metadata(context, filepath, refined_prompt, tree, json_file_name, response.text)
    
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
    You are an expert Django code reviewer.

    You are reviewing the coupling accuracy of a Django file by comparing:
    1. The actual imports and logical usage in the file.
    2. The declared `couples_with` list in the project's metadata.
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
    - Analyze the file’s actual imports, class/function references, and cross-app/module usage.
    - Compare that to the declared couplings in the metadata (`couples_with`).
    - Then compare both with the dependencies inferred via static analysis (`actual_dependencies`).
    - If you find discrepancies, please describe the issue and suggest corrections.
    - Determine if:
    1. All couplings in the code are properly captured in the metadata.
    2. There are any incorrect, missing, or extra entries in the metadata.
    3. Any syntactical or logical errors in the file that prevent it from running correctly.

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
    "changes_needed": "The file imports `from events.views import EventCreateView` but `events.views` is missing in the declared metadata. Also, metadata lists `core.utils` but it is not used anywhere in the file."
    }}
    """
    resp = genai.GenerativeModel("gemini-2.5-pro-preview-05-06").generate_content(
        contents = prompt
    )


    # resp = """
    #     ```json
    # {
    # "correctness": "correct",
    # "changes_needed": ""
    # }
    # ```"""

    cleaned_response = resp.text.strip('`').replace('json\n', '').strip()
    # data = json.loads(cleaned_response)
    try:
        data = json.loads(cleaned_response)
        correctness = data["correctness"]
        changes_needed = data["changes_needed"]
        return correctness, changes_needed
    except json.JSONDecodeError:
        return "undetermined", f"Could not parse response: {resp.text}. Please check the model's output format."
    

def validate_imports_exist(file_path: str, content: str, project_files: set):
    invalid_imports = []

    try:
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom):
                if node.module:
                    module_parts = node.module.split('.')
                    potential_file = os.path.join(*module_parts) + '.py'

                    if potential_file not in project_files:
                        invalid_imports.append(f"Import '{node.module}' in {file_path} does not exist in the project files.")

            elif isinstance(node, ast.Import):
                for alias in node.names:
                    module_parts = alias.name.split('.')
                    potential_file = os.path.join(*module_parts) + '.py'

                    if potential_file not in project_files and not alias.name.startswith('django'):
                        invalid_imports.append(f"Import {alias.name}")

    except SyntaxError as e:
        pass

    return invalid_imports

def get_project_files(metadata_dict, project_name) -> set:
    project_files = set()
    for entry in metadata_dict.get(project_name, []):
        if entry["path"].endswith('.py'):
            rel_path = os.path.relpath(entry["path"], project_name)
            project_files.add(rel_path)
    return project_files

def valid_django_naeming_conventions(code, file_apth):
    issues = []

    django_patterns = {
        'views.py': {
            'class_suffix': ['View', 'ListView', 'DetailView', 'CreateView', 'UpdateView', 'DeleteView'],
            'function_prefix': ['get_', 'post_', 'put_', 'delete_']
        },
        'models.py': {
            'class_suffix': ['Model'],
            'field_patterns': ['CharField', 'IntegerField', 'DateTimeField']
        },
        'forms.py': {
            'class_suffix': ['Form', 'ModelForm']
        }
    }
    
    try:
        tree = ast.parse(code)
        file_type = os.path.basename(file_apth)
        
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                class_name = node.name
                
                if file_type == 'views.py':
                    if 'updateview' in class_name.lower() and not class_name.endswith('UpdateView'):
                        issues.append(f"Malformed view name: {class_name} should probably be {class_name.replace('updateview', 'UpdateView').replace('goalupdate', 'GoalUpdate')}")
                    
                    elif 'createview' in class_name.lower() and not class_name.endswith('CreateView'):
                        issues.append(f"Malformed view name: {class_name} should probably be {class_name.replace('createview', 'CreateView')}")
                    
                    elif 'listview' in class_name.lower() and not class_name.endswith('ListView'):
                        issues.append(f"Malformed view name: {class_name} should probably be {class_name.replace('listview', 'ListView')}")
                
                if file_type == 'models.py' and not any(base.id == 'Model' for base in node.bases if isinstance(base, ast.Name)):
                    issues.append(f"Model class {class_name} should inherit from models.Model")
    
    except SyntaxError as e:
        issues.append(f"Syntax error in file: {e}")
    
    return issues
                                               
def refine_for_the_change_in_file(file_content, changes_needed):
    prompt = f"""
    You are an expert Django developer.

    Your task is to correct the following Django project file so that its **imports and references** properly match the declared couplings and dependency expectations, based on feedback from a static analysis and metadata validation.

    ---

    **Original File Content**:
    {file_content}

    ---

    **Correction Feedback**:
    {changes_needed}

    ---

    **Requirements**:
    - Fix **only the issues mentioned in the Correction Feedback** — including:
        - Missing or incorrect imports.
        - Imports of non-existent files or modules — these should be removed.
        - Typographical errors in import statements or class/function names.
        - Syntactical errors in the file that prevent it from running correctly.
    - Ensure that all imports and references are logically correct and semantically aligned with the metadata.
    - If an import is missing, **add it**.
    - If an import is incorrect, **correct it**.
    - If an import is redundant or not used, **remove it**.
    - If an import references a file/module that does not exist in the project, **remove or replace it** as appropriate.
    - Do **not**:
        - Add any new functionality unrelated to the correction.
        - Modify logic outside of the specified corrections.
        - Introduce any new features or classes beyond what's mentioned.
    - Maintain original indentation, code structure, and Django best practices.

    ---

    **Output Format**:
    - Return the corrected file content as raw Python code.
    - No markdown, no comments, no extra text.

    ---

    **Reminder**: Be conservative and minimal. Fix only what’s necessary to make the file **logically correct and semantically aligned with the metadata**.
    """

    response = genai.GenerativeModel("gemini-2.5-flash-preview-05-20").generate_content(
        contents=prompt
    )

    return response.text

def dfs_feedback_loop(
    root: TreeNode,
    tree_structure: str,
    project_name: str,
    current_path: str = "",
    metadata_dict: dict = None,
    dependency_analyzer: DepenedencyAnalyzer = None,
    is_top_level: bool = True
):
    """
    Traverse the tree and check file contents against metadata
    """
    if root is None or metadata_dict is None:
        return
    
    project_files = get_project_files(metadata_dict=metadata_dict, project_name=project_name)

    clean_name = root.value.split('#')[0].strip()
    clean_name = clean_name.replace('(', '').replace(')', '')
    clean_name = clean_name.replace('uploads will go here, e.g., ', '')

    # Build the full path
    if is_top_level:
        full_path = os.path.join(project_name, clean_name)
    else:
        full_path = os.path.join(current_path, clean_name)

    if root.is_file:
        # Initialize content as None
        actual_dependencies = dependency_analyzer.get_dependencies(full_path) if dependency_analyzer else []
        file_metadata = next((entry for entry in metadata_dict[project_name] if entry["path"] == full_path), None)

        content = None
        
        try:
            if os.path.isfile(full_path):
                with open(full_path, 'r') as f:
                    content = f.read()
            else:
                print(f"Not a file: {full_path}")
                return
        except FileNotFoundError:
            print(f"File not found: {full_path}")
            return
        except Exception as e:
            print(f"Error reading file {full_path}: {e}")
            return

        if content is not None and file_metadata is not None:
            
            correctness, changes_needed = check_file_coupleness(
                metadata_dict = file_metadata,
                file_content=content,
                file_path=full_path,
                actual_dependencies=actual_dependencies
            )

            invalid_imports = validate_imports_exist(file_path=full_path, content=content, project_files=project_files)

            naming_issues = valid_django_naeming_conventions(code=content, file_apth=full_path)



            if correctness == "correct" or correctness == "undetermined":
                if(correctness == "undetermined"):
                    print(f"Could not determine correctness for {full_path}. Manual review needed. Changes needed: {changes_needed}")
                else:
                    print(f"No changes needed for {full_path}")
            elif correctness == "incorrect":
                print(f"File {full_path} is incorrect. Changes needed: {changes_needed}")
                if invalid_imports:
                    changes_needed += f"Invalid imports found in {full_path}: {invalid_imports}"
                    print(f"Invalid imports found in {full_path}: {invalid_imports}")
                if naming_issues:
                    changes_needed += f"Naming issues found in {full_path}: {naming_issues}"
                    print(f"Naming issues found in {full_path}: {naming_issues}")
                refined_content = refine_for_the_change_in_file(   
                    content,
                    changes_needed
                )
                try:
                    with open(full_path, 'w') as f:
                        f.write(refined_content)

                    if dependency_analyzer:
                        dependency_analyzer.add_file(full_path, content=refined_content)
                    
                    if project_name in metadata_dict:
                        for entry in metadata_dict[project_name]:
                            if entry["path"] == full_path:
                                entry["description"] = refined_content
                                break
                    
                    print(f"Updated file {full_path} based on feedback - {changes_needed}")
                except Exception as e:
                    print(f"Error updating file {full_path}: {e}")
 
    else:
        for child in root.children:
            dfs_feedback_loop(
                root=child,
                tree_structure=tree_structure,
                project_name=project_name,
                current_path=full_path,
                metadata_dict=metadata_dict,
                is_top_level=False
            )

def generate_tree(resp: str, project_name: str = "root") -> TreeNode:
    content = resp.strip().replace('```', '').strip()
    lines = content.split('\n')
    stack = []
    root = TreeNode(project_name)

    for line in lines:
        if not line.strip():
            continue

        indent = 0
        temp_line = line

        # Count indentations based on common formatting
        while temp_line.startswith('│   ') or temp_line.startswith('    ') or temp_line.startswith('│ ') or temp_line.startswith('    '):
            temp_line = temp_line[4:]
            indent += 1

        # Clean the line to get just the name
        name = line.strip()
        if '#' in name:
            name = name.split('#')[0].strip()
        name = name.replace('│', '').replace('├──', '').replace('└──', '').strip()

        if not name or name == project_name:
            continue

        node = TreeNode(name)

        if indent == 0:
            root.add_child(node)
            stack = [root, node]
        else:
            while len(stack) > indent + 1:
                stack.pop()

            if stack:
                stack[-1].add_child(node)
            stack.append(node)

    # Mark files vs directories
    def mark_files_and_dirs(node: TreeNode):
        if not node.children:
            node.is_file = True
        else:
            node.is_file = False
            for child in node.children:
                mark_files_and_dirs(child)

    mark_files_and_dirs(root)
    return root


def extract_project_name(prompt: str) -> str:
    match = re.search(r'^Project\s+name\s*:\s*([a-zA-Z0-9_\-]+)', prompt, re.IGNORECASE | re.MULTILINE)
    if match:
        return match.group(1)
    else:
        return "default_project_name"

prompt = """
Build a Transport Management System Web Application with the following modules and functionalities:

1. Master Module:
    Create a module to maintain details of unorganized transporters.
    When a new transporter is added:
    Auto-generate a unique login ID and password.
    These credentials should allow the transporter to log in to their portal.
2. Transporter Portal:
    Once logged in, the transporter should be able to:
    View all consignments assigned to them.
    Update consignment status (e.g., In Transit, Delivered, Delayed, No Status).
    Upload POD (Proof of Delivery) as an image.
    Enter delivery details, including delivery date and remarks.
3. Dashboard & Reporting (for Admin):
    A graphical dashboard showing:
        Total consignments
        Delivered
        In Transit
        No Status
    A count of consignments by status.
    For delivered consignments:
        Count how many were:
            Delivered on time
            1–3 days delayed
            4–6 days delayed
            More than 6 days delayed
        Count of delivered consignments with and without POD images.
    Provide the ability to:
        View, filter, and export detailed reports.
        Download data in Excel/PDF format.
"""
refined_prompt = refine_prompt(prompt)
print(refined_prompt)
project_name =extract_project_name(refined_prompt)
# for line in lines:
#     if "Project Name:" in line:
#         project_name = line.split("Project Name:")[-1].strip()
#         break
#     else:
#         project_name = prompt

print(project_name)
response = generate_folder_struct(refined_prompt)
print(response)
folder_tree = generate_tree(response, project_name)
print(folder_tree.print_tree())
# cont = response.strip().replace('```', '').strip()
# lines = cont.split('\n')
# if lines:
#     project_name = lines[0].strip()
#     print(f"Project Name: {project_name}")\
dependency_analyzer = DepenedencyAnalyzer()
json_file_name = "projects_metadata.json"
metadata_dict = {project_name: []}

output_dir = os.path.dirname(json_file_name)
if output_dir:
    os.makedirs(output_dir, exist_ok=True)

# with open(json_file_name, 'w', encoding='utf-8') as f:
#     json.dump(empty_data, f, indent=4)

# # # dfs_tree_and_gen(folder_tree, refined_prompt, response, "", "", json_file_name, project_name=project_name,)
dfs_tree_and_gen(root=folder_tree, refined_prompt=refined_prompt, tree_structure=response, project_name=project_name, current_path="", parent_context="", json_file_name=json_file_name, metadata_dict=metadata_dict, dependency_analyzer=dependency_analyzer)

dependency_analyzer.visualize_graph()

for entry in metadata_dict[project_name]:
    path = entry["path"]
    entry["couples_with"] = dependency_analyzer.get_dependencies(entry["path"])

with open(json_file_name, 'w') as f:
    json.dump(metadata_dict, f, indent=4)


dfs_feedback_loop(folder_tree, response, project_name, current_path="", metadata_dict=metadata_dict, dependency_analyzer=dependency_analyzer, is_top_level=True)

with open(json_file_name, 'w') as f:
    json.dump(metadata_dict, f, indent=4)

# def dummy_check_json_resp():
#     resp = """```json
#     {
#     "correctness": "correct",
#     "changes_needed": ""
#     }
#     ```"""

#     cleaned_response = resp.strip('`').replace('json\n', '').strip()
#     data = json.loads(cleaned_response)
#     correctness = data["correctness"]
#     changes_needed = data["changes_needed"]
#     return correctness, changes_needed

# correctness, changes_needed = dummy_check_json_resp()
# print(f"Correctness: {correctness}")
# print(f"Changes Needed: {changes_needed}")
print("Happa... done, pothum da")

# with open("Event/Event/core/models.py", 'r') as f:
#     content = f.read()
# print(content)