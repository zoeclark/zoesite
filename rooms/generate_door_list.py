import os
import glob
import re

# Base directory of the script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Paths
door_dir = os.path.join(script_dir, "door_imgs")
output_js_path = os.path.join(script_dir, "doorImages.js")
relative_base = os.path.join(script_dir)  # Paths will be relative to 'rooms' when copied there

# Get image files
image_files = glob.glob(os.path.join(door_dir, "*.jp*g"))  # Matches .jpg and .jpeg

# Sort naturally
def natural_key(filename):
    return [int(text) if text.isdigit() else text for text in re.split(r'(\d+)', filename)]

image_files.sort(key=natural_key)

# Make paths relative to the rooms/ directory
relative_paths = [os.path.relpath(f, relative_base) for f in image_files]

# Write JS file
with open(output_js_path, "w") as f:
    f.write("const doorImages = [\n")
    for path in relative_paths:
        f.write(f"  \"{path}\",\n")
    f.write("];\n")

print(f"✅ Generated doorImages.js with {len(relative_paths)} images.")