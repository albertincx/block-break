import os
import re
import base64
import mimetypes
import datetime
import shutil

# Configuration
INPUT_FILE = 'index.html'
OUTPUT_DIR = 'dist'
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'index.html')
MANIFEST_FILE = 'manifest.json'

def generate_build_id():
    now = datetime.datetime.now()
    return now.strftime("%d%m%y%H%M") # e.g., 2501261230

def get_base64_content(file_path):
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = 'application/octet-stream'
        
    with open(file_path, 'rb') as f:
        data = f.read()
        encoded = base64.b64encode(data).decode('utf-8')
        return f"data:{mime_type};base64,{encoded}"

def inject_version(content, build_id):
    # 1. Update BUILD constant in JS
    content = re.sub(r'const BUILD = "[^"]+";', f'const BUILD = "{build_id}";', content)
    
    # 2. Update meta tags or visible text in HTML (build XXXXXX)
    content = re.sub(r'\(build \d+\)', f'(build {build_id})', content)
    
    # 3. Update comments like <!-- Build: v.1.2.0 (XXXXXX) -->
    content = re.sub(r'\(build \d+\)', f'(build {build_id})', content, flags=re.IGNORECASE)
    
    return content

def embed_css(html_content):
    def replace_css(match):
        href = match.group(1).split('?')[0] # Remove query params
        if os.path.exists(href):
            with open(href, 'r') as f:
                css_content = f.read()
            return f'<style>\n{css_content}\n</style>'
        return match.group(0)
    
    return re.sub(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>', replace_css, html_content)

def embed_js(html_content, build_id):
    # Pre-calculate base64 for images used in JS
    img_replacements = {}
    if os.path.exists('img'):
        for img_file in os.listdir('img'):
            if img_file.endswith(('.svg', '.png', '.jpg')):
                path = os.path.join('img', img_file)
                img_replacements[path] = get_base64_content(path)

    def replace_js(match):
        src = match.group(1).split('?')[0]
        if os.path.exists(src):
            with open(src, 'r') as f:
                js_content = f.read()
            
            # Inject build ID into JS content
            js_content = inject_version(js_content, build_id)
            
            # Special handling for JS files that reference images
            for img_path, img_data in img_replacements.items():
                js_content = js_content.replace(f'"{img_path}"', f'"{img_data}"')
                js_content = js_content.replace(f"'{img_path}'", f"'{img_data}'")
                
            return f'<script>\n{js_content}\n</script>'
        return match.group(0)

    return re.sub(r'<script[^>]+src="([^"]+)"[^>]*></script>', replace_js, html_content)

def embed_images(html_content):
    def replace_img(match):
        src = match.group(1)
        if os.path.exists(src):
            return f'src="{get_base64_content(src)}"'
        return match.group(0)
    
    # Replace src="..."
    html_content = re.sub(r'src="([^"]+\.(?:png|jpg|jpeg|svg|gif))"', replace_img, html_content)
    
    # Replace href="..." (for favicons)
    def replace_href(match):
        href = match.group(1)
        if os.path.exists(href) and href.endswith(('.png', '.ico', '.svg')):
             return f'href="{get_base64_content(href)}"'
        return match.group(0)

    html_content = re.sub(r'href="([^"]+\.(?:png|ico|svg))"', replace_href, html_content)
    
    return html_content

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    build_id = generate_build_id()
    print(f"Generated Build ID: {build_id}")

    with open(INPUT_FILE, 'r') as f:
        html_content = f.read()

    # Inject version into HTML strings first
    html_content = inject_version(html_content, build_id)

    print("Embedding CSS...")
    html_content = embed_css(html_content)

    print("Embedding JS...")
    html_content = embed_js(html_content, build_id)

    print("Embedding Images...")
    html_content = embed_images(html_content)

    print(f"Writing to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w') as f:
        f.write(html_content)

    # Copy manifest.json to dist directory
    if os.path.exists(MANIFEST_FILE):
        manifest_output_path = os.path.join(OUTPUT_DIR, MANIFEST_FILE)
        shutil.copy(MANIFEST_FILE, manifest_output_path)
        print(f"Copied {MANIFEST_FILE} to {manifest_output_path}")

    print("Done!")

if __name__ == '__main__':
    main()
