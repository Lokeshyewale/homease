package com.homease.backend.service;

import com.homease.backend.entity.User;
import com.homease.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean requestOtp(String email) {
        // Generate random 4-digit OTP
        String otp = String.valueOf((int) (Math.random() * 9000) + 1000);

        // Send Email with fallback
        try {
            sendOtpEmail(email, otp);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            System.out.println("FALLBACK OTP for " + email + ": " + otp);
            // We normally wouldn't return true here in prod, but for dev smoothness:
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            user = new User();
            user.setEmail(email);
        }
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        return true;
    }

    private void sendOtpEmail(String to, String otp) {
        org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your OTP for Homease");
        message.setText("Your OTP for Homease verification is:\n\n " + otp + "\n\n ⏳ This OTP is valid for 10 minutes."
                + " \n\n Please do not share this code with anyone."
                + "\n\n If you did not request this verification, please ignore this message");
        mailSender.send(message);
    }

    public String signup(String email, String password, String otp) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found (OTP not requested?)");
        }
        User user = userOpt.get();
        if (!otp.equals(user.getOtp()) || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        user.setPassword(passwordEncoder.encode(password));
        user.setOtp(null);
        user.setOtpExpiry(null);

        // Return a mock token (UUID)
        String token = UUID.randomUUID().toString();
        user.setToken(token);
        userRepository.save(user);

        return token;
    }

    public String login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        User user = userOpt.get();
        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = UUID.randomUUID().toString();
        user.setToken(token);
        userRepository.save(user);

        return token;
    }

    public User getUserByToken(String token) {
        return userRepository.findByToken(token).orElse(null);
    }

    public boolean resetPassword(String email, String otp, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty())
            return false;

        User user = userOpt.get();
        if (!otp.equals(user.getOtp()) || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        userRepository.save(user);
        return true;
    }
}
