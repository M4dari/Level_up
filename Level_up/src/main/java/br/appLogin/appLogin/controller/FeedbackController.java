package br.appLogin.appLogin.controller;

import org.springframework.web.bind.annotation.GetMapping;

public class FeedbackController {
    @GetMapping("/feedback.html")
    public String feedback(){
        return "feedback";
    }
}
