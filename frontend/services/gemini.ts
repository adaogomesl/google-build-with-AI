import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { getGeorgiaWaterData } from './waterData';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

// Define the tool for the model
const getWaterDataDeclaration: FunctionDeclaration = {
  name: 'get_georgia_water_data',
  description: 'Fetches the latest water metrics from four coastal monitoring stations: Savannah/Port Wentworth, Hudson Creek/Sapelo, Lower Satilla/Atkinson, and Upper Satilla/Waycross (inland baseline). Use this whenever the user asks about water safety, drought, local water characteristics, residential impacts, or a regional overview.',
  parameters: {
    type: Type.OBJECT,
    properties: {}, // No parameters required
  },
};

const SYSTEM_INSTRUCTION = `
You are the Coastal Georgia Water Resilience Assistant. Your purpose is to bridge the gap between complex coastal chemical data and local community awareness regarding water safety, infrastructure risks, and residential property maintenance.

Instructions:
1. Tone & Style: Act as a localized community safety bulletin. Avoid using raw chemical jargon alone. Always pair data with real-world analogies so residents can easily understand the impact.
2. Whenever a user inquires about water safety, coastal drought, changes in their local water characteristics, a regional overview, a health check, or residential impacts (e.g., boat docks, plumbing), run the 'get_georgia_water_data' function immediately to fetch the latest metrics.
3. The tool returns data for four locations: Savannah/Port Wentworth, Hudson Creek/Sapelo, Lower Satilla/Atkinson, and Upper Satilla/Waycross (which serves as a 0% salinity inland freshwater baseline). 
4. Use the specific conductance value returned by the tool to calculate TDS (Total Dissolved Solids ≈ Conductance * 0.65) and assess saltwater intrusion risk for each site.
5. **CRITICAL ANALOGY REQUIREMENT**: You MUST compare the parsed TDS to the fractional strength of seawater (standard seawater is ~35,000 mg/L TDS). For example, if TDS is 3,500 mg/L, explain that it is "10% the strength of pure seawater."
6. Always structure your response into three specific sections using Markdown headers (###), ensuring it reads like an official community bulletin:

  ### 🌊 Local Water Status
  (Format the multi-site comparison output into a clean Markdown table with columns for: Site Name, Specific Conductance, Calculated TDS, and Risk Level. If the user asked about a specific area, highlight the closest proxy site.)

  ### ⚠️ Infrastructure & Property Risk
  (Provide a brief, exactly 2-sentence summary explaining the infrastructure risk. You MUST include the seawater fractional strength analogy here. Explain how this salinity level causes pipe corrosion for local utilities or affects marine hardware, avoiding raw jargon.)

  ### 📋 Community Action Plan
  (Provide a bulleted list of actionable advice or resilience notes tailored to the user's query. Include specific residential/boating maintenance advice if applicable.)

Constraints:
Never provide medical or health guarantees. Frame all conclusions as chemical matrix evaluations and structural risks based on live USGS data.
`;

// Define a type for the history items to manage manual tool calling
type ContentPart = { text?: string; functionCall?: any; functionResponse?: any };
type Content = { role: string; parts: ContentPart[] };

export class ChatService {
  private history: Content[] = [];

  constructor() {
    // Initialize history is empty, system instruction is passed in config
  }

  async sendMessage(message: string): Promise<string> {
    // 1. Add user message to history
    this.history.push({ role: 'user', parts: [{ text: message }] });

    try {
      // 2. Call Gemini
      let response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: this.history,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: [getWaterDataDeclaration] }],
          temperature: 0.2, // Keep it focused and factual
        }
      });

      // 3. Handle potential tool calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        // Append the model's tool call request to history
        if (response.candidates && response.candidates[0].content) {
           this.history.push(response.candidates[0].content as Content);
        }

        // Execute the tools
        const toolResponsesParts: ContentPart[] = await Promise.all(response.functionCalls.map(async call => {
          if (call.name === 'get_georgia_water_data') {
            const data = await getGeorgiaWaterData();
            console.log("Tool executed, returning data:", data);
            return {
              functionResponse: {
                name: call.name,
                response: { sites: data } // Wrap array in an object for cleaner JSON representation
              }
            };
          }
          return { functionResponse: { name: call.name, response: { error: "Unknown function" } } };
        }));

        // Append tool responses to history as 'user' role
        this.history.push({ role: 'user', parts: toolResponsesParts });

        // 4. Call Gemini again with the tool results
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: this.history,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: [getWaterDataDeclaration] }],
            temperature: 0.2,
          }
        });
      }

      // 5. Append final model response to history and return
      if (response.candidates && response.candidates[0].content) {
        this.history.push(response.candidates[0].content as Content);
      }

      return response.text || "I'm sorry, I couldn't generate a response.";

    } catch (error) {
      console.error("Error in ChatService:", error);
      // Remove the failed user message from history so they can try again
      this.history.pop(); 
      throw error;
    }
  }
}

// Export a singleton instance for the app
export const chatService = new ChatService();