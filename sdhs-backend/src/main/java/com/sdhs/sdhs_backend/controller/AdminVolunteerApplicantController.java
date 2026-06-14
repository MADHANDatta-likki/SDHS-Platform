package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.dto.VolunteerApplicantRejectRequest;
import com.sdhs.sdhs_backend.service.VolunteerApplicantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/volunteer-applicants")
public class AdminVolunteerApplicantController {

    private final VolunteerApplicantService applicantService;

    public AdminVolunteerApplicantController(VolunteerApplicantService applicantService) {
        this.applicantService = applicantService;
    }

    @GetMapping
    public ResponseEntity<?> getApplicants(
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(applicantService.getApplicants(status));
    }

    @PatchMapping("/{applicantId}/approve")
    public ResponseEntity<?> approveApplicant(@PathVariable Long applicantId) {
        return ResponseEntity.ok(applicantService.approveApplicant(applicantId));
    }

    @PatchMapping("/{applicantId}/reject")
    public ResponseEntity<?> rejectApplicant(
            @PathVariable Long applicantId,
            @RequestBody VolunteerApplicantRejectRequest request
    ) {
        return ResponseEntity.ok(applicantService.rejectApplicant(applicantId, request));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();

        if (message == null || message.isBlank()) {
            message = "Volunteer applicant request could not be processed.";
        }

        return ResponseEntity.badRequest().body(message);
    }
}
