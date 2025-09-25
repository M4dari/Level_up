package br.appLogin.appLogin.controller;

import org.springframework.web.bind.annotation.GetMapping;

public class RecompensaController {
    @GetMapping("/recompensas.html")
    public String recompensa(){
        return "recompensas";
    }
}
