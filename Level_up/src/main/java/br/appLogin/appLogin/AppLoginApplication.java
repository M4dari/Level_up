package br.appLogin.appLogin;

import br.appLogin.appLogin.model.Usuario;
import br.appLogin.appLogin.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Date;

@SpringBootApplication
public class AppLoginApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppLoginApplication.class, args);
    }

    @Bean
    public CommandLineRunner adicionarUsuarioDeTeste(UsuarioRepository repository) {
        return args -> {
            Usuario usuario = new Usuario("usuario.teste@vivo.com.br", "vivolevelup");
            usuario.setNome("Guilherme");
            usuario.setSetor("TI");
            usuario.setCreated_at(new Date());

            if (repository.findByEmail(usuario.getEmail()).isEmpty()) {
                repository.save(usuario);
                System.out.println("Usuário de teste 'usuario.teste@vivo.com.br' criado com sucesso!");
            } else {
                System.out.println("Usuário de teste já existe.");
            }
        };
    }
}