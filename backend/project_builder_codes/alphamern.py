import google.generativeai as genai
import re
import networkx as nx
from typing import List, Set
import ast 
import os 
import json



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
