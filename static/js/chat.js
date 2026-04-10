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
function formatDateTime(dtStr) {
    const dt = new Date(dtStr);
    return dt.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC"
    });
}
function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
async function submitMessage() {
    var data = {'sender': document.getElementById('nameInput').innerText, 'content': document.getElementById("msgInput").value }
    if (data['content'].trim() == "") {
        return
    }
    if (data['content'] == "?light") {
        const url = new URL(window.location.href);
        url.searchParams.set("theme", "light");
        window.location.href = url;
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
let knownOffset = 0;
async function getMessages(reversed = false, offset = 0) {
    knownOffset = offset;
    console.log("Fetching messages...");
    var data = {
        room: 'general',
        offset: offset
    };
    const res = await fetch(appUrl + '/api/getmessages', {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(data)
    })
    if (res.ok) {
        var response = await res.json();
        if(reversed) {
            response.reverse();
        }
        for (var i in response) {
            var message = response[i]
            if (message['content'] !== undefined && message['sender'] !== undefined) {
                var messageP = document.createElement("p");
                messageP.innerHTML = `[<b>${escapeHTML(message['sender'])}</b>] ${escapeHTML(message['content'])} <i>(${message['created_at']})</i>`;
                if (!reversed) {
                    messagesDiv.appendChild(messageP);
                } else {
                    messagesDiv.prepend(messageP);
                }
            }
        }
        if (response.length == 50) {
            let loadMoreMessage = document.createElement("p");
            loadMoreMessage.className = "load-more";
            loadMoreMessage.textContent = "Load more messages";
            loadMoreMessage.addEventListener("click", async () => {
                const offset = knownOffset + 50;
                loadMoreMessage.innerHTML = "Loading&hellip;"
                await getMessages(true, offset);
                loadMoreMessage.remove();
            });
            messagesDiv.prepend(loadMoreMessage);
        }
    }
    if (offset == 0) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    let del = document.getElementById("md-delete");
    if (del != undefined && del != null) {
        del.remove();
    }
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
    //document.getElementById("nameInput").innerText = escapeHTML(document.getElementById("nameInput").innerText)
});

async function process_change(payload) {
    console.log(payload)
    if (payload['eventType'] == "INSERT") {
        console.log(payload['new']['sender'] + " sent a message saying " + payload['new']['content'])
        var messageP = document.createElement("p");
        payload['new']['created_at'] = formatDateTime(payload['new']['created_at']);
        messageP.innerHTML = `<b>[${escapeHTML(payload['new']['sender'])}]</b> ${escapeHTML(payload['new']['content'])} <i>(${payload['new']['created_at']})</i>`;
        messagesDiv.appendChild(messageP);
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
getMessages()
if (localStorage.getItem('username') !==undefined && localStorage.getItem('username').trim() !== "") {
    document.getElementById('nameInput').innerText = localStorage.getItem('username');

}
document.documentElement.scrollTop = document.documentElement.scrollHeight;
