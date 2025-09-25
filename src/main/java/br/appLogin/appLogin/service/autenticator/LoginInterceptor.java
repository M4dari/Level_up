package br.appLogin.appLogin.service.autenticator;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // A lógica de verificação de login vai aqui.
        // Por enquanto, vamos considerar que um usuário está logado se a sessão tiver um atributo 'usuarioLogado'.
        if (request.getSession().getAttribute("usuarioLogado") != null) {
            // Se o usuário está logado, permite que a requisição continue.
            return true;
        }

        // Se o usuário não está logado, redireciona para a página de login.
        response.sendRedirect("/login");
        return false;
    }
}
