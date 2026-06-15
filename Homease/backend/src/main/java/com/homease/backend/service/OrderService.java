package com.homease.backend.service;

import com.homease.backend.entity.Order;
import com.homease.backend.entity.OrderItem;
import com.homease.backend.entity.Provider;
import com.homease.backend.repository.OrderRepository;
import com.homease.backend.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProviderRepository providerRepository;

    // ── Helper: append one JSON entry to the trackingHistory TEXT column ──────
    private String appendHistory(String existing, String status, String notes) {
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
        String safeNotes = (notes != null ? notes : "").replace("\"", "'");
        String entry = String.format(
                "{\"status\":\"%s\",\"timestamp\":\"%s\",\"notes\":\"%s\"}",
                status, timestamp, safeNotes);

        if (existing == null || existing.isBlank() || existing.equals("[]")) {
            return "[" + entry + "]";
        }
        return existing.substring(0, existing.lastIndexOf(']')) + "," + entry + "]";
    }

    // ── Place Order after payment ─────────────────────────────────────────────
    // Status starts at "service_requested" — broadcast to providers of matching category.
    // Start OTP is generated here and shown to the customer in My Orders.
    public Order placeOrder(Order orderData, List<OrderItem> items) {
        orderData.setTrackingStatus("service_requested");
        orderData.setPaymentStatus("COMPLETED");
        orderData.setPaymentMethod("Razorpay");
        orderData.setPaymentDate(LocalDateTime.now());

        // Start OTP — customer shows this to provider on arrival to begin work
        orderData.setOtpServiceStart(generateOtp());

        orderData.setTrackingHistory(
                appendHistory("[]", "service_requested",
                        "Service request placed. Waiting for a provider to accept."));

        Order saved = orderRepository.save(orderData);
        for (OrderItem item : items) {
            item.setOrder(saved);
        }
        saved.setOrderItems(items);
        return orderRepository.save(saved);
    }

    // ── Provider accepts the job ───────────────────────────────────────────────
    // Only available if status is "service_requested" and no provider assigned.
    public Order acceptOrder(Long orderId, Long providerId) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new Exception("Order not found"));

        if (!"service_requested".equals(order.getTrackingStatus())) {
            throw new Exception("This order is no longer available for acceptance.");
        }
        if (order.getProvider() != null) {
            throw new Exception("This order has already been accepted by another provider.");
        }

        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new Exception("Provider not found"));

        order.setProvider(provider);
        order.setTrackingStatus("provider_assigned");
        order.setTrackingHistory(appendHistory(
                order.getTrackingHistory(), "provider_assigned",
                "Accepted by provider: " + provider.getName()));

        return orderRepository.save(order);
    }

    // ── Provider marks "On the way" ───────────────────────────────────────────
    public Order markOutForService(Long orderId, Long providerId) throws Exception {
        Order order = getOrderVerifyProvider(orderId, providerId);

        if (!"provider_assigned".equals(order.getTrackingStatus())) {
            throw new Exception("Cannot mark out-for-service from current status: "
                    + order.getTrackingStatus());
        }

        order.setTrackingStatus("out_for_service");
        order.setTrackingHistory(appendHistory(
                order.getTrackingHistory(), "out_for_service",
                "Provider is on the way to customer location."));

        return orderRepository.save(order);
    }

    // ── Provider verifies START OTP → service begins ──────────────────────────
    // Customer opens My Orders, sees the start OTP, tells it to provider.
    public Order verifyStartOtp(Long orderId, String otp, Long providerId) throws Exception {
        Order order = getOrderVerifyProvider(orderId, providerId);

        if (order.getOtpServiceStart() == null || !order.getOtpServiceStart().equals(otp)) {
            throw new Exception("Invalid start OTP. Ask the customer to check their My Orders page.");
        }

        // Generate END OTP now — customer will need to share this after work is done
        order.setOtpServiceEnd(generateOtp());
        order.setTrackingStatus("service_started");
        order.setTrackingHistory(appendHistory(
                order.getTrackingHistory(), "service_started",
                "Start OTP verified. Service in progress."));

        return orderRepository.save(order);
    }

    // ── Provider verifies END OTP → job completed ─────────────────────────────
    // After finishing work, provider asks customer for the end OTP.
    // Customer sees end OTP in My Orders once service_started.
    public Order verifyEndOtp(Long orderId, String otp, Long providerId) throws Exception {
        Order order = getOrderVerifyProvider(orderId, providerId);

        if (!"service_started".equals(order.getTrackingStatus())) {
            throw new Exception("Service has not started yet.");
        }
        if (order.getOtpServiceEnd() == null || !order.getOtpServiceEnd().equals(otp)) {
            throw new Exception("Invalid end OTP. Ask the customer to check their My Orders page.");
        }

        order.setTrackingStatus("service_completed");
        order.setTrackingHistory(appendHistory(
                order.getTrackingHistory(), "service_completed",
                "End OTP verified. Service completed successfully."));

        // Update provider's average rating count (actual rating submitted separately)
        return orderRepository.save(order);
    }

    // ── Customer submits rating after completion ───────────────────────────────
    public Order submitRating(Long orderId, String customerEmail, int rating, String comment)
            throws Exception {

        if (rating < 1 || rating > 5) {
            throw new Exception("Rating must be between 1 and 5.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new Exception("Order not found"));

        // Verify this is the customer's order
        if (!customerEmail.equalsIgnoreCase(order.getEmail())) {
            throw new Exception("You are not authorized to rate this order.");
        }
        if (!"service_completed".equals(order.getTrackingStatus())) {
            throw new Exception("You can only rate after service is completed.");
        }
        if (Boolean.TRUE.equals(order.getRatingSubmitted())) {
            throw new Exception("You have already submitted a rating for this order.");
        }

        order.setProviderRating(rating);
        order.setRatingComment(comment);
        order.setRatingSubmitted(true);
        Order saved = orderRepository.save(order);

        // Recalculate provider average rating
        if (order.getProvider() != null) {
            updateProviderAverageRating(order.getProvider().getId());
        }

        return saved;
    }

    // ── Recalculate and save provider average rating ──────────────────────────
    private void updateProviderAverageRating(Long providerId) {
        List<Order> ratedOrders = orderRepository.findByProvider_Id(providerId)
                .stream()
                .filter(o -> Boolean.TRUE.equals(o.getRatingSubmitted())
                        && o.getProviderRating() != null)
                .toList();

        if (ratedOrders.isEmpty()) return;

        double avg = ratedOrders.stream()
                .mapToInt(Order::getProviderRating)
                .average()
                .orElse(0.0);

        providerRepository.findById(providerId).ifPresent(provider -> {
            // Round to 1 decimal place
            provider.setRating(Math.round(avg * 10.0) / 10.0);
            providerRepository.save(provider);
        });
    }

    // ── Admin: Cancel an order (only before provider accepts) ─────────────────
    public Order cancelOrder(Long orderId, String notes) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new Exception("Order not found"));

        if ("service_started".equals(order.getTrackingStatus())
                || "service_completed".equals(order.getTrackingStatus())) {
            throw new Exception("Cannot cancel an order that is already in progress or completed.");
        }

        order.setTrackingStatus("cancelled");
        order.setTrackingHistory(appendHistory(
                order.getTrackingHistory(), "cancelled",
                notes != null ? notes : "Cancelled by admin."));

        return orderRepository.save(order);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Order getOrderVerifyProvider(Long orderId, Long providerId) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new Exception("Order not found"));
        if (order.getProvider() == null || !order.getProvider().getId().equals(providerId)) {
            throw new Exception("You are not assigned to this order.");
        }
        return order;
    }

    private String generateOtp() {
        return String.format("%04d", new Random().nextInt(10000));
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public List<Order> getUserOrders(String email) {
        return orderRepository.findByEmail(email);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }
}