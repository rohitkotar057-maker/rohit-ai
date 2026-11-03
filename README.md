# ROHIT AI — starter app

This is a deployable mobile-first web app with a real server-side Gemini text-generation connection.

## Included
- AI Chat in Hindi/Hinglish
- Horror story, video prompt, image prompt, voice script, study, translation and writing tools
- Express backend proxy so the Gemini API key is never sent to the browser
- Health endpoint at `/health`

## Important
- Image and video tools create prompts/scripts only. They do not render images or videos.
- Free-tier availability, quotas and model access can change.
- Never put the API key in `public/index.html`, GitHub source, or a chat message.

## Deploy (phone-friendly)
1. Create a GitHub account and a new **private** repository named `rohit-ai`.
2. Upload all files/folders from this ZIP to the repository (keep `public/index.html` inside the `public` folder).
3. Create a Gemini API key in Google AI Studio: https://aistudio.google.com/app/apikey
4. Open https://render.com and sign up; choose **New → Web Service**, connect the GitHub repo.
5. Set:
   - Build command: `npm install`
   - Start command: `npm start`
   - Plan: Free (if available for your account/region)
6. In Render → Environment, add:
   - `GEMINI_API_KEY` = your key
   - `GEMINI_MODEL` = `gemini-2.5-flash` (or a model enabled for your key)
7. Deploy. Open the generated `*.onrender.com` URL on your phone.

Render free web services may sleep after inactivity and take time to wake up. Check current free-plan limits before deploying.

## Local run
- Install Node.js 18+
- Run `npm install`
- Set `GEMINI_API_KEY` in your environment
- Run `npm start`
- Open `http://localhost:10000`
