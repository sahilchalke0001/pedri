import os, datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, ASCENDING
from bson.objectid import ObjectId

from langchain_google_genai import (
    GoogleGenerativeAIEmbeddings,
    ChatGoogleGenerativeAI,
)
from langchain_chroma import Chroma


# ─────────────── ENV / DB ───────────────
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MONGO_URI      = os.getenv("MONGODB_URI")
DB_NAME        = os.getenv("MONGO_DB_NAME", "mydb")
CHROMA_DIR     = os.getenv("CHROMA_DIR", "chroma_db")
CHROMA_COLL    = os.getenv("CHROMA_COLLECTION_NAME", "pedri_kb")
PORT           = int(os.getenv("PORT", 5000))

if not (GOOGLE_API_KEY and MONGO_URI):
    raise RuntimeError("Missing GOOGLE_API_KEY or MONGODB_URI")

client = MongoClient(MONGO_URI)
db     = client[DB_NAME]
users_col = db.users
chats_col = db.chats
users_col.create_index([("clerkUserId", ASCENDING)], unique=True)

# ─────────────── AI objects (reuse across requests) ───────────────
embedder = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", api_key=GOOGLE_API_KEY
)
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash", temperature=0.6, google_api_key=GOOGLE_API_KEY
)
vectorstore = Chroma(
    collection_name=CHROMA_COLL,
    embedding_function=embedder,
    persist_directory=CHROMA_DIR,
)

# ─────────────── Flask app ───────────────
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ----------------- /api/users -----------------
@app.post("/api/users")
def upsert_user():
    data = request.get_json(silent=True) or {}
    clerk_id = data.get("clerkUserId")
    if not clerk_id:
        return jsonify({"message": "Clerk User ID is required."}), 400

    update = {k: v for k, v in data.items() if k in ("fullName", "email")}
    update["updatedAt"] = datetime.datetime.utcnow()

    result = users_col.update_one(
        {"clerkUserId": clerk_id},
        {"$set": update, "$setOnInsert": {"createdAt": update["updatedAt"]}},
        upsert=True,
    )
    user = users_col.find_one({"clerkUserId": clerk_id}, {"_id": 0})
    status = 201 if result.upserted_id else 200
    return jsonify({"message": "User saved.", "user": user}), status

# ----------------- /api/chats -----------------
@app.post("/api/chats")
def save_chat():
    data = request.get_json(silent=True) or {}
    clerk_id = data.get("clerkUserId")
    msgs     = data.get("messages") or []

    if not clerk_id or not msgs:
        return jsonify({"message": "Missing clerkUserId or messages array."}), 400

    # Always push to latest session (one doc per day per user → simple)
    today_key = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    doc = chats_col.find_one({"clerkUserId": clerk_id, "sessionKey": today_key})

    if doc:
        chats_col.update_one(
            {"_id": doc["_id"]}, {"$push": {"messages": {"$each": msgs}}}
        )
        chat = chats_col.find_one({"_id": doc["_id"]})
        return jsonify({"message": "Chat updated.", "chatId": str(chat["_id"])}), 200
    else:
        new_id = chats_col.insert_one(
            {
                "clerkUserId": clerk_id,
                "sessionKey": today_key,
                "messages": msgs,
                "createdAt": datetime.datetime.utcnow(),
            }
        ).inserted_id
        return jsonify({"message": "New chat created.", "chatId": str(new_id)}), 201

# ----------------- /api/chat (RAG) -----------------
@app.post("/api/chat")
def rag_chat():
    data = request.get_json(silent=True) or {}
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "Missing question."}), 400

    # 1. Retrieve docs
    docs = vectorstore.similarity_search(question, k=5)
    context = "\n---\n".join(d.page_content for d in docs) or "No context."

    # 2. Build prompt
    prompt = f"""
You are Pedri González, the Barcelona midfield maestro. 
Use Barça flair and say "Visca el Barça!" sometimes.

Context:
{context}

Question:
{question}

Answer:
""".strip()

    # 3. Invoke Gemini
    answer = llm.invoke(prompt).content

    return jsonify(
        {
            "answer": answer,
            "context": [
                {"text": d.page_content, "metadata": d.metadata} for d in docs
            ],
        }
    )

# ----------------- run -----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=PORT, debug=True)
