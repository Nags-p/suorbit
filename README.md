# SuOrbit - Technology, AI, Space & Startup News Simplified

SuOrbit is a modern, AI-assisted news aggregation platform that runs entirely as a static website on GitHub Pages. It gathers news from NewsAPI across six categories (Technology, Artificial Intelligence, Space, Science, Startups, and Business), extracts core findings, processes summaries, and publishes the results as static JSON database files using GitHub Actions.

The frontend is built using **Vanilla HTML5, CSS3, and JavaScript**, ensuring infinite scalability, zero server hosting costs, absolute security, and blazing-fast loading speeds.

## Key Features

*   **Serverless Architecture**: No databases (MySQL, MongoDB) or server runtimes. Data is loaded dynamically via fast, static JSON files.
*   **Aesthetic Typography & Layout**: Bold editorial design inspired by *The Verge* and *Wired*, using Google Fonts (`Playfair Display` & `Plus Jakarta Sans`).
*   **Fully Responsive & Accessible**: Mobile-first fluid scaling with CSS Grid and accessible markup.
*   **Dual Color Themes**: Smooth transition light and dark modes with system/user overrides cached in `localStorage`.
*   **Client-side Search Engine**: Full keyword, title, tag, and category search index matching with query marking and pagination.
*   **AI Summary & Key Takeaways**: Displays automated synthesis models for all cataloged entries.
*   **Breaking News Headline Ticker**: Top headlines feed rotating at the sub-header.
*   **Zero Loading Dependencies**: Built using zero frameworks (no React, Next.js, or Tailwind CSS) for maximum Lighthouse performance.
*   **SEO Pre-optimized**: Built-in Open Graph metadata, Twitter cards, custom `robots.txt`, dynamic JSON-LD structural schema, and `sitemap.xml`.

## Directory Structure

```
/
├── index.html           # Homepage
├── article.html         # Dynamic Article Reader
├── category.html        # Category Feed Page
├── search.html          # Search & Filtering Page
├── about.html           # About editorial page
├── contact.html         # Contact form with validation
├── privacy.html         # Privacy Statement
├── terms.html           # Terms of Service
├── 404.html             # Custom error route
├── robots.txt           # Crawler configuration
├── sitemap.xml          # Sitemap index
│
├── assets/
│   ├── css/
│   │   └── style.css    # Unified variables, layouts, theme transitions
│   └── js/
│       ├── main.js      # Global navigation, dark mode, marquee ticker controls
│       ├── home.js      # Hero, trending sidebar, paginated homepage grids
│       ├── article.js   # Dynamic article load, progress bar, share bindings
│       ├── category.js  # Category list loader and paginator
│       └── search.js    # Multi-term query matching and text highlighting
│
├── data/
│   ├── news.json        # Main combined database (top 80 stories)
│   ├── technology.json  # Category database files
│   ├── ai.json
│   ├── space.json
│   ├── science.json
│   ├── startups.json
│   └── business.json
│
├── scripts/
│   └── fetch-news.js    # Data harvester (Node.js API client & Mock generator)
│
└── .github/
    └── workflows/
        └── news-update.yml # Hourly automated run and commit workflow
```

---

## Local Development Setup

To test and browse SuOrbit locally:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/suorbit.git
    cd suorbit
    ```

2.  **Start a local development server**:
    Since the website loads static JSON data dynamically using standard Javascript `fetch` API, browsers block requests from direct file paths (`file:///index.html`) due to CORS security rules. You must run a simple local web server:
    *   **Node.js**:
        ```bash
        npx serve .
        # Or install globally: npm install -g serve && serve
        ```
    *   **Python**:
        ```bash
        python -m http.server 8000
        ```
    *   **VS Code**: Open the project and use the **Live Server** extension.

3.  **Browse the site**:
    Open `http://localhost:3000` (or `http://localhost:8000` if using Python) in your browser. The mock articles database will populate the layout automatically!

---

## GitHub Secrets Configuration Guide

The hourly update script retrieves article records from NewsAPI and writes human-sounding articles using the Gemini API. To run this integration securely in GitHub Actions:

1.  **Get a NewsAPI Key**:
    Register for a free developer key at [https://newsapi.org](https://newsapi.org).

2.  **Get a Gemini API Key**:
    Create a free API key at [Google AI Studio](https://aistudio.google.com).

3.  **Navigate to GitHub Settings**:
    Go to your GitHub repository page -> **Settings** tab.

4.  **Access Secrets Panel**:
    On the left sidebar, expand **Secrets and variables** and click **Actions**.

5.  **Create Secrets**:
    *   Click **New repository secret**.
    *   Set the **Name** to: `NEWS_API_KEY` and the **Value** to your NewsAPI Key. Click **Add secret**.
    *   Click **New repository secret** again.
    *   Set the **Name** to: `GEMINI_API_KEY` and the **Value** to your Gemini API Key. Click **Add secret**.

*Note: Environment variables are case-sensitive and must match exactly.*

---

## Deployment Guide (GitHub Pages)

Deploying SuOrbit to GitHub Pages takes less than two minutes:

1.  **Commit and Push Code**:
    Push your codebase to your GitHub repository on the `main` branch.

2.  **Configure GitHub Pages**:
    *   Go to repository **Settings** -> **Pages** (on the left menu under Code and automation).
    *   Under **Build and deployment** -> **Source**, make sure **Deploy from a branch** is selected.
    *   Under **Branch**, select `main` and directory `/ (root)`.
    *   Click **Save**.

3.  **Enable Workflow Write Permissions** (Required for the automated updater to commit data files back to the repository):
    *   Go to repository **Settings** -> **Actions** -> **General** (under Code and automation).
    *   Scroll down to the bottom section called **Workflow permissions**.
    *   Select **Read and write permissions**.
    *   Click **Save**.

4.  **Run the Initial Fetch Manually**:
    *   Go to the **Actions** tab of your repository.
    *   On the left sidebar, click **SuOrbit Automated News Update**.
    *   Click the **Run workflow** dropdown on the right, select the `main` branch, and click the green **Run workflow** button.
    *   This will immediately query NewsAPI, write the news database files inside `data/`, commit them to your repository, and trigger the GitHub Pages deployment.

Your site will be online at: `https://your-username.github.io/suorbit/`
