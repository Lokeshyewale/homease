package com.homease.backend.service;

import com.homease.backend.entity.Order;
import com.homease.backend.entity.Provider;
import com.homease.backend.repository.OrderRepository;
import com.homease.backend.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProviderService {

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    // ── Auth ──────────────────────────────────────────────────────────────────

    public String register(Provider provider) {
        if (providerRepository.findByEmail(provider.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        provider.setPassword(passwordEncoder.encode(provider.getPassword()));
        String token = UUID.randomUUID().toString();
        provider.setToken(token);
        providerRepository.save(provider);
        return token;
    }

    public String login(String email, String password) {
        Optional<Provider> providerOpt = providerRepository.findByEmail(email);
        if (providerOpt.isEmpty()) throw new RuntimeException("Provider not found");

        Provider provider = providerOpt.get();
        if (!passwordEncoder.matches(password, provider.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        String token = UUID.randomUUID().toString();
        provider.setToken(token);
        providerRepository.save(provider);
        return token;
    }

    public Provider getProviderByToken(String token) {
        return providerRepository.findAll().stream()
                .filter(p -> token.equals(p.getToken()))
                .findFirst()
                .orElse(null);
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────

    public Map<String, Object> getDashboardStats(Long providerId) {
        List<Order> jobs = orderRepository.findByProvider_Id(providerId);

        double totalEarnings = jobs.stream()
                .filter(j -> "service_completed".equals(j.getTrackingStatus()))
                .mapToDouble(Order::getAmount)
                .sum();
        long completedJobs = jobs.stream()
                .filter(j -> "service_completed".equals(j.getTrackingStatus()))
                .count();
        long activeJobs = jobs.stream()
                .filter(j -> List.of("provider_assigned", "out_for_service", "service_started")
                        .contains(j.getTrackingStatus()))
                .count();

        // Average rating from rated orders
        double avgRating = jobs.stream()
                .filter(j -> Boolean.TRUE.equals(j.getRatingSubmitted())
                        && j.getProviderRating() != null)
                .mapToInt(Order::getProviderRating)
                .average()
                .orElse(0.0);
        long totalRatings = jobs.stream()
                .filter(j -> Boolean.TRUE.equals(j.getRatingSubmitted()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEarnings", totalEarnings);
        stats.put("completedJobs", completedJobs);
        stats.put("activeJobs", activeJobs);
        stats.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
        stats.put("totalRatings", totalRatings);
        return stats;
    }

    // ── Available Jobs ────────────────────────────────────────────────────────
    // Shows orders matching this provider's category that haven't been accepted yet.

    public List<Order> getAvailableJobs(String providerCategory) {
    if (providerCategory == null || providerCategory.isBlank()) {
        return List.of(); // Provider has no category set — return nothing
    }
 
    String normalizedProviderCat = providerCategory.trim().toLowerCase();
 
    return orderRepository.findAll().stream()
        .filter(o -> "service_requested".equals(o.getTrackingStatus()))
        .filter(o -> o.getProvider() == null)
        .filter(o -> {
            // Order must have a category and it must match provider's category
            String orderCat = o.getServiceCategory();
            if (orderCat == null || orderCat.isBlank()) return false;
            return orderCat.trim().toLowerCase().equals(normalizedProviderCat);
        })
        .toList();
}

    // ── Accept a Job ──────────────────────────────────────────────────────────

    public Order acceptOrder(Long orderId, Long providerId) throws Exception {
        Order order = orderService.acceptOrder(orderId, providerId);

        // Email customer that a provider has accepted
        if (order.getEmail() != null && order.getProvider() != null) {
            sendProviderAssignedEmail(
                    order.getEmail(),
                    order.getProvider().getName(),
                    order.getProvider().getPhone(),
                    order.getOtpServiceStart()
            );
        }
        return order;
    }

    // ── My Jobs ───────────────────────────────────────────────────────────────

    public List<Order> getMyJobs(Long providerId) {
        return orderRepository.findByProvider_Id(providerId);
    }

    // ── Mark Out for Service ──────────────────────────────────────────────────

    public Order markOutForService(Long orderId, Long providerId) throws Exception {
        return orderService.markOutForService(orderId, providerId);
    }

    // ── Verify START OTP → service begins ────────────────────────────────────

    public Order verifyStartOtp(Long orderId, String otp, Long providerId) throws Exception {
        return orderService.verifyStartOtp(orderId, otp, providerId);
    }

    // ── Verify END OTP → job completed ───────────────────────────────────────

    public Order verifyEndOtp(Long orderId, String otp, Long providerId) throws Exception {
        Order order = orderService.verifyEndOtp(orderId, otp, providerId);

        // Email customer asking for a rating
        if (order.getEmail() != null) {
            sendRatingRequestEmail(order.getEmail(), order.getOrderId());
        }
        return order;
    }

    // ── Toggle Online/Offline ─────────────────────────────────────────────────

    public Provider toggleOnline(Long providerId) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setIsOnline(!provider.getIsOnline());
        return providerRepository.save(provider);
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    public Provider updateProfile(Long providerId, Provider updatedData) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setName(updatedData.getName());
        provider.setPhone(updatedData.getPhone());
        provider.setExperienceYears(updatedData.getExperienceYears());
        provider.setCategory(updatedData.getCategory());
        return providerRepository.save(provider);
    }

    // ── Email Helpers ─────────────────────────────────────────────────────────

    private void sendProviderAssignedEmail(String to, String providerName,
                                            String providerPhone, String startOtp) {
        try {
            org.springframework.mail.SimpleMailMessage msg =
                    new org.springframework.mail.SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject("Provider Assigned – Homease");
            msg.setText(
                "Great news! A service provider has accepted your booking.\n\n"
                + "Provider: " + providerName + "\n"
                + "Phone: " + (providerPhone != null ? providerPhone : "N/A") + "\n\n"
                + "When the provider arrives, share this START OTP with them:\n\n"
                + "  START OTP: " + startOtp + "\n\n"
                + "Do NOT share this OTP until the provider is physically present at your location.\n\n"
                + "– Team Homease"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Failed to send provider-assigned email: " + e.getMessage());
        }
    }

    private void sendRatingRequestEmail(String to, String orderId) {
        try {
            org.springframework.mail.SimpleMailMessage msg =
                    new org.springframework.mail.SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject("How was your service? – Homease");
            msg.setText(
                "Your service (Order #" + orderId + ") has been completed!\n\n"
                + "We'd love to hear your feedback. Please log in to Homease "
                + "and rate your provider in My Orders.\n\n"
                + "Your rating helps other customers and motivates our providers.\n\n"
                + "– Team Homease"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Failed to send rating-request email: " + e.getMessage());
        }
    }
}