
# Scholarly Editor

A Progressive Web Application (PWA) for writing and previewing research articles with live Markdown rendering, ORCID authentication, and GitHub integration.

## 🎯 What is this?

Scholarly Editor is a modern web-based writing platform designed specifically for researchers and academics. It provides:

- **Live Markdown Preview**: Write in Markdown and see your formatted article in real-time
- **ORCID Authentication**: Secure login using your ORCID identifier
- **GitHub Integration**: Save your work directly to GitHub repositories and create pull requests
- **Offline Support**: Continue writing even without internet connection with automatic sync when reconnected
- **PWA Features**: Install as a desktop/mobile app with offline capabilities
- **Metadata Management**: Structured metadata entry for academic papers (title, author, abstract)

## 🚀 Features

- ✅ Real-time Markdown editor with live preview
- ✅ ORCID OAuth integration for researcher authentication
- ✅ GitHub repository integration for version control and collaboration
- ✅ Progressive Web App with offline support
- ✅ Auto-save functionality with local storage
- ✅ Responsive design for desktop and mobile
- ✅ Service worker for offline caching
- ✅ Installable on desktop and mobile devices

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: ORCID OAuth 2.0
- **Storage**: localStorage, GitHub API
- **PWA**: Service Worker, Web App Manifest
- **Build**: Vite, Node.js

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

## 🏃‍♂️ Local Development Setup

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd scholarly-editor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp .env.template .env
```

Edit the `.env` file and update the following variables:

```env
# Required: ORCID Client ID
ORCID_CLIENT_ID=APP-SCMLFEP77XSZI9FJ

# Optional: GitHub OAuth (for enhanced GitHub integration)
# GITHUB_CLIENT_ID=your_github_client_id_here
# GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### 5. Build for Production

```bash
npm run build
```

### 6. Preview Production Build

```bash
npm run preview
```

## 🐳 Docker Deployment

### Option 1: Using Pre-built Image (Recommended)

1. **Quick deployment with Docker Compose:**
```bash
cp .env.template .env
# Edit .env with your configuration
docker-compose up -d
```

2. **Production deployment with nginx:**
```bash
docker-compose --profile production up -d
```

### Option 2: Building Locally

1. **Build the image:**
```bash
docker build -t scholarly-editor .
```

2. **Run the container:**
```bash
docker run -d \
  --name scholarly-editor \
  -p 8080:8080 \
  --env-file .env \
  scholarly-editor
```

## 🔧 Configuration

### ORCID Setup

1. Register your application at [ORCID Developer Tools](https://orcid.org/developer-tools)
2. Add your redirect URI: `http://localhost:8080/auth/callback` (for development)
3. Copy your Client ID to the `.env` file

### GitHub Integration (Optional)

1. Create a GitHub OAuth App in your GitHub Developer Settings
2. Set Authorization callback URL to: `http://localhost:8080/auth/github/callback`
3. Add your Client ID and Secret to the `.env` file

## 📁 Project Structure

```
scholarly-editor/
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
├── public/
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
├── src/
│   ├── components/          # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Page components
│   ├── utils/              # Utility functions
│   └── lib/                # Library configurations
├── .env.template           # Environment template
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # This file
```

## 🚀 Deployment Options

### 1. Lovable Platform (Recommended)

The easiest way to deploy is using the Lovable platform:
1. Click the "Publish" button in the Lovable editor
2. Your app will be deployed automatically with a custom URL

### 2. Docker Hub (Production Ready)

The application is automatically built and published to Docker Hub:
- Image: `lamuri/pubcraft-editor:latest`
- Multi-architecture support (AMD64, ARM64)
- Automatic builds on commits and tags

### 3. Vercel

```bash
npm install -g vercel
vercel
```

### 4. Netlify

```bash
npm run build
# Upload the 'dist' folder to Netlify
```

## 🔄 CI/CD Pipeline

The project includes automated GitHub Actions workflows:

- **Docker Build**: Automatically builds and pushes Docker images on:
  - Pull requests to main branch (build only)
  - Commits to main branch
  - Git tags (versioned releases)
  - Manual triggers

- **Multi-platform Support**: Images are built for both AMD64 and ARM64 architectures
- **Security Scanning**: Automated vulnerability scanning with Docker Scout

## 🔍 Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information about the problem
3. Contact the development team

## 🔗 Useful Links

- [ORCID Developer Documentation](https://info.orcid.org/documentation/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)
- [Docker Hub Repository](https://hub.docker.com/r/lamuri/pubcraft-editor)
