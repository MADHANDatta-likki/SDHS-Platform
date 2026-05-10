package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.dto.PaymentSubmissionRequest;
import com.sdhs.sdhs_backend.service.VolunteerPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin
public class VolunteerPaymentController {

    private final VolunteerPaymentService paymentService;

    public VolunteerPaymentController(
            VolunteerPaymentService paymentService
    ) {
        this.paymentService = paymentService;
    }

    @GetMapping("/{registrationId}")
    public ResponseEntity<?> getPaymentDetails(
            @PathVariable Long registrationId
    ) {
        return ResponseEntity.ok(
                paymentService.getPaymentDetails(registrationId)
        );
    }

    @PostMapping("/{registrationId}/submit")
    public ResponseEntity<?> submitPayment(
            @PathVariable Long registrationId,
            @RequestBody PaymentSubmissionRequest request
    ) {
        paymentService.submitPayment(registrationId, request);

        return ResponseEntity.ok(
                "Payment submitted successfully and pending verification."
        );
    }
}