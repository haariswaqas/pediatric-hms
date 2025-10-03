import os

from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

## Uncomment the following files if you're not using pipenv as your virtual environment manager
from dotenv import load_dotenv
load_dotenv()


# Step 1: Setup LLM (Mistral with HuggingFace)
HF_TOKEN=os.environ.get("HF_TOKEN")
HUGGINGFACE_REPO_ID="mistralai/Mistral-7B-Instruct-v0.3"

if not HF_TOKEN:
    raise EnvironmentError(
        "HF_TOKEN environment variable is not set. Export your HuggingFace API token as HF_TOKEN before running this script."
    )

def load_llm(huggingface_repo_id):
    llm = HuggingFaceEndpoint(
        repo_id=huggingface_repo_id,
        temperature=0.5,
        max_new_tokens=512,
        huggingfacehub_api_token=HF_TOKEN,
    )
    return llm

# Step 2: Connect LLM with FAISS and Create chain

# Replace CUSTOM_PROMPT_TEMPLATE in both medibot.py and connect_memory_with_llm.py with:

CUSTOM_PROMPT_TEMPLATE = """
You are a helpful medical assistant chatbot. Answer the user's question in a friendly, conversational way using the medical information provided.

Guidelines:
- Be warm and helpful like you're talking to a friend
- Use simple, clear language that anyone can understand
- If you don't know something from the provided context, just say "I don't have that specific information in my knowledge base"
- Keep your answers focused and practical
- Don't mention "context" or "documents" - just provide the answer naturally

Medical Information:
{context}

Question: {question}

Answer in a friendly, conversational tone:
"""

def set_custom_prompt(custom_prompt_template):
    prompt=PromptTemplate(template=custom_prompt_template, input_variables=["context", "question"])
    return prompt

# Load Database
DB_FAISS_PATH="vectorstore/db_faiss"
embedding_model=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db=FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)

# Create QA chain
qa_chain=RetrievalQA.from_chain_type(
    llm=load_llm(HUGGINGFACE_REPO_ID),
    chain_type="stuff",
    retriever=db.as_retriever(search_kwargs={'k':3}),
    return_source_documents=True,
    chain_type_kwargs={'prompt':set_custom_prompt(CUSTOM_PROMPT_TEMPLATE)}
)

# Now invoke with a single query
user_query=input("Write Query Here: ")
response=qa_chain.invoke({'query': user_query})
print("RESULT: ", response["result"])
print("SOURCE DOCUMENTS: ", response["source_documents"])
