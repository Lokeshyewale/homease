package com.homease.backend.repository;

import com.homease.backend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(String userId);
    Optional<CartItem> findByUserIdAndServiceId(String userId, String serviceId);
    void deleteByUserId(String userId);
}
