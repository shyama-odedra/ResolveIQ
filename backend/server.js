require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./sockets/socket");

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`TicketFlow AI server running on port ${PORT}`);
    console.log(process.env.GEMINI_API_KEY ? `[triage] Gemini key loaded, model: ${process.env.GEMINI_MODEL || "gemini-3.8-flash"}` : "[triage] WARNING: GEMINI_API_KEY missing - AI will use keyword fallback");
  });
};

start();
