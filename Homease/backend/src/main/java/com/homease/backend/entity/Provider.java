package com.homease.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "providers")
public class Provider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String phone;

    private String category;

    private Integer experienceYears;

    private Double rating = 0.0;

    private Boolean isApproved = false;

    private Boolean isOnline = false;

    private String token;
}
