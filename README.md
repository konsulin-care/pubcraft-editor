# Pubcraft Editor

## Environment Configuration

### Runtime Environment Variables

Pubcraft Editor supports dynamic environment configuration during deployment, allowing you to inject sensitive configuration without rebuilding the image.

#### Configuration Methods

1. **Docker Deployment**
   - Use environment variables or Docker secrets
   ```bash
   docker run -e VITE_GITHUB_CLIENT_ID=your_github_client_id \
              -e VITE_ORCID_CLIENT_ID=your_orcid_client_id \
              pubcraft-editor
   ```

2. **Docker Compose**
   - Create a `.env` file or use environment variables
   ```yaml
   services:
     pubcraft:
       environment:
         - VITE_GITHUB_CLIENT_ID=${VITE_GITHUB_CLIENT_ID}
         - VITE_ORCID_CLIENT_ID=${VITE_ORCID_CLIENT_ID}
   ```

3. **Kubernetes/Helm**
   - Use ConfigMaps or Secrets
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: pubcraft-env
   type: Opaque
   stringData:
     VITE_GITHUB_CLIENT_ID: your_github_client_id
     VITE_ORCID_CLIENT_ID: your_orcid_client_id
   ```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth Client ID | Yes | - |
| `VITE_GITHUB_REDIRECT_URI` | GitHub OAuth Redirect URI | Yes | `http://localhost:5173/github/callback` |
| `VITE_ORCID_CLIENT_ID` | ORCID OAuth Client ID | Yes | - |
| `VITE_ORCID_REDIRECT_URI` | ORCID OAuth Redirect URI | Yes | `http://localhost:5173/orcid/callback` |
| `VITE_APP_NAME` | Application Name | No | `Pubcraft Editor` |
| `VITE_APP_VERSION` | Application Version | No | `0.1.0` |
| `VITE_DEBUG_MODE` | Enable Detailed Logging | No | `false` |

### Security Considerations

- Never commit sensitive credentials to version control
- Use environment-specific `.env` files
- Utilize secret management tools in production
- The application sanitizes and validates all environment variables

### Local Development

1. Copy `.env.template` to `.env`
2. Fill in your configuration details
3. Run `bun dev`

### Troubleshooting

- Check browser console for environment configuration warnings
- Ensure all required variables are set
- Verify redirect URIs match your deployment environment
