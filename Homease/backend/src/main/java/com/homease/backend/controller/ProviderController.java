package com.homease.backend.controller;

import com.homease.backend.entity.Order;
import com.homease.backend.entity.Provider;
import com.homease.backend.service.ProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/provider")
@CrossOrigin(origins = "*")
public class ProviderController {

    @Autowired
    private ProviderService providerService;

    // ── Auth ──────────────────────────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Provider provider) {
        try {
            String token = providerService.register(provider);
            return ResponseEntity.ok(Map.of("success", true, "token", token,
                    "message", "Registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        try {
            String token = providerService.login(
                    payload.get("email"), payload.get("password"));
            return ResponseEntity.ok(Map.of("success", true, "token", token,
                    "message", "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(
            @RequestHeader("Authorization") String token) {
        Provider provider = auth(token);
        if (provider == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(providerService.getDashboardStats(provider.getId()));
    }

    // ── Available Jobs (broadcast to category) ────────────────────────────────

    @GetMapping("/available-jobs")
    public ResponseEntity<?> getAvailableJobs(
            @RequestHeader("Authorization") String token) {
        Provider provider = auth(token);
        if (provider == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(
                providerService.getAvailableJobs(provider.getCategory()));
    }

    // ── Accept a Job ──────────────────────────────────────────────────────────

    @PostMapping("/accept-order/{orderId}")
    public ResponseEntity<?> acceptOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        Provider provider = auth(token);
        if (provider == null) return ResponseEntity.status(401).build();
        try {
            Order order = providerService.acceptOrder(orderId, provider.getId());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Job accepted! Head to the customer location.",
                    "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── My Jobs ───────────────────────────────────────────────────────────────

    @GetMapping("/my-jobs")
    public ResponseEntity<?> getMyJobs(
            @RequestHeader("Authorization") String token) {
        Provider provider = auth(token);
        if (provider == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(providerService.getMyJobs(provider.getId()));
    }

    // ── Mark Out for Service ──────────────────────────────────────────────────

    @PostMapping("/out-for-service/{orderId}")
    public ResponseEntity<?> markOutForService(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        Provider provider = auth(token);
        if (provider == null) return ResponseEntity.status(401).build();
        try {
            Order order = providerService.markOutForService(orderId, provider.getId());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Status updated. Customer has been notified.",
                    "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Verify START OTP (customer → provider) ────────────────────────────────
    // Provider enters the OTP the customer sees in My Orders.
    // This marks the service as started.

    @PostMapping("/verify-start-otp")
    public ResponseEntity<?> verifyStartOtp(
            @RequestBody Map<String, String> payload,
            @RequestHeader("Authorization") String token) {
        Provider provider = auth(token);
        if (provider == null) return ResponseEntity.status(401).build();

        Long   orderId = Long.valueOf(payload.get("orderId"));
        String otp     = payload.get("otp");

        try {
            Order order = providerService.verifyStartOtp(orderId, otp, provider.getId());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "OTP verified! Service has officially started.",
                    "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Verify END OTP (customer → provider after work done) ──────────────────
    // After work is done, customer checks My Orders for the end OTP and tells provider.
    // This marks the job as completed.

    @PostMapping("/verify-end-otp")
    public ResponseEntity<?> verifyEndOtp(
            @RequestBody Map<String, String> payload,
            @RequestHeader("Authorization") String token) {
        Provider provider = auth(token);
        if (provider == null) return ResponseEntity.status(401).build();

        Long   orderId = Long.valueOf(payload.get("orderId"));
        String otp     = payload.get("otp");

        try {
            Order order = providerService.verifyEndOtp(orderId, otp, provider.getId());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Job completed! Thank you for your service.",
                    "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Toggle Online/Offline ─────────────────────────────────────────────────

    @PostMapping("/toggle-online")
    public ResponseEntity<?> toggleOnline(
            @RequestHeader("Authorization") String token) {
        Provider provider = auth(token);
        if (provider == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(providerService.toggleOnline(provider.getId()));
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @RequestHeader("Authorization") String token) {
        Provider provider = auth(token);
        if (provider == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(provider);
    }

    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Provider updatedData,
            @RequestHeader("Authorization") String token) {
        Provider provider = auth(token);
        if (provider == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(
                    providerService.updateProfile(provider.getId(), updatedData));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Auth helper ───────────────────────────────────────────────────────────

    private Provider auth(String bearerToken) {
        return providerService.getProviderByToken(
                bearerToken.replace("Bearer ", ""));
    }
}