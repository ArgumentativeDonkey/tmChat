use std::collections::HashMap;

use reqwest::{Client, Response};
use serde::{Deserialize, Serialize, de::Error};
use serde_json::Value;
use supabase_realtime_rs::{
    PostgresChangeEvent, PostgresChangesFilter, PostgresChangesPayload, RealtimeClient,
    RealtimeClientOptions,
};

pub struct TMBot {
    pub api_url: String,
    pub supabase_url: String,
    supabase_key: String,
    pub name: Option<String>,
}

impl TMBot {
    pub fn new(api_url: String, supabase_url: String, supabase_key: String) -> Self {
        Self {
            api_url,
            supabase_key,
            supabase_url,
            name: None,
        }
    }
    /// Name must be less than or equal to 10 characters in length!
    pub fn with_name(mut self, name: String) -> Self {
        debug_assert!(name.chars().count() <= 10);
        self.name = Some(name);
        self
    }
    pub async fn send_message(&self, content: String) -> anyhow::Result<Response> {
        let client = Client::new();
        let data = Message {
            sender: self.name.clone().unwrap_or("TMChatBot".into()),
            content,
        };

        client
            .post(self.api_url.clone() + "/submitmessage")
            .json(&data)
            .send()
            .await
            .map_err(Into::into)
    }
    pub async fn subscribe<F>(&self, callback: F) -> anyhow::Result<()>
    where
        F: AsyncFn(Message) + 'static,
    {
        let client = RealtimeClient::new(
            self.supabase_url.clone(),
            RealtimeClientOptions {
                api_key: self.supabase_key.clone(),
                ..Default::default()
            },
        )?;

        client.connect().await?;

        let channel = client.channel("db-changes", Default::default()).await;

        let mut listener = channel
            .on_postgres_changes(
                PostgresChangesFilter::new(PostgresChangeEvent::Insert, "public").table("messages"),
            )
            .await;

        channel.subscribe().await?;

        while let Some(change) = listener.recv().await {
            let PostgresChangesPayload::Insert(payload) = change else {
                unreachable!("all changes are inserts");
            };
            let message: Message = payload.new.try_into().unwrap();
            if message.sender == self.name.clone().unwrap_or_default() {
                continue;
            }
            callback(message).await;
        }

        Ok(())
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Message {
    pub sender: String,
    pub content: String,
}

impl TryFrom<HashMap<String, Value>> for Message {
    type Error = anyhow::Error;
    fn try_from(value: HashMap<String, Value>) -> anyhow::Result<Self> {
        let sender = value
            .get("sender")
            .ok_or(serde_json::Error::missing_field("sender"))?
            .as_str()
            .unwrap()
            .to_string();
        let content = value
            .get("content")
            .ok_or(serde_json::Error::missing_field("content"))?
            .as_str()
            .unwrap()
            .to_string();
        Ok(Self { sender, content })
    }
}
