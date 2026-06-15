package com.homease.backend.controller;

import com.homease.backend.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/service")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @GetMapping("/list")
    public ResponseEntity<?> getServices() {
        return ResponseEntity.ok(Map.of("success", true, "data", serviceService.getAllServices()));
    }

    @org.springframework.web.bind.annotation.PostMapping("/add")
    public ResponseEntity<?> addService(
            @org.springframework.web.bind.annotation.RequestParam("name") String name,
            @org.springframework.web.bind.annotation.RequestParam("description") String description,
            @org.springframework.web.bind.annotation.RequestParam("price") Double price,
            @org.springframework.web.bind.annotation.RequestParam("category") String category,
            @org.springframework.web.bind.annotation.RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {

        try {
            serviceService.addService(name, description, price, category, image);
            return ResponseEntity.ok(Map.of("success", true, "message", "Service Added"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Error adding service"));
        }
    }

    @org.springframework.web.bind.annotation.PostMapping("/remove")
    public ResponseEntity<?> removeService(
            @org.springframework.web.bind.annotation.RequestBody Map<String, String> body) {
        try {
            String id = body.get("id");
            serviceService.removeService(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Service Removed"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Error removing service"));
        }
    }
}
