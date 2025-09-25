package br.appLogin.appLogin;

import br.appLogin.appLogin.model.Cargo;
import br.appLogin.appLogin.model.Usuario;
import br.appLogin.appLogin.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;

@SpringBootApplication
public class AppLoginApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppLoginApplication.class, args);
    }

    @Bean
    public CommandLineRunner adicionarUsuariosDeTeste(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Lógica para criar o usuário FUNCIONARIO
            String emailFuncionario = "usuario.teste@vivo.com.br";
            if (repository.findByEmail(emailFuncionario).isEmpty()) {
                Usuario funcionario = new Usuario();
                funcionario.setEmail(emailFuncionario);
                // Criptografa a senha antes de salvar no banco de dados
                funcionario.setSenha(passwordEncoder.encode("vivolevelup"));
                funcionario.setNome("Guilherme Funcionario");
                funcionario.setSetor("TI");
                funcionario.setCargo(Cargo.FUNCIONARIO);
                funcionario.setCreated_at(new Date());
                repository.save(funcionario);
                System.out.println("Usuário FUNCIONARIO de teste criado com sucesso!");
            } else {
                System.out.println("Usuário FUNCIONARIO de teste já existe.");
            }

            // Lógica para criar o usuário GESTOR
            String emailGestor = "gestor.teste@vivo.com.br";
            if (repository.findByEmail(emailGestor).isEmpty()) {
                Usuario gestor = new Usuario();
                gestor.setEmail(emailGestor);
                gestor.setSenha(passwordEncoder.encode("vivogestor"));
                gestor.setNome("Ana Gestora");
                gestor.setSetor("Gestão");
                gestor.setCargo(Cargo.GESTOR);
                gestor.setCreated_at(new Date());
                repository.save(gestor);
                System.out.println("Usuário GESTOR de teste criado com sucesso!");
            } else {
                System.out.println("Usuário GESTOR de teste já existe.");
            }
        };
    }
}