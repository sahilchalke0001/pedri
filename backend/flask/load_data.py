import os
from dotenv import load_dotenv

from youtube_transcript_api import YouTubeTranscriptApi
from langchain_core.documents import Document

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from langchain_community.document_loaders import (
    WebBaseLoader,
    PyPDFLoader,
    CSVLoader,
)

from langchain_community.vectorstores import Chroma


# ─────────────── ENV ───────────────
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

COLLECTION_NAME = os.getenv("MONGO_COLLECTION_NAME")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not all([COLLECTION_NAME, GOOGLE_API_KEY]):
    raise ValueError("❌ Missing required environment variables")

if "USER_AGENT" not in os.environ:
    os.environ["USER_AGENT"] = "sahil-rag-chatbot/1.0"


# ─────── Helper: YouTube Transcript ───────
def load_youtube_transcript(video_id: str) -> list[Document]:
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    text = " ".join([item["text"] for item in transcript])
    return [Document(page_content=text, metadata={"source": f"https://youtube.com/watch?v={video_id}"})]


# ─────────── LOAD SOURCES ───────────
print("📥 Preparing sources...")
documents = []

try:
    documents.extend(load_youtube_transcript("b5wiwAC3duY"))
    documents.extend(load_youtube_transcript("bKxOmPWe76w"))
except Exception as e:
    print(f"⚠️ Error loading YouTube transcripts: {e}")

for url in [
    "https://en.wikipedia.org/wiki/Pedri",
    "https://www.bbc.com/sport/football/articles/c23038lpv4mo",
]:
    try:
        loader = WebBaseLoader(url)
        documents.extend(loader.load())
    except Exception as e:
        print(f"⚠️ Error loading URL ({url}): {e}")

try:
    pdf_loader = PyPDFLoader(r"C:\Users\Sahil\Desktop\s\backend\data\Laws of the Game 2025_26.pdf")
    documents.extend(pdf_loader.load())
except Exception as e:
    print(f"⚠️ Error loading PDF: {e}")

try:
    csv_loader = CSVLoader(file_path=r"C:\Users\Sahil\Desktop\s\backend\data\el_clasico_matches.csv")
    documents.extend(csv_loader.load())
except Exception as e:
    print(f"⚠️ Error loading CSV: {e}")


# ───────── SPLIT DOCUMENTS ─────────
print("📥 Splitting documents into chunks...")
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(documents)
print(f"🧠 Total chunks: {len(chunks)}")

if chunks:
    print("📝 Sample chunk preview:", chunks[0].page_content[:200])


# ───────── EMBEDDING & CHROMA DB ─────────
embedder = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    api_key=GOOGLE_API_KEY,
)

# ✅ Ensure chroma_db folder exists and is visible in VS Code
chroma_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "chroma_db"))
os.makedirs(chroma_dir, exist_ok=True)
with open(os.path.join(chroma_dir, ".keep"), "w") as f:
    f.write("Ensure folder visibility in Git/VSCode.")

print(f"📂 Chroma DB path: {chroma_dir}")

# ✅ Create vectorstore and persist
try:
    if chunks:
        vstore = Chroma.from_documents(
            documents=chunks,
            embedding=embedder,
            persist_directory=chroma_dir,
            collection_name=COLLECTION_NAME,
        )
        vstore.persist()
        print("✅ Chunks embedded & stored successfully!")
    else:
        print("⚠️ No chunks to embed – nothing written.")
except Exception as e:
    print(f"❌ Error embedding documents: {e}")


# ─────── Verify Folder Contents ───────
print("📁 Files inside Chroma DB folder:")
for filename in os.listdir(chroma_dir):
    print("   └──", filename)
