package com.homease.backend.service;

import com.homease.backend.entity.CartItem;
import com.homease.backend.entity.User;
import com.homease.backend.repository.CartRepository;
import com.homease.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private UserRepository userRepository;

    public void addToCart(String email, String itemId) {
        // Simple logic: increment if exists, else create
        // We are using 'email' as userId for simplicity based on token lookup
        Optional<CartItem> existing = cartRepository.findByUserIdAndServiceId(email, itemId);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + 1);
            cartRepository.save(item);
        } else {
            CartItem item = new CartItem();
            item.setUserId(email);
            item.setServiceId(itemId);
            item.setQuantity(1);
            cartRepository.save(item);
        }
    }

    public void removeFromCart(String email, String itemId) {
        Optional<CartItem> existing = cartRepository.findByUserIdAndServiceId(email, itemId);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            if (item.getQuantity() > 1) {
                item.setQuantity(item.getQuantity() - 1);
                cartRepository.save(item);
            } else {
                cartRepository.delete(item);
            }
        }
    }
    
    public Map<String, Integer> getCart(String email) {
        List<CartItem> items = cartRepository.findByUserId(email);
        Map<String, Integer> cartData = new HashMap<>();
        for (CartItem item : items) {
            cartData.put(item.getServiceId(), item.getQuantity());
        }
        return cartData;
    }
    
    @Transactional
    public void clearCart(String email) {
        cartRepository.deleteByUserId(email);
    }
}
