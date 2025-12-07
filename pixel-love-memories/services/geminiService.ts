import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLoveLetter = async (memoriesPassed: string[]): Promise<string> => {
  const client = getClient();
  if (!client) return "Seni çok seviyorum! Hayatıma girdiğin için teşekkürler. (API Anahtarı eksik)";

  try {
    const modelId = "gemini-2.5-flash";
    
    // Updated prompt for Turkish context and "First Flowers" event
    const prompt = `
      Sen romantik bir yardımcısın. Kız arkadaşım az önce ilişkimizle ilgili anıları test eden bir oyunu kazandı.
      
      Bu yıldönümü DEĞİL. Bu, ona İLK KEZ ÇİÇEK ALDIĞIM özel bir sürpriz anı.
      Erkek karakter oyunun sonunda elinde çiçeklerle bekliyor.
      
      Onun hatırladığı anılar: ${memoriesPassed.join(', ')}.
      
      Lütfen Türkçe, çok duygusal, kısa ve etkileyici bir tebrik mesajı yaz (maksimum 2 cümle).
      Mesajda "Sana çiçek aldım" değil, ona olan sevgimi ve bu anın güzelliğini vurgula.
      Emoji kullanma.
    `;

    const response = await client.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Seninle geçen her anım harika, çiçeklerin kadar güzelsin!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sunucular çökse de benim sana olan sevgim asla bitmez!";
  }
};