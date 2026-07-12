# Architecture

## Client-Server Interaction
Smart Recall uses a standard Client-Server architecture. The React Native frontend communicates with the FastAPI backend exclusively through RESTful JSON APIs. 

Authentication is handled via stateless JWT (JSON Web Tokens). The frontend persists the token in `AsyncStorage` and attaches it to the `Authorization: Bearer` header of every secure API request.

## Frontend Architecture
The frontend is built with React Native and Expo. It uses a component-driven architecture based on a custom Design System. State is primarily managed locally within screens, with global authentication state managed by React Context (`AuthContext`).

See [FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md) for detailed frontend folder breakdowns.

## Backend Architecture
The backend is a FastAPI application running on Uvicorn. It follows a modular structure separated into routing (`routes/`), business logic, and database models (`models/`).

### Key Flows
1. **Note Ingestion**: When a note is submitted, the backend generates an embedding vector using a pre-trained HuggingFace model. It then calls the Google Gemini API to extract a summary and generate categorical tags. The raw content, vector, and metadata are saved to PostgreSQL.
2. **Semantic Search**: When searching, the backend embeds the query string into a vector, and queries PostgreSQL (via `pgvector`) using Cosine Similarity to find nearest neighbors.
3. **RAG Chat**: Chat messages are passed to Gemini along with a context window of the user's top-matching semantic notes, allowing the AI to answer questions about the user's data.

## Database Schema
- **Users**: Authentication credentials and profiles.
- **Notes**: Contains text content, summary, category, JSON array of tags, and a `pgvector` embedding array.
- **Reminders**: Scheduled nudges and alert states.
