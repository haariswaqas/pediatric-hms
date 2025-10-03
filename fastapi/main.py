from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import uuid

from langchain_huggingface import HuggingFaceEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Medical Chatbot API", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:8001", "http://127.0.0.1:8000", "http://127.0.0.1:8005", "http://127.0.0.1:8100"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    conversation_history: List[ChatMessage]

# Global variables
DB_FAISS_PATH = "vectorstore/db_faiss"
vectorstore = None
conversation_sessions = {}  # Store conversation chains by session_id

def load_vectorstore():
    """Load the FAISS vectorstore"""
    global vectorstore
    if vectorstore is None:
        embedding_model = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
        vectorstore = FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)
    return vectorstore

def create_conversational_chain():
    """Create a new conversational chain"""
    custom_template = """You are a helpful medical assistant chatbot. Use the following pieces of medical information and the conversation history to answer the user's question in a friendly, conversational way.

If the user is referring to something from earlier in the conversation, use the chat history to understand what they're talking about.

Medical Information:
{context}

Chat History:
{chat_history}

Current Question: {question}

Guidelines:
- Be warm and helpful, like talking to a friend
- Use the chat history to understand references to previous topics
- If you don't have specific information, say "I don't have that information in my knowledge base"
- Keep answers focused and practical
- Always remind users to consult healthcare professionals for personal medical advice

Helpful Answer:"""

    prompt = PromptTemplate(
        input_variables=["context", "chat_history", "question"],
        template=custom_template
    )
    
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="answer"
    )
    
    chain = ConversationalRetrievalChain.from_llm(
        llm=ChatGroq(
            model_name="meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature=0.1,
            groq_api_key=os.environ["GROQ_API_KEY"],
        ),
        retriever=vectorstore.as_retriever(search_kwargs={'k': 4}),
        memory=memory,
        return_source_documents=True,
        combine_docs_chain_kwargs={"prompt": prompt},
        verbose=False
    )
    
    return chain

@app.on_event("startup")
async def startup_event():
    """Initialize vectorstore on startup"""
    try:
        load_vectorstore()
        print("✅ Vectorstore loaded successfully")
    except Exception as e:
        print(f"❌ Failed to load vectorstore: {e}")
        raise

@app.get("/")
async def root():
    return {"message": "Medical Chatbot API is running!!!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "vectorstore_loaded": vectorstore is not None}

@app.post("/chat/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint"""
    try:
        # Generate session_id if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Get or create conversation chain for this session
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = create_conversational_chain()
        
        chain = conversation_sessions[session_id]
        
        # Get response from chatbot
        response = chain.invoke({'question': request.message})
        answer = response['answer']
        
        # Add disclaimer
        disclaimer = "\n\nPlease remember: This information is for educational purposes only. Always consult with a healthcare professional for personal medical advice."
        final_answer = answer + disclaimer
        
        # Get conversation history
        chat_history = []
        if hasattr(chain.memory, 'chat_memory') and hasattr(chain.memory.chat_memory, 'messages'):
            for msg in chain.memory.chat_memory.messages:
                role = "user" if msg.type == "human" else "assistant"
                chat_history.append(ChatMessage(role=role, content=msg.content))
        
        return ChatResponse(
            response=final_answer,
            session_id=session_id,
            conversation_history=chat_history
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.delete("/chat/{session_id}/")
async def clear_conversation(session_id: str):
    """Clear conversation history for a session"""
    if session_id in conversation_sessions:
        del conversation_sessions[session_id]
        return {"message": f"Conversation {session_id} cleared"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@app.get("/sessions")
async def get_active_sessions():
    """Get list of active session IDs"""
    return {"active_sessions": list(conversation_sessions.keys())}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)