package com.homease.backend.controller;

import com.homease.backend.entity.User;
import com.homease.backend.service.AuthService;
import com.homease.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private AuthService authService;

    private String getEmailFromToken(String token) {
        User user = authService.getUserByToken(token);
        return user != null ? user.getEmail() : null;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestHeader(value = "token", required = false) String token,
            @RequestBody Map<String, String> payload) {
        if (token == null)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No token provided"));

        String email = getEmailFromToken(token);
        if (email == null)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid token"));

        String itemId = payload.get("itemId");
        cartService.addToCart(email, itemId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Added to cart"));
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeFromCart(@RequestHeader(value = "token", required = false) String token,
            @RequestBody Map<String, String> payload) {
        if (token == null)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No token provided"));

        String email = getEmailFromToken(token);
        if (email == null)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid token"));

        String itemId = payload.get("itemId");
        cartService.removeFromCart(email, itemId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Removed from cart"));
    }

    @PostMapping("/get")
    public ResponseEntity<?> getCart(@RequestHeader(value = "token", required = false) String token) {
        if (token == null)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No token provided"));

        String email = getEmailFromToken(token);
        if (email == null)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid token"));

        Map<String, Integer> cartData = cartService.getCart(email);
        return ResponseEntity.ok(Map.of("success", true, "cartData", cartData));
    }

    @PostMapping("/clear")
    public ResponseEntity<?> clearCart(@RequestHeader(value = "token", required = false) String token) {
        if (token == null)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No token provided"));

        String email = getEmailFromToken(token);
        if (email == null)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid token"));

        cartService.clearCart(email);
        return ResponseEntity.ok(Map.of("success", true, "message", "Cart cleared"));
    }
}
