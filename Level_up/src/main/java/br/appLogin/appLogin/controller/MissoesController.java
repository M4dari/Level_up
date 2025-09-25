package br.appLogin.appLogin.controller;

import org.springframework.web.bind.annotation.GetMapping;

public class MissoesController {
    @GetMapping("/missoes.html")
    public String missoes() {
        return "missoes";
    }
}
