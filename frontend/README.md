# Government Process GPS - Frontend

This is a Vite + React minimal frontend scaffold for the project.

Prerequisites:
- Node.js 18+ and npm

Run (PowerShell):

```powershell
cd frontend
npm install
npm run dev
```

By default Vite serves the frontend on port 5173. During development you can set up a proxy in `vite.config.js` or call the backend via the absolute URL (http://localhost:8080) if CORS is enabled on the backend.

Demo notes:
- The frontend uses a demo userId=1 for bookmarks and progress APIs. The backend seeds an admin user and sample services; you can register new users via the Register page but the demo bookmark/progress actions use userId=1 unless you modify the code.
- To test bookmark/progress: open a Service Detail and click "Save / Bookmark service" or toggle the workflow step checkboxes.

CI
--
This project includes a GitHub Actions workflow at `.github/workflows/frontend-ci.yml`. To enable CI, push the `frontend/` folder to a GitHub repository and the workflow will run on push.
