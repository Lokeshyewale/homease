package com.homease.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "services")
public class Service {

    @Id
    // We can use String ID to match frontend's existing IDs (like "1", "2") easily, 
    // or GeneratedValue. Frontend sends "_id".
    // Let's use String to keep it compatible with the static data in assets.js if we import it.
    private String id; 

    private String name;
    
    @Lob // Image might be long url or base64, but typically URL.
    @Column(length = 1000)
    private String image;
    
    private Double price;
    
    @Column(length = 2000)
    private String description;
    
    private String category;
}
