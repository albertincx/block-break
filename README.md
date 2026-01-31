# Block Break

A clone of Block Blast - a fun puzzle game where you place blocks on the grid to fill rows and columns.

## Features

- Classic block placement gameplay
- Multiple game modes (Classic and 99)
- Combo system for consecutive clears
- Lives system
- High score tracking
- Dark/light mode support
- Mobile-friendly with touch controls and joysticks

## GitHub Pages Deployment

This project is automatically deployed to GitHub Pages. Every push to the `main` branch triggers a build and deployment.

### How to Enable GitHub Pages for Your Fork

1. Push this code to your GitHub repository
2. Go to your repository settings
3. Scroll down to the "Pages" section
4. Under "Source", select "GitHub Actions"
5. The site will be published automatically after the next push to `main`

The site will be available at: `https://yourusername.github.io/repository-name`

### Local Development

To build the project locally:

```bash
# Install dependencies
npm install

# Build Tailwind CSS
npm run build

# Create the single HTML file with embedded resources
python build.py
```

The built file will be available in the `dist/index.html` and can be opened directly in a browser.

## Contributing

Feel free to submit issues and enhancement requests!
