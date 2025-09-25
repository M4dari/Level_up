package br.appLogin.appLogin;

import br.appLogin.appLogin.service.autenticator.LoginInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginInterceptor())
                // O interceptor será aplicado a todas as URLs que começam com /home
                .addPathPatterns("/tela_inicio")
                // Você pode adicionar mais caminhos aqui, como /dashboard, /perfil, etc.
                .addPathPatterns("/dash.html")
                .addPathPatterns("/recompensas.html")
                .addPathPatterns("/feedback.html")
                .addPathPatterns("/missoes.html")
                .addPathPatterns("/trilhasconteudo.html")

                // Exclui a página de login para evitar loops infinitos
                .excludePathPatterns("/login");
    }
}