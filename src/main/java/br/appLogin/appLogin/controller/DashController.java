package br.appLogin.appLogin.controller;

import org.springframework.web.bind.annotation.GetMapping;

public class DashController {
    @GetMapping("/dash.html")
    public String dashboard(){
        return "dash";
    }
}
