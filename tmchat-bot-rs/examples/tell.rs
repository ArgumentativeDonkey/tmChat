use log::{debug, info, warn};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, path::Path, sync::Arc};
use tmchat_bot::*;
use tokio::{
    fs,
    io::{self, AsyncReadExt, AsyncWriteExt},
    signal::ctrl_c,
    sync::Mutex,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
struct TellRecord {
    sender: String,
    message: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::init();
    let bot = Arc::new(TMBot::new(
        "https://tmchat.keyroom.cc/api".into(),
        "wss://mpqjjaeugsxwaacvqbqb.supabase.co/realtime/v1".into(),
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcWpqYWV1Z3N4d2FhY3ZxYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzQ0NjYsImV4cCI6MjA4OTcxMDQ2Nn0.4fUmlwyxmIEMLYTqeSp6MGXMVesbYEK7ANnn8FVSC-w".into(),
        "TellBot".into()
    ));

    let save_path = Path::new("./examples/tell.json");

    let records: Arc<Mutex<HashMap<String, Vec<TellRecord>>>> =
        if let Ok(file) = fs::OpenOptions::new().read(true).open(save_path).await {
            let mut reader = io::BufReader::new(file);
            let mut save: Vec<u8> = vec![];
            reader.read_to_end(&mut save).await.unwrap();
            Arc::new(Mutex::new(serde_json::from_slice(&save).unwrap_or_else(
                |e| {
                    warn!("couldn't load file, defaulting: {e}");
                    Default::default()
                },
            )))
        } else {
            Arc::new(Mutex::new(HashMap::new()))
        };

    bot.send_message("TellBot initializing!".into())
        .await
        .unwrap();

    let records_clone = records.clone();
    let ctrlc_bot_clone = bot.clone();
    tokio::spawn(async move {
        ctrl_c().await.unwrap();
        info!("Shutting down!");
        let records = records_clone;
        let bot = ctrlc_bot_clone;
        let _ = bot.send_message("TellBot signing off!".into()).await;
        let records = records.lock().await;
        let file = fs::OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .open(save_path)
            .await
            .unwrap();
        let mut writer = io::BufWriter::new(file);
        let buf = serde_json::to_vec(&*records).unwrap();
        writer.write(&buf).await.unwrap();
    });

    let subscribe_bot_clone = bot.clone();
    bot.subscribe(async move |message| {
        let records = records.clone();
        let mut records = records.lock().await;
        let bot = subscribe_bot_clone.clone();

        if let Some(messages) = records.get_mut(&message.sender) {
            while let Some(message) = messages.pop() {
                let _ = bot
                    .send_message(format!("From {}: {}", message.sender, message.message))
                    .await;
            }
        }

        if message.content.starts_with("!tell ") {
            let args = message.content.split('"').collect::<Vec<&str>>();
            let len = args.len();
            if len != 5 {
                let _ = bot
                    .send_message("Usage: !tell \"<reciever>\" \"<message>\"".into())
                    .await;
                return;
            }
            let to = args[1].to_string();
            let msg = args[3].to_string();
            records.insert(to.clone(), vec![]);
            let records = records.get_mut(&to).unwrap();
            records.push(TellRecord {
                sender: message.sender,
                message: msg,
            });
            bot.send_message(format!("Will tell {}!", to))
                .await
                .unwrap();
            debug!("records is now {records:?}");
        }
    })
    .await
}
