package com.homease.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Data
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;       // display ID e.g. "ORD_1234567890"
    private String userId;        // customer email

    private Double amount;
    private Double shippingCost;
    private Double tax;
    private Double discount;

    // Customer address
    private String street;
    private String city;
    private String state;
    private String pincode;

    // Customer snapshot
    private String firstName;
    private String lastName;
    private String phone;
    private String email;

    // Payment
    private String paymentId;
    private String paymentMethod;
    private String paymentStatus;   // PENDING, COMPLETED, FAILED
    private LocalDateTime paymentDate;

    // Service category — used to broadcast to matching providers
    private String serviceCategory;

    // Service date requested by customer
    private String serviceDate;

    // ── Tracking ──────────────────────────────────────────────────────────────
    // Statuses (in order):
    //   service_requested  → order placed, awaiting provider acceptance
    //   provider_assigned  → a provider accepted the job
    //   out_for_service    → provider is on the way
    //   service_started    → start OTP verified, work in progress
    //   service_completed  → end OTP verified, work done
    //   cancelled          → cancelled before provider accepted
    private String trackingStatus;

    // History stored as JSON string array in a TEXT column — no extra table needed
    // Example: [{"status":"service_requested","timestamp":"2024-01-01T10:00","notes":"..."}]
    @Column(columnDefinition = "TEXT")
    private String trackingHistory;

    // ── Provider ──────────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id")
    private Provider provider;

    // ── OTPs ─────────────────────────────────────────────────────────────────
    // Start OTP: shown to customer, provider enters it to begin work
    private String otpServiceStart;

    // End OTP: generated after work is done, customer shares it with provider to close job
    private String otpServiceEnd;

    // ── Rating ────────────────────────────────────────────────────────────────
    // Customer rates the provider (1–5) after job completes
    private Integer providerRating;
    private String  ratingComment;
    private Boolean ratingSubmitted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (orderId == null) {
            orderId = "ORD_" + System.currentTimeMillis();
        }
        if (trackingHistory == null) {
            trackingHistory = "[]";
        }
        if (ratingSubmitted == null) {
            ratingSubmitted = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}