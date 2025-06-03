package com.sach.mapstash.config; // Use your package name

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Apply CORS configuration to your API endpoints
                .allowedOrigins("http://localhost:3000") // Allow requests ONLY from your React app's origin
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Specify allowed HTTP methods
                .allowedHeaders("*") // Allow all headers
                .allowCredentials(false); // Set to true if you need cookies/auth headers later, but then allowedOrigins cannot be "*"
        // You can adjust maxAge for preflight request caching if needed
        // .maxAge(3600);
    }
}