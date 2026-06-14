package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.dto.VolunteerApplicantRequest;
import com.sdhs.sdhs_backend.service.VolunteerApplicantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/volunteer-applicants")
public class VolunteerApplicantController {

    private final VolunteerApplicantService applicantService;

    public VolunteerApplicantController(VolunteerApplicantService applicantService) {
        this.applicantService = applicantService;
    }

    @PostMapping
    public ResponseEntity<?> submitApplicant(
            @RequestBody VolunteerApplicantRequest request
    ) {
        return ResponseEntity.ok(applicantService.submitApplicant(request));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();

        if (message == null || message.isBlank()) {
            message = "Volunteer application could not be submitted. Please check the details and try again.";
        }

        return ResponseEntity.badRequest().body(message);
    }
}
