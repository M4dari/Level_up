document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Chatbot JavaScript carregado!");

    const chatPopup = document.getElementById("chatPopup");
    const openBtn = document.getElementById("openChatBtn");
    const closeBtn = document.getElementById("closeChatBtn");
    const sendBtn = document.getElementById("sendBtn");
    const userInput = document.getElementById("userInput");
    const chatMessages = document.getElementById("chatMessages");

    // Verificar se todos os elementos foram encontrados
    const elements = { chatPopup, openBtn, closeBtn, sendBtn, userInput, chatMessages };
    const missingElements = Object.entries(elements).filter(([name, el]) => !el);

    if (missingElements.length > 0) {
        console.warn("❌ Elementos do chatbot não encontrados:", missingElements.map(([name]) => name));
        return;
    }

    console.log("✅ Todos os elementos do chatbot encontrados!");

    // Função para adicionar mensagem ao chat
    function appendMessage(sender, text, isError = false) {
        const wrapper = document.createElement("div");
        wrapper.className = sender === "user" ? "chat-msg user-msg" : "chat-msg bot-msg";

        if (isError) {
            wrapper.style.color = "#dc3545";
            wrapper.style.background = "#f8d7da";
            wrapper.style.border = "1px solid #f5c6cb";
        }

        // Escapar HTML para evitar XSS
        const escapedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        wrapper.innerHTML = `<strong>${sender === "user" ? "Você" : "Bot"}:</strong> ${escapedText}`;

        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        console.log(`💬 Mensagem adicionada - ${sender}: ${text.substring(0, 50)}...`);
    }

    // Função para mostrar indicador de digitação
    function showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.className = "chat-msg bot-msg typing-indicator";
        typingDiv.id = "typingIndicator";
        typingDiv.innerHTML = `<strong>Bot:</strong> <span class="typing-dots">Digitando...</span>`;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Função para remover indicador de digitação
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById("typingIndicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Abrir chat
    openBtn.addEventListener("click", () => {
        console.log("🔓 Abrindo chat");
        chatPopup.style.display = "block";
        chatPopup.setAttribute("aria-hidden", "false");
        userInput.focus();

        // Animação suave
        chatPopup.style.opacity = "0";
        chatPopup.style.transform = "translateY(10px)";

        setTimeout(() => {
            chatPopup.style.opacity = "1";
            chatPopup.style.transform = "translateY(0)";
            chatPopup.style.transition = "all 0.3s ease";
        }, 10);
    });

    // Fechar chat
    closeBtn.addEventListener("click", () => {
        console.log("🔒 Fechando chat");
        chatPopup.style.display = "none";
        chatPopup.setAttribute("aria-hidden", "true");
    });

// Função para enviar mensagem
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) {
            console.warn("⚠️ Mensagem vazia, não enviando");
            return;
        }

        console.log("📤 Enviando mensagem:", message);

        // Adicionar mensagem do usuário
        appendMessage("user", message);
        userInput.value = "";
        userInput.focus();

        // Mostrar indicador de digitação
        showTypingIndicator();

        try {
            // Log corrigido para refletir a nova rota
            console.log("🔄 Fazendo requisição para http://localhost:5000/chat...");

            // Requisição fetch com URL e body CORRIGIDOS
            const resp = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                // A chave do JSON agora é "pergunta", como o backend espera
                body: JSON.stringify({ pergunta: message })
            });

            console.log("📡 Status da resposta:", resp.status, resp.statusText);

            if (!resp.ok) {
                const errorText = await resp.text();
                // A mensagem de erro para 404 agora será mais precisa
                if (resp.status === 404) {
                    throw new Error(`HTTP ${resp.status}: Rota não encontrada. Verifique se a URL no chat.js está correta.`);
                }
                throw new Error(`HTTP ${resp.status}: ${errorText}`);
            }

            const data = await resp.json();
            console.log("📥 Dados recebidos:", data);

            // Remover indicador de digitação
            removeTypingIndicator();

            const botReply = data.resposta || data.response || "Desculpe, não recebi uma resposta válida.";
            appendMessage("bot", botReply);

        } catch (err) {
            console.error("❌ Erro no envio do chat:", err);

            // Remover indicador de digitação
            removeTypingIndicator();

            let errorMessage = "Erro: não foi possível enviar a mensagem.";

            if (err.message.includes("fetch")) {
                errorMessage = "Erro: não foi possível conectar ao servidor. Verifique se o Flask está rodando.";
            } else if (err.message.includes("HTTP 500")) {
                errorMessage = "Erro interno do servidor. Verifique os logs do Flask.";
            } else if (err.message.includes("HTTP 404")) {
                errorMessage = "Erro: rota não encontrada. Verifique o endereço no arquivo chat.js.";
            } else if (err.message.includes("HTTP 400")){
                errorMessage = "Erro na requisição: A pergunta não pode estar vazia ou o formato é inválido.";
            }


            appendMessage("bot", errorMessage, true);
        }
    }

    // Event listeners
    sendBtn.addEventListener("click", sendMessage);

    // Enviar com Enter
    userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Fechar chat clicando fora
    document.addEventListener("click", (e) => {
        if (chatPopup.style.display === "block" &&
            !chatPopup.contains(e.target) &&
            !openBtn.contains(e.target)) {
            closeBtn.click();
        }
    });

    // Função de teste da conexão
    async function testConnection() {
        try {
            const resp = await fetch("http://localhost:5000/api/app", { method: "POST" });
            if (resp.ok) {
                console.log("✅ Conexão com o servidor OK");
                return true;
            }
        } catch (err) {
            console.error("❌ Erro de conexão:", err);
            return false;
        }
    }

    // Testar conexão na inicialização
    testConnection();

    console.log("✅ Chatbot inicializado com sucesso!");
});