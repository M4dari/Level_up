import chromadb
from sentence_transformers import SentenceTransformer
import os

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "documentos_vivo"

def debug_banco():
    """Debug completo do banco ChromaDB"""
    try:
        print("🔍 Debugando banco ChromaDB...")
        
        # Verificar se a pasta do banco existe
        if not os.path.exists(CHROMA_PATH):
            print(f"❌ Pasta {CHROMA_PATH} não existe!")
            return
        
        # Conectar ao banco
        chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        chroma_collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
        
        # Informações básicas
        count = chroma_collection.count()
        print(f"📊 Total de documentos: {count}")
        
        if count == 0:
            print("❌ Banco está vazio!")
            return
        
        # Pegar alguns documentos para análise
        resultados = chroma_collection.get(limit=3)
        
        print(f"\n📋 Primeiros 3 documentos:")
        for i, doc in enumerate(resultados['documents'][:3]):
            print(f"{i+1}. {doc[:150]}...")
        
        # Teste de busca simples
        print(f"\n🧪 Testando busca por 'onboarding'...")
        
        # Carregar o modelo atual (mesmo do chatbot)
        print("🔄 Carregando modelo de embedding...")
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Gerar embedding da pergunta
        pergunta = "onboarding"
        question_embedding = embedding_model.encode([pergunta]).tolist()
        
        # Fazer busca
        busca_resultados = chroma_collection.query(
            query_embeddings=question_embedding,
            n_results=3
        )
        
        documentos_encontrados = busca_resultados['documents'][0]
        distancias = busca_resultados['distances'][0]
        
        print(f"📍 Documentos encontrados: {len(documentos_encontrados)}")
        
        if documentos_encontrados:
            print("✅ BUSCA FUNCIONOU!")
            for i, (doc, dist) in enumerate(zip(documentos_encontrados, distancias)):
                print(f"{i+1}. (Distância: {dist:.3f}) {doc[:100]}...")
        else:
            print("❌ BUSCA NÃO RETORNOU RESULTADOS!")
            
        # Teste com diferentes palavras-chave
        print(f"\n🧪 Testando outras palavras-chave...")
        palavras_teste = ["vivo", "empresa", "trabalho", "colaborador"]
        
        for palavra in palavras_teste:
            try:
                word_embedding = embedding_model.encode([palavra]).tolist()
                resultado_teste = chroma_collection.query(
                    query_embeddings=word_embedding,
                    n_results=1
                )
                
                if resultado_teste['documents'][0]:
                    print(f"✅ '{palavra}': Encontrou documento")
                else:
                    print(f"❌ '{palavra}': Não encontrou")
            except:
                print(f"❌ '{palavra}': Erro na busca")
                
    except Exception as e:
        print(f"❌ Erro no debug: {str(e)}")
        import traceback
        traceback.print_exc()

def reindexar_com_modelo_correto():
    """Reindexar documentos com o modelo correto"""
    print("\n" + "="*50)
    print("🔄 REINDEXAÇÃO COM MODELO CORRETO")
    print("="*50)
    
    try:
        # 1. Limpar banco atual
        chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        
        try:
            chroma_client.delete_collection(name=COLLECTION_NAME)
            print("🗑️ Coleção antiga removida")
        except:
            print("ℹ️ Coleção não existia")
            
        # 2. Criar nova coleção
        chroma_collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
        print("✅ Nova coleção criada")
        
        # 3. Verificar se existe pasta de documentos
        if not os.path.exists('./documentos'):
            print("❌ Pasta 'documentos' não encontrada!")
            print("💡 Crie a pasta 'documentos' e coloque seus PDFs lá")
            return
            
        # 4. Verificar se há arquivos na pasta
        arquivos = [f for f in os.listdir('./documentos') if f.lower().endswith(('.pdf', '.txt', '.docx'))]
        if not arquivos:
            print("❌ Nenhum documento encontrado na pasta 'documentos'!")
            print("💡 Adicione arquivos PDF, TXT ou DOCX na pasta")
            return
            
        print(f"📁 Encontrados {len(arquivos)} arquivos: {arquivos}")
        
        # 5. Reindexar com LlamaIndex
        from llama_index.core import SimpleDirectoryReader
        from llama_index.core.node_parser import SentenceSplitter
        
        print("📁 Carregando documentos da pasta...")
        documentos = SimpleDirectoryReader(input_dir='documentos')
        docs = documentos.load_data()
        
        print(f"📄 {len(docs)} páginas carregadas")
        
        # 6. Dividir em chunks
        node_parser = SentenceSplitter(chunk_size=350)
        nodes = node_parser.get_nodes_from_documents(docs, show_progress=True)
        
        print(f"📝 {len(nodes)} chunks criados")
        
        # 7. Gerar embeddings com modelo correto
        print("🔄 Carregando modelo de embedding...")
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        ids = [node.id_ for node in nodes]
        documents = [node.text for node in nodes]
        metadatas = [node.metadata for node in nodes]
        
        print("🔄 Gerando embeddings...")
        embeddings = embedding_model.encode(documents, batch_size=16, show_progress_bar=True).tolist()
        
        # 8. Adicionar ao ChromaDB
        print("💾 Salvando no banco...")
        chroma_collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
            embeddings=embeddings
        )
        
        print(f"✅ {len(documents)} chunks reindexados com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro na reindexação: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 DIAGNÓSTICO DO CHATBOT")
    print("="*50)
    
    debug_banco()
    
    print(f"\n" + "="*50)
    resposta = input("❓ Deseja reindexar com o modelo correto? (s/n): ").lower().strip()
    
    if resposta == 's':
        reindexar_com_modelo_correto()
        print("\n🧪 Testando novamente após reindexação...")
        debug_banco()
    else:
        print("💡 Para resolver o problema, execute este script novamente e escolha 's'")
        print("💡 Ou ajuste o modelo no chatbot.py para usar o mesmo modelo dos embeddings originais")