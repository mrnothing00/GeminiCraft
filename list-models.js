import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function list() {
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-2.0-flash" }).apiKey; // Dummy call to get client, or use raw fetch
    // Actually, the SDK has a simpler way, but raw fetch is safer for debugging 404s:
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.VITE_GEMINI_API_KEY}`
    );
    const data = await response.json();
    
    console.log("=== AVAILABLE MODELS ===");
    data.models.forEach(m => {
      if (m.name.includes("gemini")) {
        console.log(m.name.replace("models/", "")); // This is the ID you need
      }
    });
  } catch (error) {
    console.error(error);
  }
}

list();