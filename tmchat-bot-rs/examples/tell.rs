use std::{collections::HashMap, sync::Arc};
use tmchat_bot::*;
use tokio::sync::Mutex;

#[derive(Clone, Debug)]
struct TellRecord {
    sender: String,
    message: String
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let bot = Arc::new(TMBot::new(
        "https://tmchat.keyroom.cc/api".into(),
        "wss://mpqjjaeugsxwaacvqbqb.supabase.co/realtime/v1".into(),
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcWpqYWV1Z3N4d2FhY3ZxYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzQ0NjYsImV4cCI6MjA4OTcxMDQ2Nn0.4fUmlwyxmIEMLYTqeSp6MGXMVesbYEK7ANnn8FVSC-w".into(),
        "TellBot".into()
    ));

    bot.send_message("TellBot Initialized!".into()).await.unwrap();

    let bot_clone = bot.clone();
    
    let records: Arc<Mutex<HashMap<String, Vec<TellRecord>>>> = Arc::new(Mutex::new(HashMap::new()));

    bot.subscribe(async move |message| {
        let records = records.clone();
        let mut records = records.lock().await;
        let bot = bot_clone.clone();

        if let Some(messages) = records.get_mut(&message.sender) {
            while let Some(message) = messages.pop() {
                let _ = bot.send_message(format!("From {}: {}", message.sender, message.message)).await;
            }
        }

        if message.content.starts_with("!tell ") {
            let args = message.content.split('"').collect::<Vec<&str>>();
            println!("{args:?}");
            if args.len() != 5 {
                let _ = bot.send_message("Usage: !tell \"<reciever>\" \"<message>\"".into()).await;
                return;
            }
            let to = args[1].to_string();
            let msg = args[3].to_string();
            records.insert(to.clone(), vec![]);
            let records = records.get_mut(&to).unwrap();
            records.push(TellRecord { sender: message.sender, message: msg })
        }

    }).await
}
