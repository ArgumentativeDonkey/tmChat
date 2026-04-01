from flask import Flask, render_template, request, jsonify #type: ignore  # ty:ignore[unused-type-ignore-comment, unused-ignore-comment]
from flask_cors import CORS #type: ignore  # ty:ignore[unused-type-ignore-comment, unused-ignore-comment]
from supabase import create_client, Client #type: ignore  # ty:ignore[unused-type-ignore-comment, unused-ignore-comment]
import os
from dotenv import load_dotenv #type: ignore  # ty:ignore[unused-type-ignore-comment, unused-ignore-comment]
from postgrest.exceptions import APIError #type: ignore  # ty:ignore[unused-type-ignore-comment, unused-ignore-comment]
from datetime import datetime
load_dotenv()
secret_key = os.environ.get("SECRET_KEY")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase_url = os.environ.get("SUPABASE_URL")
assert supabase_key is not None
assert supabase_url is not None

supabase: Client | None = None
app = Flask(__name__, 
    static_folder=os.path.join(os.path.dirname(__file__), "static"),
    static_url_path="/static")
def format_datetime(dtm):
    dt = datetime.fromisoformat(dtm)
    return dt.strftime("%b %d, %Y %I:%M %p")
app.config['SECRET_KEY'] = secret_key
appUrl = "https://tmchat.gradyblackwell.dev"
#appUrl = "http://127.0.0.1:8000/"
def get_supabase() -> Client:
    global supabase
    if supabase is None:
        supabase = create_client(supabase_url, supabase_key)  # ty:ignore[invalid-argument-type]
    return supabase
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": appUrl}})
@app.route("/", methods=['GET'])
def serve_index():
    return render_template("index.html", supabase_url=supabase_url, supabase_anon_key = os.environ.get("SUPABASE_ANON_KEY"))
@app.route("/api/submitmessage", methods=['POST'])
def submit_message():
    data = request.json
    if "content" not in data:
        return jsonify({'error':'empty message'}), 400
    elif len(data['content']) > 5000:
        return jsonify({'error':'message too long'}), 400
    if data['sender'].strip() == "" or data['content'].strip() == "":
        return jsonify({'error':'one or more fields is empty. stop editing the JS pls.'})
    try:
        response = get_supabase().table("messages").insert(data).execute()
        return jsonify(response.data), 200
    except APIError as e:
        return jsonify({'error':e})
@app.route("/api/getmessages", methods=['POST'])
def get_messages():
    data = request.json
    if (data['room'] is None):
        return jsonify({'error':'no room found'}), 
    else:
        try:
            response = get_supabase().table('messages').select('sender', 'content', 'created_at').limit(50).order("created_at", desc=True).execute()
            for message in response.data:
                message['created_at'] = format_datetime(message['created_at'])  # ty:ignore[invalid-assignment, not-subscriptable, invalid-argument-type]
            return jsonify(response.data), 200
        except APIError as e:
            return jsonify({'error':e}), 400


    
    