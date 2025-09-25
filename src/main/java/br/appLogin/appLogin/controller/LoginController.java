package br.appLogin.appLogin.controller;

import br.appLogin.appLogin.model.Cargo;
import br.appLogin.appLogin.model.Usuario;
import br.appLogin.appLogin.repository.UsuarioRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Controller
public class LoginController {

//    @Autowired
//    private UsuarioRepository ur;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;

    @GetMapping("/login")
    public String showloginPage() {
        return "login";
    }

//    // Processo de login (Verficação de cargo * Gestor ou nao *)
//    @PostMapping("/login")
//    public String processLogin(@RequestParam String email, @RequestParam String senha, Model model, HttpSession session) {
//        Optional<Usuario> usuarioOptional = ur.findByEmail(email);
//        if (usuarioOptional.isPresent()) {
//            Usuario usuario = usuarioOptional.get();
//            if (passwordEncoder.matches(senha, usuario.getSenha())) {
//                session.setAttribute("usuarioLogado", usuario);
//                if (usuario.getCargo() == Cargo.GESTOR) {
//                    return "redirect:/tela_gestor";
//                } else {
//                    return "redirect:/tela_inicio";
//                }
//            }
//        }
//        // Adiciona mensagem de erro ao modelo e retorna para tela de login
//        model.addAttribute("erro", "Usuário ou senha inválidos.");
//        return "login";
//    }

    @GetMapping("/tela_inicio")
    public String showHomePage() {
        return "tela_inicio";
    }

    @GetMapping("/sair")
    public String sair(HttpSession session) {
        // Invalida a sessão, removendo todos os atributos dela
        session.invalidate();
        // Redireciona o usuário para a página de login
        return "redirect:/login";
    }

    @GetMapping("/dash.html")
    public String showDashboardPage() {
        return "dash"; //
    }

    @GetMapping("/missoes.html")
    public String showMissoesPage() {
        return "missoes"; //
    }

    @GetMapping("/trilhasconteudo.html")
    public String showTrilhasPage() {
        return "trilhasconteudo"; //
    }

    @GetMapping("/feedback.html")
    public String showFeedbackPage() {
        return "feedback"; //
    }

    @GetMapping("/recompensas.html")
    public String showRecompensasPage() {
        return "recompensas"; //
    }

    @GetMapping("/tela_gestor")
    public String showGestorPage() {
        return "tela_gestor";
    }
}
