// src/main/java/br/appLogin/appLogin/SecurityConfig.java
package br.appLogin.appLogin.security;

import br.appLogin.appLogin.model.Usuario;
import br.appLogin.appLogin.repository.UsuarioRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 1. UserDetailsService: Ensina o Spring a buscar usuários no seu banco de dados
    @Bean
    public UserDetailsService userDetailsService(UsuarioRepository usuarioRepository) {
        return email -> {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + email));

            return new User(
                    usuario.getEmail(),
                    usuario.getSenha(),
                    // Converte nosso Enum "Cargo" para uma "Authority" do Spring Security
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getCargo().name()))
            );
        };
    }

    // 2. AuthenticationSuccessHandler: Define o que fazer após o login bem-sucedido
    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        return (request, response, authentication) -> {
            // Verifica a autoridade (cargo) do usuário logado
            boolean isGestor = authentication.getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_GESTOR"));

            if (isGestor) {
                response.sendRedirect("/tela_gestor");
            } else {
                response.sendRedirect("/tela_inicio");
            }
        };
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    // SecurityFilterChain: Configura todas as regras de segurança
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AuthenticationSuccessHandler successHandler) throws Exception {
        System.out.println("--- [FilterChain] Configurando as regras de segurança HTTP.");
        http
                .authorizeHttpRequests(auth -> auth
                        // Permite acesso irrestrito a todos os arquivos estáticos
                        .requestMatchers("/css/**", "/js/**", "/images/**", "/assets/**").permitAll()

                        // Permite acesso livre à página de login
                        .requestMatchers("/login").permitAll()

                        // Qualquer outra requisição precisa de autenticação
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .usernameParameter("email")
                        .passwordParameter("senha")
                        .successHandler(successHandler)
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("/login?logout")
                        .permitAll()
                )
                .csrf(csrf -> csrf.disable());

        return http.build();
    }
}