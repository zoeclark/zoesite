import os
import re

script_dir = os.path.dirname(os.path.abspath(__file__))
all_dirs = [d for d in os.listdir(script_dir) if os.path.isdir(os.path.join(script_dir, d))]

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower()
            for text in re.split(r'(\d+)', s)]

for d in sorted(all_dirs):
    full_path = os.path.join(script_dir, d)
    image_dir = os.path.join(full_path, "images")

    # Skip folders without an images subdirectory
    if not os.path.exists(image_dir):
        continue

    # Warn and skip if the folder doesn't start with "room"
    if not d.startswith("room"):
        print(f"⚠️ Skipping '{d}': folder has 'images' but does not start with 'room'")
        continue

    # Build variable name and image list
    var_name = f"{d}images"
    image_files = sorted([
        f for f in os.listdir(image_dir)
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))
    ], key=natural_sort_key)
    image_paths = [f"images/{f}" for f in image_files]

    output_js = f"const {var_name} = [\n"
    output_js += ",\n".join(f'  "{path}"' for path in image_paths)
    output_js += "\n];\n"

    output_path = os.path.join(full_path, f"{d}_imageList.js")
    with open(output_path, "w") as f:
        f.write(output_js)
        print(f"✅ Wrote image list to {output_path}")
    
    


