# Open Academic Editor | PubCraft

A **Progressive Web App (PWA)** for writing and previewing research articles with real-time Markdown rendering, ORCID authentication, GitHub integration, and offline support.

## ✨ Overview

Scholarly Editor is a modern writing platform for academics and researchers featuring:

- 🔤 **Live Markdown Preview**
- 🪪 **ORCID OAuth Login**
- 🐙 **GitHub Integration**
- 📦 **Offline Support with PWA**
- 📝 **Metadata Input for Papers**
- 💾 **Auto-save via LocalStorage**

## ⚙️ Technology Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui**
- **Authentication**: ORCID & GitHub (OAuth 2.0)
- **Storage**: GitHub API & localStorage
- **Deployment**: Docker, Coolify, Vercel, Netlify

---

## 🛠 Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/scholarly-editor.git
cd scholarly-editor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure `.env`

Create and edit your `.env` file:

```bash
cp .env.template .env
```

```env
# GitHub OAuth
VITE_GITHUB_CLIENT_ID=         # GitHub App Client ID
VITE_GITHUB_CLIENT_SECRET=     # GitHub App Client Secret
VITE_GITHUB_TOKEN_URL=         # GitHub Token Endpoint URL

# ORCID OAuth
VITE_ORCID_CLIENT_ID=          # ORCID Client ID (for production)
VITE_ORCID_SANDBOX_CLIENT_ID=  # ORCID Sandbox Client ID (for testing)
VITE_ORCID_SANDBOX_URL=        # ORCID Sandbox OAuth base URL
VITE_ORCID_PRODUCTION_URL=     # ORCID Production OAuth base URL
VITE_ORCID_TOKEN_URL=          # ORCID OAuth Token URL
VITE_ORCID_API_URL=            # ORCID API Base URL
VITE_ORCID_REDIRECT_URI=       # Callback URI (e.g., http://localhost:8080/auth/callback)
VITE_ORCID_SCOPE=              # OAuth scope (e.g., /authenticate)
```

🧠 **Note**: We dynamically sideload environment variables at **runtime** via `entrypoint.sh`, not at build time. Changing `.env` also updates the runtime config—make sure `entrypoint.sh` reflects this!

---

## 🧪 Local Development

Start the development server:

```bash
npm run dev
```

The app runs at: [http://localhost:8080](http://localhost:8080)

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
docker compose up -d
```

### Recommended: Coolify Deployment

Use `docker-compose-coolify.yml` for easy deployment on [Coolify](https://coolify.io):

```bash
docker compose -f docker-compose-coolify.yml up -d
```

### Custom Docker Build

```bash
docker build -t scholarly-editor .
docker run -d \
  --name scholarly-editor \
  -p 8080:8080 \
  --env-file .env \
  scholarly-editor
```

---

## 🔧 Authentication Setup

### ORCID

1. Register your app at [ORCID Developer Tools](https://orcid.org/developer-tools)
2. Use `http://localhost:8080/auth/callback` as the redirect URI for local dev
3. Add your credentials to `.env` (see vars above)

### GitHub (Optional)

1. Create a GitHub OAuth App
2. Set the redirect URI to: `http://localhost:8080/auth/github/callback`
3. Fill in GitHub-related values in `.env`

---

## 🗂 Project Structure

```
scholarly-editor/
├── .github/               # GitHub Actions workflows
├── public/                # Static assets, PWA manifest, service worker
├── src/                   # React source code
│   ├── components/        # UI components
│   ├── contexts/          # Global context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # App pages
│   ├── utils/             # Utility functions
│   └── lib/               # Auth, GitHub, ORCID logic
├── .env.template          # Example environment config
├── Dockerfile             # Docker image config
├── docker-compose.yml     # Default Docker Compose
├── docker-compose-coolify.yml # Coolify deployment config
└── entrypoint.sh          # Runtime environment loader
```

---

## 🚀 Deployment Options

- **Coolify** (recommended): with `docker-compose-coolify.yml`
- **Docker Hub**: `lamuri/pubcraft-editor:latest`
- **Vercel**:
  ```bash
  npm install -g vercel
  vercel
  ```
- **Netlify**:
  ```bash
  npm run build
  # Upload `dist/` to Netlify
  ```

---

## 🔁 CI/CD (GitHub Actions)

- 🔧 Docker builds on PRs, pushes, and tags
- 🧪 Multi-platform support (AMD64 & ARM64)
- 🔐 Auto vulnerability scans with Docker Scout

---

## 🧰 Useful Commands

- `npm run dev` – Development server
- `npm run build` – Build production bundle
- `npm run preview` – Preview built app
- `npm run lint` – Run ESLint
- `npm run type-check` – Run TypeScript type checks

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push and open a PR

---

## 🆘 Support

- Check [Issues](../../issues)
- Open a new issue with clear steps
- Contact the maintainers

---

## 📄 License

MIT © [Lovable](https://lovable.dev)

---

## 🔗 Resources

- [ORCID Documentation](https://info.orcid.org/documentation/)
- [GitHub API](https://docs.github.com/en/rest)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://reactjs.org/)
- [Docker Hub - PubCraft](https://hub.docker.com/r/lamuri/pubcraft-editor)
