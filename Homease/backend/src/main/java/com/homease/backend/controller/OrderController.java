package com.homease.backend.controller;

import com.homease.backend.entity.Order;
import com.homease.backend.entity.OrderItem;
import com.homease.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ── Create Razorpay order intent ──────────────────────────────────────────
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            Double amount = 200.0;
            Object a = payload.get("amount");
            if (a instanceof Number) amount = ((Number) a).doubleValue();
            else if (a != null)      amount = Double.parseDouble(a.toString());
            if (amount <= 0)         amount = 200.0;

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("id", "order_" + System.currentTimeMillis());
            res.put("amount", amount);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Verify payment and save order ─────────────────────────────────────────
    @PostMapping("/verify-payment")
public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> payload) {
    try {
        String razorpayOrderId = (String) payload.get("orderId");
        String paymentId       = (String) payload.get("paymentId");
        Double amount          = Double.valueOf(payload.get("amount").toString());
 
        @SuppressWarnings("unchecked")
        Map<String, Object> userDetails =
                (Map<String, Object>) payload.get("userDetails");
 
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> services =
                (List<Map<String, Object>>) payload.get("services");
 
        // ── Build Order ───────────────────────────────────────────────────
        Order order = new Order();
        order.setOrderId(razorpayOrderId);
        order.setPaymentId(paymentId);
        order.setAmount(amount);
 
        if (userDetails != null) {
            order.setFirstName((String) userDetails.get("firstName"));
            order.setLastName((String) userDetails.get("lastName"));
            order.setEmail((String) userDetails.get("email"));
            order.setPhone((String) userDetails.get("phone"));
            order.setStreet((String) userDetails.get("street"));
            order.setCity((String) userDetails.get("city"));
            order.setState((String) userDetails.get("state"));
            order.setPincode((String) userDetails.get("pincode"));
            order.setServiceDate((String) userDetails.get("serviceDate"));
            order.setUserId((String) userDetails.get("email"));
        }
 
        // ── Save serviceCategory from first service ────────────────────────
        // Frontend now sends: { id, name, category, price, quantity }
        // We save category from the first item — this is what providers filter by.
        if (services != null && !services.isEmpty()) {
            Map<String, Object> firstService = services.get(0);
 
            // Log every field received so you can debug any future mismatch
            System.out.println("=== ORDER CATEGORY DEBUG ===");
            System.out.println("First service received: " + firstService);
            System.out.println("Category value: " + firstService.get("category"));
            System.out.println("============================");
 
            Object cat = firstService.get("category");
            if (cat != null && !cat.toString().trim().isEmpty()) {
                order.setServiceCategory(cat.toString().trim());
            } else {
                System.err.println("WARNING: category is missing or empty in services payload!");
            }
        }
 
        // ── Build OrderItems ──────────────────────────────────────────────
        List<OrderItem> items = new ArrayList<>();
        if (services != null) {
            for (Map<String, Object> svc : services) {
                OrderItem item = new OrderItem();
                item.setServiceId(
                    svc.get("id") != null ? svc.get("id").toString() : "unknown");
                item.setName(
                    svc.get("name") != null ? svc.get("name").toString() : "Unknown Service");
                item.setQuantity(
                    svc.get("quantity") != null
                        ? Integer.parseInt(svc.get("quantity").toString()) : 1);
                item.setPrice(
                    svc.get("price") != null
                        ? Double.parseDouble(svc.get("price").toString()) : 0.0);
                items.add(item);
            }
        }
 
        Order saved = orderService.placeOrder(order, items);
 
        System.out.println("Order saved with serviceCategory: " + saved.getServiceCategory());
 
        return ResponseEntity.ok(Map.of(
                "success",  true,
                "message",  "Order placed! Providers in your category will be notified.",
                "orderId",  saved.getId(),
                "startOtp", saved.getOtpServiceStart()
        ));
 
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
    }
}
 

    // ── Get orders for a customer (by email) ──────────────────────────────────
    @GetMapping("/user/{email}")
    public List<Order> getUserOrders(@PathVariable String email) {
        return orderService.getUserOrders(email);
    }

    // ── Get all orders (admin — read only) ────────────────────────────────────
    @GetMapping("")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // ── Get single order ──────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        if (order != null) return ResponseEntity.ok(order);
        return ResponseEntity.notFound().build();
    }

    // ── Customer submits rating ───────────────────────────────────────────────
    @PostMapping("/{id}/rate")
    public ResponseEntity<?> rateOrder(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        try {
            String email   = (String) payload.get("email");
            int    rating  = Integer.parseInt(payload.get("rating").toString());
            String comment = (String) payload.getOrDefault("comment", "");

            Order order = orderService.submitRating(id, email, rating, comment);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Thank you for your rating!",
                    "order",   order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Admin: cancel an order (only before service starts) ───────────────────
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            Order order = orderService.cancelOrder(id, payload.get("notes"));
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}