package com.homease.backend.controller;

import com.homease.backend.entity.Provider;
import com.homease.backend.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminProviderController {

    @Autowired
    private ProviderRepository providerRepository;

    @GetMapping("/providers")
    public ResponseEntity<?> getAllProviders() {
        List<Provider> providers = providerRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", providers));
    }

    @PostMapping("/provider/approve")
    public ResponseEntity<?> approveProvider(@RequestBody Map<String, Long> request) {
        Long id = request.get("id");
        Provider provider = providerRepository.findById(id).orElse(null);
        if (provider == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Provider not found"));
        }

        // Toggle approval status
        provider.setIsApproved(!provider.getIsApproved());
        providerRepository.save(provider);

        String status = provider.getIsApproved() ? "approved" : "revoked";
        return ResponseEntity.ok(Map.of("success", true, "message", "Provider access " + status));
    }
}
