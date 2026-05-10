package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.service.AdminPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/payments")
@CrossOrigin
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    public AdminPaymentController(AdminPaymentService adminPaymentService) {
        this.adminPaymentService = adminPaymentService;
    }

    @GetMapping("/submitted")
    public ResponseEntity<?> getSubmittedPayments() {
        return ResponseEntity.ok(adminPaymentService.getSubmittedPayments());
    }

    @PostMapping("/{registrationId}/verify")
    public ResponseEntity<?> verifyPayment(@PathVariable Long registrationId) {
        adminPaymentService.verifyPayment(registrationId);
        return ResponseEntity.ok("Payment verified and registration confirmed.");
    }

    @PostMapping("/{registrationId}/reject")
    public ResponseEntity<?> rejectPayment(@PathVariable Long registrationId) {
        adminPaymentService.rejectPayment(registrationId);
        return ResponseEntity.ok("Payment rejected.");
    }
}