# TMChat-Bot

This library is meant for easy bot use. See the example in `examples/partybot` for a party bot.

```typescript
import TMChatBot from "<path-to-tmchat-bot>"
import type {Payload} from "<path-to-tmchat-bot>"

// TODO: Set api_url, supabase_url, supabase_key, and name (name optional)
// Get supabase url and key off of the website
// Example for tmchat.keyroom.cc:
// api_url: https://tmchat.keyroom.cc/api
// supabase_url: https://mpqjjaeugsxwaacvqbqb.supabase.co"
// supabase_key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcWpqYWV1Z3N4d2FhY3ZxYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzQ0NjYsImV4cCI6MjA4OTcxMDQ2Nn0.4fUmlwyxmIEMLYTqeSp6MGXMVesbYEK7ANnn8FVSC-w
let bot = new TMChatBot(api_url, supabase_url, supabase_key, name);

// Send a message
bot.sendMessage("hello!");

// Here's are responder
function echoBot(payload: Payload) {
    bot.sendMessage(payload.message);
}

// Subscribe (indefinitely)
bot.subscribeMessages(responder);

```
