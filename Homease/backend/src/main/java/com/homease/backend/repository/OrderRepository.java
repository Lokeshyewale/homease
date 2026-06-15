package com.homease.backend.repository;

import com.homease.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByEmail(String email);

    List<Order> findByUserId(String userId);

    List<Order> findByEmailOrUserId(String email, String userId);

    List<Order> findByProvider_Id(Long providerId);
}
