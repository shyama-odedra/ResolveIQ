require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const key = process.env.GEMINI_API_KEY;

  console.log("API key loaded:", !!key);
  console.log("Model:", process.env.GEMINI_MODEL);

  if (!key) {
    console.log("ERROR: GEMINI_API_KEY not found");
    return;
  }

  const genAI = new GoogleGenerativeAI(key);

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    });

    const result = await model.generateContent(
      "Reply with exactly: Gemini connection works"
    );

    console.log("SUCCESS:");
    console.log(result.response.text());
  } catch (error) {
    console.log("FAILED:");
    console.log("Status:", error.status);
    console.log("Message:", error.message);
  }
}

test();