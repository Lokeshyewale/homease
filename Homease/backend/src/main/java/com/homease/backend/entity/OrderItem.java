package com.homease.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_tbl_id")
    @JsonIgnore // Prevent infinite recursion
    private Order order;

    private String serviceId;
    private String name;
    private Double price;
    private Integer quantity;
    
    // Snapshot of image if needed, or link to service
    private String image; 
}
