import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const appUrl = window.location.origin;
const messagesDiv = document.getElementById("messagesDiv")
supabase
    .channel("db-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        process_change(payload)
    })
    .subscribe();
async function submitMessage() {
    var data = {'sender': document.getElementById('nameInput').innerText, 'content': document.getElementById("msgInput").value }
    if (data['content'].trim() == "") {
        return
    }
    const res = await fetch(appUrl + '/api/submitmessage', {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(data)
    })
    if (!res.ok) {
        response = await res.json()
        console.log(response['e'])
    } else {
        document.getElementById("msgInput").value = "";
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
async function getMessages() {
    console.log("Fetching messages...")
    var data = {};
    data['room'] = 'general'
    const res = await fetch(appUrl + '/api/getmessages', {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(data)
    })
    if (res.ok) {
        var response = await res.json()
        for (var i in response) {
            var message = response[i]
            if (message['content'] !== undefined && message['sender'] !== undefined) {
                var messageP = document.createElement("p");
                messageP.innerHTML = `[<b>${message['sender']}</b>] ${message['content']}`;
                messagesDiv.appendChild(messageP);
            }
        }
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
document.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        submitMessage()
    }
})
document.addEventListener("keyup", (e)=>{
    if (document.getElementById("nameInput").innerHTML == "") {
        document.getElementById("nameInput").innerHTML = " "
    }
    localStorage.setItem('username', document.getElementById("nameInput").innerText)
})

document.getElementById('nameInput').addEventListener('keypress', (evt) => {
    if (evt.key == "Enter") {
        evt.preventDefault();
        return
    }
    if (document.getElementById("nameInput").innerText.length >= 10) {
        evt.preventDefault();
    }
});

async function process_change(payload) {
    console.log(payload)
    if (payload['eventType'] == "INSERT") {
        console.log(payload['new']['sender'] + " sent a message saying " + payload['new']['content'])
        var messageP = document.createElement("p");
        messageP.innerHTML = `<b>[${payload['new']['sender']}]</b> ${payload['new']['content']}`;
        messagesDiv.appendChild(messageP);
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
getMessages()
if (localStorage.getItem('username') !==undefined && localStorage.getItem('username').trim() !== "") {
    document.getElementById('nameInput').innerText = localStorage.getItem('username');

}
document.documentElement.scrollTop = document.documentElement.scrollHeight;
