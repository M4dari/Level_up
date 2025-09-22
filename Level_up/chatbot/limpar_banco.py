# Script para limpar e verificar o banco ChromaDB
import chromadb
import os
import shutil

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "documentos_vivo"

def verificar_banco():
    """Verifica o status atual do banco"""
    try:
        chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        chroma_collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
        
        count = chroma_collection.count()
        print(f"📊 Total de documentos no banco: {count}")
        
        if count > 0:
            # Pegar alguns IDs para verificar duplicatas
            resultados = chroma_collection.get(limit=10)
            print(f"📋 Primeiros IDs: {resultados['ids'][:5]}...")
            
            # Verificar se há IDs duplicados padrão do LlamaIndex
            ids_duplicados = [id for id in resultados['ids'] if id.count('-') >= 4]  # IDs do LlamaIndex têm formato UUID
            if len(ids_duplicados) > 5:
                print("⚠️ POSSÍVEL DUPLICAÇÃO DETECTADA!")
                return True
        
        return False
        
    except Exception as e:
        print(f"❌ Erro ao verificar banco: {str(e)}")
        return False

def limpar_banco():
    """Remove completamente o banco ChromaDB"""
    try:
        if os.path.exists(CHROMA_PATH):
            shutil.rmtree(CHROMA_PATH)
            print("🗑️ Banco ChromaDB removido completamente!")
        else:
            print("ℹ️ Banco não existe, nada para limpar.")
        
        # Criar novo banco vazio
        chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        chroma_collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
        print("✅ Novo banco ChromaDB criado!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao limpar banco: {str(e)}")
        return False

def limpar_apenas_colecao():
    """Remove apenas a coleção, mantendo o banco"""
    try:
        chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        
        # Tentar deletar a coleção
        try:
            chroma_client.delete_collection(name=COLLECTION_NAME)
            print(f"🗑️ Coleção '{COLLECTION_NAME}' removida!")
        except:
            print("ℹ️ Coleção não existia.")
        
        # Criar nova coleção vazia
        chroma_collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
        print("✅ Nova coleção criada!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao limpar coleção: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔍 Verificando banco ChromaDB...")
    
    tem_duplicatas = verificar_banco()
    
    if tem_duplicatas:
        print("\n⚠️ RECOMENDAÇÃO: Limpar banco devido a possíveis duplicatas")
        print("\nOpções:")
        print("1 - Limpar apenas a coleção (recomendado)")
        print("2 - Limpar banco completo")
        print("3 - Manter como está")
        
        escolha = input("\nEscolha uma opção (1/2/3): ").strip()
        
        if escolha == "1":
            if limpar_apenas_colecao():
                print("\n✅ Coleção limpa! Agora você precisa reindexar seus documentos.")
        elif escolha == "2":
            if limpar_banco():
                print("\n✅ Banco limpo! Agora você precisa reindexar seus documentos.")
        else:
            print("\n📋 Mantendo banco como está.")
    else:
        print("\n✅ Banco parece estar OK!")
    
    print("\n" + "="*50)
    verificar_banco()