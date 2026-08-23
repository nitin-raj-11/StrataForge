# StrataForge Frontend

The frontend for the StrataForge algorithmic trading backtesting platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:8080/api
VITE_USE_MOCK_API=true
```

- `VITE_USE_MOCK_API`: Set to `true` to use the built-in mock API (useful for testing and demoing without a backend). Set to `false` to point to the real Java backend.
- `VITE_API_URL`: The URL of the real API backend.

## Deployment

To deploy to Vercel, Netlify, or similar platforms:

1. Connect your GitHub repository to the hosting platform.
2. Set the build directory to `frontend/` (if the project is in a monorepo).
3. Build command: `npm run build`
4. Output directory: `dist`
5. **Environment Variables**: In the platform dashboard, set:
   - `VITE_USE_MOCK_API=false`
   - `VITE_API_URL=https://your-production-backend-url.com/api`
6. Deploy!
