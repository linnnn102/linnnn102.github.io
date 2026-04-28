package com.linju.portfolio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("name", "Lin Ju");
        model.addAttribute("title", "Software Developer | Data Engineer | AI Researcher");
        model.addAttribute("email", "jl1319131@gmail.com");
        model.addAttribute("linkedin", "https://linkedin.com/in/linnnnj");
        model.addAttribute("github", "https://github.com/linnnn102");
        return "index";
    }
}
