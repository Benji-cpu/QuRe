import os

def generate_tree_recursive(start_path, output_file, exclude_dirs, indent=""):
    """
    Recursively generates a textual file tree representation for a given path.

    Args:
        start_path (str): The directory to scan.
        output_file (file object): The file to write the output to.
        exclude_dirs (list): List of directory basenames to exclude.
        indent (str): The current indentation string for formatting.
    """
    # Print the current directory name
    output_file.write(f"{indent}{os.path.basename(start_path)}/\n")
    child_indent = indent + "    "

    try:
        entries = sorted(os.listdir(start_path))
    except OSError as e:
        output_file.write(f"{child_indent} [Error reading directory: {e}]\n")
        return

    dirs_to_scan = []
    files_to_print = []

    for entry in entries:
        full_path = os.path.join(start_path, entry)
        base_name = os.path.basename(entry)

        # Skip excluded directories/files
        if base_name in exclude_dirs:
            continue

        if os.path.isdir(full_path):
            dirs_to_scan.append(full_path)
        elif os.path.isfile(full_path):
            files_to_print.append(base_name)

    # Recursively scan subdirectories first
    for dir_path in dirs_to_scan:
        generate_tree_recursive(dir_path, output_file, exclude_dirs, child_indent)

    # Print files in the current directory
    for file_name in files_to_print:
        output_file.write(f"{child_indent}{file_name}\n")

if __name__ == "__main__":
    # The script is run from 'QuRe v4', but the target content is inside 'QuRe'
    content_root = "QuRe"
    output_filename = "FILE_TREE.txt"
    # Directories to specifically include relative to content_root
    include = ["app", "assets", "components", "hooks", "scripts"]
    # Directories/files to exclude at *any* level
    exclude = [".expo", "node_modules", ".git", "__pycache__", ".DS_Store"]

    # Get the name of the directory we are actually scanning
    project_root_name = os.path.basename(os.path.abspath(content_root))

    # Check if the content root exists
    if not os.path.isdir(content_root):
        print(f"Error: Content root directory '{content_root}' not found.")
        exit(1)

    with open(output_filename, "w") as f:
        f.write(f"{project_root_name}/\n")
        base_indent = "    "

        # Collect items to process
        items_in_root = sorted(os.listdir(content_root))
        root_files_to_print = []

        # First pass: Process included directories recursively
        for item in items_in_root:
            item_path = os.path.join(content_root, item)
            # Check if it's a directory and in our include list
            if os.path.isdir(item_path) and item in include:
                # Check if it's not also in the global exclude list
                if item not in exclude:
                    generate_tree_recursive(item_path, f, exclude, base_indent)
            # Check if it's a file in the root directory
            elif os.path.isfile(item_path):
                 # Check if it's not in the exclude list
                 if item not in exclude:
                     root_files_to_print.append(item)

        # Second pass: Print files found directly in the root
        for file_name in root_files_to_print:
            f.write(f"{base_indent}{file_name}\n")

    print(f"File tree generated and saved to {output_filename}") 