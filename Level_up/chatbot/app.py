from flask import Flask, request, jsonify, render_template, send_from_directory
import os
from chatbot import chat

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static')

# Rota principal - Dashboard
@app.route("/")
def dashboard():
    return render_template("dash.html")

# Rotas para outras telas (você pode adicionar conforme suas telas)
@app.route("/missoes")
def missoes():
    return render_template("missoes.html") if os.path.exists("templates/missoes.html") else "Tela de Missões em desenvolvimento"

@app.route("/trilhas")
def trilhas():
    return render_template("trilhasconteudo.html") if os.path.exists("templates/trilhasconteudo.html") else "Tela de Trilhas em desenvolvimento"

@app.route("/feedback") 
def feedback():
    return render_template("feedback.html") if os.path.exists("templates/feedback.html") else "Tela de Feedback em desenvolvimento"

@app.route("/recompensas")
def recompensas():
    return render_template("recompensas.html") if os.path.exists("templates/recompensas.html") else "Tela de Recompensas em desenvolvimento"
@app.route("/avatar")
def avatar():
    return render_template("tela_avatar.html") if os.path.exists("templates/tela_avatar.html") else "Tela de Avatar em desenvolvimento"
@app.route("/inicio")
def inicio():
    return render_template("tela_inicio.html") if os.path.exists("templates/tela_inicio.html") else "Tela de Avatar em desenvolvimento"


# Rota da API do chatbot
@app.route("/chat", methods=["POST"])
def chat_route():
    try:
        data = request.json
        if not data:
            return jsonify({"erro": "Dados JSON inválidos"}), 400
            
        pergunta = data.get("pergunta", "")
        if not pergunta.strip():
            return jsonify({"erro": "Pergunta não pode estar vazia"}), 400
            
        resposta = chat(pergunta)
        return jsonify({"resposta": resposta})
    
    except Exception as e:
        print(f"❌ Erro no chat: {str(e)}")
        return jsonify({"erro": f"Erro interno: {str(e)}"}), 500

# Rota para servir arquivos estáticos adicionais (se necessário)
@app.route('/assets/<path:filename>')
def assets(filename):
    return send_from_directory('static', filename)

if __name__ == "__main__":
    # Verificar estrutura de arquivos
    required_files = {
        'templates/dash.html': 'templates/dash.html',
        'static/chat.js': 'static/chat.js', 
        'static/chat-style.css': 'static/chat-style.css',
        'chatbot.py': 'chatbot.py'
    }
    
    missing_files = []
    found_files = []
    
    for display_name, file_path in required_files.items():
        if os.path.exists(file_path):
            found_files.append(display_name)
        else:
            missing_files.append(display_name)
    
    if found_files:
        print("✅ Arquivos encontrados:", found_files)
    
    if missing_files:
        print(f"⚠️ Arquivos não encontrados: {missing_files}")
    
    # Verificar se há outras telas disponíveis
    other_templates = []
    if os.path.exists('templates'):
        for file in os.listdir('templates'):
            if file.endswith('.html') and file != 'dash.html':
                other_templates.append(file)
    
    if other_templates:
        print(f"📄 Outras telas encontradas: {other_templates}")
    
    print("🚀 Iniciando servidor Flask...")
    print("📁 Diretório atual:", os.getcwd())
    print("🌐 Servidor disponível em: http://127.0.0.1:5000")
    print("💬 Chatbot integrado em todas as telas!")
    print("🔗 Rotas disponíveis:")
    print("   - / (Dashboard)")
    print("   - /missoes") 
    print("   - /trilhas")
    print("   - /feedback")
    print("   - /recompensas")
    print("-" * 50)
    
    app.run(debug=True, host="127.0.0.1", port=5000)