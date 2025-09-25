package br.appLogin.appLogin.controller;

import org.springframework.web.bind.annotation.GetMapping;

public class TrilhasController {
    @GetMapping("/trilhasconteudo.html")
    public String trilhas(){
        return "trilhasconteudo";
    }
}
