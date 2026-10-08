# GitHub Pages deployment

The `Deploy frontend to GitHub Pages` workflow builds and deploys the frontend whenever
changes are pushed to `main`. It can also be run manually from the repository's Actions
tab. Pull requests do not deploy.

Before the first deployment, add the deployed backend's public base URL as a repository
Actions variable:

1. Open **Settings → Secrets and variables → Actions → Variables**.
2. Create a variable named `VITE_API_BASE_URL`, for example `https://api.example.com`.
3. Ensure the backend allows requests from the GitHub Pages origin.

The URL must be reachable by browsers; `localhost` will refer to each visitor's own
computer and will not work for a published site. The variable is embedded in the frontend
build and is not a secret.

The workflow configures Pages to deploy from GitHub Actions. The site is published at
`https://novaspire-tech.github.io/CampusFlow.UI/`. The build configures the repository
subpath for Vite assets and React Router, and emits a Pages fallback so direct navigation
to client-side routes works.
