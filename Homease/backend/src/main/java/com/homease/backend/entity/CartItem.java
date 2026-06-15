package com.homease.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId; // Or ManyToOne User

    private String serviceId; // Or ManyToOne Service

    private Integer quantity;
}
