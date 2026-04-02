use std::sync::Arc;
use tmchat_bot::*;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let bot = Arc::new(TMBot::new(
        "https://tmchat.keyroom.cc/api".into(),
        "wss://mpqjjaeugsxwaacvqbqb.supabase.co/realtime/v1".into(),
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcWpqYWV1Z3N4d2FhY3ZxYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzQ0NjYsImV4cCI6MjA4OTcxMDQ2Nn0.4fUmlwyxmIEMLYTqeSp6MGXMVesbYEK7ANnn8FVSC-w".into(),
        "EchoBot".into()
    ));

    bot.send_message("Hello from EchoBot".into()).await.unwrap();

    let bot_clone = bot.clone();
    bot.subscribe(async move |message| {
        let bot = bot_clone.clone();
        let _ = bot.send_message(message.content).await;
    }).await
}
