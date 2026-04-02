from supabase import acreate_client, Client#type:ignore
import asyncio
import requests
from postgrest.exceptions import APIError
APP_URL = "https://tmchat.keyroom.cc/"
SUPABASE_URL = "https://mpqjjaeugsxwaacvqbqb.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcWpqYWV1Z3N4d2FhY3ZxYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzQ0NjYsImV4cCI6MjA4OTcxMDQ2Nn0.4fUmlwyxmIEMLYTqeSp6MGXMVesbYEK7ANnn8FVSC-w"

class Bot ():
    def process_change(self, payload):
        if payload['data']['record']['sender'] == self.name:
            return
        print("Change received:", payload)
        return self.runfunc(self,payload)
    def send_message(self, content):
        url = APP_URL+"/api/submitmessage"
        headers={'Content-Type': "application/json"}
        data = {"sender": self.name, "content": content}
        try:
            response = requests.post(url, json=data, headers=headers)
        except requests.exceptions.RequestException as e:
            print(e)



    async def main(self):
        print("initiating")
        supabase = await acreate_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        channel = supabase.channel("db-changes")
        await channel.on_postgres_changes(
            event="*",
            schema="public",
            table="messages",
            callback=self.process_change
        ).subscribe()
        while True:
            await asyncio.sleep(1)
    def __init__(self, name: str, runfunc: callable):
        self.name = name
        self.runfunc = runfunc
        asyncio.run(self.main())
