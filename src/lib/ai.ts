const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const SITE_URL = window.location.origin;
const SITE_NAME = 'SmartPlanner';

export async function generateRecipeAI(prompt: string) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API Key is missing. Please add VITE_OPENROUTER_API_KEY to your environment variables.');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo', // or any other cheap/good model
        messages: [
          {
            role: 'system',
            content: `You are a helpful cooking assistant. 
            Generate a recipe based on the user's request. 
            Return ONLY valid JSON matching this structure:
            {
              "title": "Recipe Title",
              "description": "Short description",
              "ingredients": [
                { "name": "ingredient name", "amount": number, "unit": "unit (e.g. g, ml, cup, tbsp, piece)" }
              ],
              "instructions": ["Step 1", "Step 2"],
              "prepTime": number (minutes),
              "cookTime": number (minutes),
              "servings": number
            }
            Do not include markdown formatting or backticks. Just the raw JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate recipe');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      // clean up potential markdown code blocks if the model ignores the system prompt
      const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
}

export async function generateImageAI(prompt: string) {
  if (!OPENROUTER_API_KEY) {
     throw new Error('OpenRouter API Key is missing.');
  }

  // Note: OpenRouter supports various models. 
  // This implementation assumes a model that accepts standard chat completions or image generation endpoint.
  // However, standard OpenRouter chat/completions might not return image URLs unless using specific models/plugins.
  // For simplicity and if using a text model, we might prompt for a description to search?
  // But the user asked to "generate an image".
  // DALL-E 3 via OpenRouter is available via the same chat/completions endpoint or image generations?
  // OpenRouter docs say standard OpenAI format. 
  
  // Let's try the standard OpenAI image generation endpoint but routed through OpenRouter if supported,
  // OR use a specific model that returns images. 
  // Currently, OpenRouter is text-focused. 
  // If we strictly follow "Use AI with OpenRouter", we might be limited to text.
  // But maybe the user implies using OpenRouter for the text part and something else for images?
  // "Add a feature... to use AI to generate an image... or search photo online".
  
  // I will implement a mock/placeholder for image generation if OpenRouter doesn't support it easily via the same key/endpoint style,
  // or try to use a text-to-image model if available on OpenRouter.
  // Actually, OpenRouter exposes `stabilityai/stable-diffusion-xl-beta-v2-2-2` etc.
  // But the API format might differ.
  // Safest bet: Implement Google Image Search Link (as "search photo online") and a placeholder for "Generate Image" 
  // that explains it requires a specific image generation API key (like OpenAI DALL-E directly).
  
  // However, let's try to use a text prompt to get a SEARCH TERM from AI, then use that to find an image?
  // Or just implement the "Search Online" feature which is robust.
  
  // Re-reading: "Add a feature... to use AI to generate an image... OR search photo online"
  // I'll implement the "Search Photo Online" as a button that opens Google Images.
  // I'll leave the "AI Generate" as a TODO or basic implementation if possible.
  
  return null; // Placeholder
}

