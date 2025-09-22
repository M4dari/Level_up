import os
from sentence_transformers import SentenceTransformer
import chromadb
from groq import Groq

# Configurações
GROQ_API = "chave "
CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "documentos_vivo"

# Função para inicializar os componentes
def inicializar_componentes():
    """Inicializa o ChromaDB, embedding model e Groq de forma segura"""
    try:
        # Inicializa o ChromaDB
        chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        chroma_collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
        
        # Verifica se a coleção tem documentos
        count = chroma_collection.count()
        if count == 0:
            print(f"⚠️ Coleção '{COLLECTION_NAME}' está vazia!")
            print("💡 Você precisa executar o processo de indexação primeiro.")
            print("💡 Execute: python indexar_documentos.py")
        else:
            print(f"✅ Coleção '{COLLECTION_NAME}' carregada com {count} documentos")
        
        # Inicializa o modelo de embeddings (modelo menor para ser mais rápido)
        print("🔄 Carregando modelo de embeddings (modelo otimizado)...")
        try:
            embedding_model = SentenceTransformer('all-MiniLM-L6-v2')  # Modelo menor e mais rápido
            print("✅ Modelo de embeddings carregado com sucesso!")
        except Exception as e:
            print(f"❌ Erro ao carregar modelo de embeddings: {str(e)}")
            return None, None, None
        
        # Inicializa o Groq
        print("🔄 Inicializando Groq...")
        llm = Groq(api_key=GROQ_API)
        print("✅ Groq inicializado!")
        
        print("🎉 Chatbot inicializado com sucesso!")
        
        return chroma_collection, embedding_model, llm
    
    except Exception as e:
        print(f"❌ Erro ao inicializar componentes: {str(e)}")
        return None, None, None

# Inicializar componentes globalmente (apenas quando importado)
print("🚀 Inicializando chatbot...")
chroma_collection, embedding_model, llm = inicializar_componentes()

def chat(question: str, top_k: int = 3) -> str:
    """
    Função que integra RAG: consulta documentos no Chroma, envia para Groq e retorna a resposta.
    """
    
    # Verificar se os componentes foram inicializados
    if not all([chroma_collection, embedding_model, llm]):
        return "❌ Erro: Sistema não inicializado corretamente. Verifique os logs do servidor e certifique-se que o banco tem documentos."
    
    try:
        # 1️⃣ Gera embedding da pergunta
        question_embedding = embedding_model.encode([question]).tolist()
        
        # 2️⃣ Consulta os documentos mais similares no Chroma
        resultados = chroma_collection.query(
            query_embeddings=question_embedding,
            n_results=top_k
        )
        
        # 3️⃣ Extrai os textos dos documentos
        docs_similares = resultados['documents'][0] if resultados['documents'] else []
        
        if not docs_similares:
            return "❌ Não encontrei documentos relacionados à sua pergunta. Tente reformular sua pergunta ou verifique se o banco de dados foi indexado corretamente."
        
        # 4️⃣ Monta o prompt para o Groq
        contexto = "\n\n".join([f"Documento {i+1}: {doc}" for i, doc in enumerate(docs_similares)])
        
        prompt = f"""Você é um assistente da Vivo que ajuda funcionários com dúvidas sobre onboarding e processos internos.

Use os documentos abaixo para responder à pergunta do usuário de forma clara e útil:

{contexto}

Pergunta: {question}

Resposta (seja claro, conciso e útil):"""
        
        # 5️⃣ Chama o Groq
        chat_completion = llm.chat.completions.create(
            messages=[
                {
                    "role": "system", 
                    "content": "Você é um assistente útil da Vivo que responde baseado nos documentos fornecidos. Seja claro, conciso e sempre helpful. Responda em português."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=1000,
            temperature=0.7
        )
        
        # 6️⃣ Retorna a resposta gerada
        resposta = chat_completion.choices[0].message.content
        return resposta
        
    except Exception as e:
        error_msg = f"Erro ao processar pergunta: {str(e)}"
        print(f"❌ {error_msg}")
        return f"❌ Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente em alguns instantes."

# Função para testar se o chatbot está funcionando
def testar_chatbot():
    """Função para testar o chatbot"""
    if not all([chroma_collection, embedding_model, llm]):
        print("❌ Componentes não inicializados")
        return False
    
    try:
        print("🧪 Testando chatbot...")
        resposta = chat("Como funciona o onboarding?")
        print(f"✅ Resposta do teste: {resposta[:150]}...")
        return True
    except Exception as e:
        print(f"❌ Erro no teste: {str(e)}")
        return False

# Executar teste se for chamado diretamente
if __name__ == "__main__":
    print("\n" + "="*50)
    print("🧪 MODO TESTE - Testando chatbot...")
    
    if testar_chatbot():
        print("✅ Chatbot funcionando corretamente!")
    else:
        print("❌ Chatbot com problemas!")
        print("\n💡 Possíveis soluções:")
        print("1. Execute: python limpar_banco.py")
        print("2. Reindexe seus documentos")
        print("3. Verifique sua API key do Groq")
    
    print("="*50)