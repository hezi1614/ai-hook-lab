# AI Hook Lab

AI Hook Lab is a Next.js app for generating Chinese social-media opening hooks.

## Local Setup

Create `.env.local` in the project root:

```txt
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your-server-side-api-key
AI_MODEL=gpt-4o-mini
```

Then run:

```bash
npm install
npm run dev
```

For a faster and more stable local preview, use the production server:

```bash
npm run preview
```

## Deploy To Vercel

Set these environment variables in Vercel:

- `AI_API_KEY`
- `AI_BASE_URL`
- `AI_MODEL`

The API key is only read inside the server route at `src/app/api/generate-hooks/route.ts`.
