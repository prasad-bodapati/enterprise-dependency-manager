package com.gradledeps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GradleDependencyManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(GradleDependencyManagerApplication.class, args);
    }
}