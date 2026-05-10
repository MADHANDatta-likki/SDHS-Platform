package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.service.AdminRegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/registrations")
@CrossOrigin
public class AdminRegistrationController {

    private final AdminRegistrationService adminRegistrationService;

    public AdminRegistrationController(AdminRegistrationService adminRegistrationService) {
        this.adminRegistrationService = adminRegistrationService;
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRegistrations() {
        return ResponseEntity.ok(
                adminRegistrationService.getPendingRegistrations()
        );
    }

    @PostMapping("/{registrationId}/approve")
    public ResponseEntity<?> approveRegistration(
            @PathVariable Long registrationId
    ) {
        adminRegistrationService.approveRegistration(registrationId);
        return ResponseEntity.ok("Registration approved for payment.");
    }

    @PostMapping("/{registrationId}/reject")
    public ResponseEntity<?> rejectRegistration(
            @PathVariable Long registrationId
    ) {
        adminRegistrationService.rejectRegistration(registrationId);
        return ResponseEntity.ok("Registration rejected.");
    }
}