package com.homease.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;
    
    // Store simple token for session
    private String token;

    private String otp;

    private LocalDateTime otpExpiry;
    
    // Additional fields if needed matching frontend 'userDetails'
    private String firstName;
    private String lastName;
    private String phone;
    
    // Address fields (simple implementation, could be separate entity)
    private String street;
    private String city;
    private String state;
    private String pincode;

}
