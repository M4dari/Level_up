package br.appLogin.appLogin.repository;

import br.appLogin.appLogin.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailAndSenha(String email, String senha);

    Optional<Usuario> findByEmail(String email);

//    Usuario findById(long id);
//
//    @Query(value="select * from USUARIO where email = :email and senha = :senha", nativeQuery = true)
//    public Usuario login(String email, String senha);
}
