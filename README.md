

# Coach Pedri – AI-Powered Football Chatbot

**Coach Pedri** is a conversational football assistant that allows users to explore modern football tactics, rules, history, and legendary matches. It uses a powerful **Retrieval-Augmented Generation (RAG)** pipeline built with **LangChain**, **Gemini API**, and **Chroma DB**, enabling accurate and context-aware answers based on real football documents and data.

---
<img width="1918" height="912" alt="image" src="https://github.com/user-attachments/assets/c7cfac2c-420c-48a8-9f02-8054a0517544" />


https://github.com/user-attachments/assets/aebd8387-4443-4a1c-aef5-0c998639ebc2


## Features

* **Conversational Football Knowledge** powered by LangChain + Gemini API
* **RAG-Based Retrieval** using Chroma DB for relevant document-based answers
* **Multi-format Document Ingestion**:

  * CSV files (e.g., El Clásico match data)
  * PDF files (e.g., FIFA rulebooks)
  * Web URLs (e.g., Wikipedia articles)
* **Secure Authentication** with Clerk
* **Frontend** built with React for an interactive and user-friendly interface
* **Backend** built with Flask (Python) for AI logic, document ingestion, and API handling
* **MongoDB Integration** to store user chats and metadata

---

## Unique Capabilities

Due to its RAG-based architecture and rich document set, **Coach Pedri** can:

* **Answer Updated Football Rules**: Includes the official **FIFA Laws of the Game (2025)** in PDF format, so users get the latest rule explanations.
* **Discuss El Clásico History**: Powered by a **CSV dataset of 20 El Clásico matches**, allowing the bot to provide match-specific statistics and historical context.
* **Talk About Pedri**: Uses a **Wikipedia page about Pedri**, enabling biographical, club, and performance-related insights.
* **Answer Current Event Questions**: For example, **"Who won the UEFA Euro 2024?"**—enabled through ingestion of updated online sources.

---

## Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| AI Engine        | LangChain, Gemini Pro API           |
| Vector Store     | Chroma DB                           |
| Document Loaders | CSVLoader, PDFLoader, WebBaseLoader |
| Frontend         | React                               |
| Backend          | Flask (Python)                      |
| Authentication   | Clerk.dev                           |
| Database         | MongoDB Atlas                       |

---

## Sample Queries

* "What are the latest offside rules according to FIFA 2025?"
* "Who scored in the 2022 El Clásico and what was the final score?"
* "Tell me about Pedri’s international career."
* "Who won the UEFA Euro 2024 and what was the final match summary?"

---

## License

This project is licensed under the **MIT License**.

---

## Contact

**Author**: Sahil Chalke


---

