import type { Payload } from "../../src/index.js";
import TMChatBot from "../../src/index.js";

const api_url: URL = new URL("https://tmchat.keyroom.cc/api");
const supabase_url: URL = new URL("https://mpqjjaeugsxwaacvqbqb.supabase.co");
const supabase_key: string =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcWpqYWV1Z3N4d2FhY3ZxYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzQ0NjYsImV4cCI6MjA4OTcxMDQ2Nn0.4fUmlwyxmIEMLYTqeSp6MGXMVesbYEK7ANnn8FVSC-w";
const name = "PartyBot";

let bot = new TMChatBot(api_url, supabase_url, supabase_key, name);
console.log("Bot created!");

bot.sendMessage("partybot initialized!");

async function responder(message: Payload) {
  let content = message.message;
  if (content == "!party") {
    bot.sendMessage("Yeah, let's party!");
  }
}

bot.subscribeMessages(responder);
