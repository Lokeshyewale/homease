package com.homease.backend.service;

import com.homease.backend.entity.Service;
import com.homease.backend.repository.ServiceRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.ArrayList;
import java.util.List;

@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    @PostConstruct
    public void seedData() {
        if (serviceRepository.count() == 0) {
            // Seed initial data based on assets.js
            List<Service> services = new ArrayList<>();

            // Just adding a few sample ones to start with
            createService(services, "1", "House Cleaner", "House Cleaner", 500.0,
                    "Professional house cleaning services...", "House Cleaner", "homecleaner.jpeg");
            createService(services, "3", "Electrician", "Electrician", 600.0, "Expert electricians...", "Electrician",
                    "electrician.png");
            createService(services, "5", "Plumber", "Plumbing", 550.0, "Skilled plumbers...", "Plumbing",
                    "plumber.png");
            createService(services, "7", "House Shifting", "Shifting", 1000.0, "Reliable house shifting...",
                    "Shifting", "house_shift.jpg");
            createService(services, "9", "Painter", "Painting", 1400.0, "Professional painters...", "Painting",
                    "painter.png");
            createService(services, "12", "Carpenter", "Repairing", 1200.0, "Expert carpenters...", "Repairing",
                    "carpenter.jpg");

            serviceRepository.saveAll(services);
            System.out.println("Seeded Services Data");
        }
    }

    private void createService(List<Service> list, String id, String name, String category, Double price, String desc,
            String cat, String image) {
        Service s = new Service();
        s.setId(id);
        s.setName(name);
        s.setCategory(category);
        s.setPrice(price);
        s.setDescription(desc);
        s.setImage(image);
        list.add(s);
    }

    public Service addService(String name, String description, Double price, String category,
            org.springframework.web.multipart.MultipartFile image) {
        Service service = new Service();
        service.setId(java.util.UUID.randomUUID().toString());
        service.setName(name);
        service.setDescription(description);
        service.setPrice(price);
        service.setCategory(category);

        // Handle Image Upload
        if (image != null && !image.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            try {
                java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads/");
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }

                try (java.io.InputStream inputStream = image.getInputStream()) {
                    java.nio.file.Path filePath = uploadPath.resolve(fileName);
                    java.nio.file.Files.copy(inputStream, filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                }
                service.setImage(fileName);
            } catch (java.io.IOException e) {
                e.printStackTrace();
                service.setImage("");
            }
        } else {
            service.setImage("");
        }

        return serviceRepository.save(service);
    }

    public void removeService(String id) {
        serviceRepository.deleteById(id);
    }
}
