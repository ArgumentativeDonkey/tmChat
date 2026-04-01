import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface Payload {
  sender: string;
  message: string;
  timestamp: string;
}

export default class TMChatBot {
  public name: string | undefined;
  public api_url: URL;
  public supabase_url: URL;
  private supabase_key: string;
  public supabase: SupabaseClient;

  constructor(
    api_url: URL,
    supabase_url: URL,
    supabase_key: string,
    name?: string,
  ) {
    this.api_url = api_url;
    this.supabase_url = supabase_url;
    this.supabase_key = supabase_key;
    if (name && name.length > 10) {
      throw RangeError("name must be < 10 chars");
    }
    this.name = name;
    this.supabase = createClient(
      this.supabase_url.toString(),
      this.supabase_key,
    );
  }

  public subscribeMessages(fn: (payload: Payload) => Promise<void>) {
    this.supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        async (payload) => {
          if (payload.eventType != "INSERT") {
            return;
          }
          await fn({
            message: payload.new["content"],
            sender: payload.new["sender"],
            timestamp: payload.new["created_at"],
          });
        },
      )
      .subscribe();
  }

  public async sendMessage(message: string) {
    const username = this.name ? this.name : "bot";
    const data = { sender: username, content: message };
    const res = await fetch(this.api_url + "/submitmessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const response = await res.json();
      throw Error("send failed: " + response);
    }
  }
}
