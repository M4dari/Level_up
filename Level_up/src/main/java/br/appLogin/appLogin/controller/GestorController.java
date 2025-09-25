package br.appLogin.appLogin.controller;

import org.springframework.web.bind.annotation.GetMapping;

public class GestorController {
    @GetMapping("/gestor")
    public String gestor(){
        return "gestor";
    }
}
