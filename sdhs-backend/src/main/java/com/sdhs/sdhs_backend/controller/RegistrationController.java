package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.dto.AddParticipantsRequest;
import com.sdhs.sdhs_backend.dto.CampRegistrationRequest;
import com.sdhs.sdhs_backend.service.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/camp")
    public ResponseEntity<?> registerCamp(@RequestBody CampRegistrationRequest request) {

        registrationService.registerCamp(request);

        return ResponseEntity.ok("Registration submitted successfully");
    }
    @GetMapping("/my")
public ResponseEntity<?> getMyRegistrations(@RequestParam String volunteerId) {
    return ResponseEntity.ok(registrationService.getMyRegistrations(volunteerId));
}
@PostMapping("/{registrationId}/add-volunteers")
public ResponseEntity<?> addVolunteers(
        @PathVariable Long registrationId,
        @RequestBody AddParticipantsRequest request
) {
    registrationService.addParticipants(registrationId, request);
    return ResponseEntity.ok("Participants added successfully");
}


@GetMapping("/{registrationId}")
public ResponseEntity<?> getRegistrationDetails(@PathVariable Long registrationId) {
    return ResponseEntity.ok(
            registrationService.getRegistrationDetails(registrationId)
    );
}
}