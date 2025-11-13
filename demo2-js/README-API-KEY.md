# API Key Configuration Required

## The Issue
The current API key in `.env` is invalid or expired:
```
GEMINI_API_KEY=AIzaSyATuIJV3vrSHE4ko2UECE91OFiCpyF0aVY
```

## How to Fix

1. **Get your Gemini API Key**:
   - Go to https://aistudio.google.com/app/apikey
   - Click "Create API Key" or copy your existing key
   - Make sure you have enabled the Gemini API

2. **Update the .env file**:
   Edit `demo2-js/.env` and replace the API key:
   ```
   GEMINI_API_KEY=your-actual-api-key-here
   ```

3. **Restart the server**:
   ```bash
   cd demo2-js
   ./start.sh --stop  # Stop any running server
   ./start.sh         # Start with new API key
   ```

## Verify Your API Key

Your API key should:
- Be approximately 39 characters long
- Start with "AIza"
- Work when tested at https://aistudio.google.com/app/prompts

## Common Issues

- **API_KEY_INVALID**: The key is wrong or expired
- **Quotas exceeded**: You may have hit usage limits
- **API not enabled**: Enable Gemini API in Google Cloud Console

## Test Your Key

You can test your API key with curl:
```bash
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"
```

Replace YOUR_API_KEY with your actual key. If it works, you'll get a JSON response.