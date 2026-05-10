package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.dto.ParticipantApprovalRequest;
import com.sdhs.sdhs_backend.service.AdminParticipantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/participants")
@CrossOrigin
public class AdminParticipantController {

    private final AdminParticipantService adminParticipantService;

    public AdminParticipantController(AdminParticipantService adminParticipantService) {
        this.adminParticipantService = adminParticipantService;
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingParticipants() {
        return ResponseEntity.ok(adminParticipantService.getPendingParticipants());
    }

    @PostMapping("/approve")
    public ResponseEntity<?> approveParticipants(@RequestBody ParticipantApprovalRequest request) {
        adminParticipantService.approveParticipants(request);
        return ResponseEntity.ok("Participants approved for payment.");
    }

    @PostMapping("/reject")
    public ResponseEntity<?> rejectParticipants(@RequestBody ParticipantApprovalRequest request) {
        adminParticipantService.rejectParticipants(request);
        return ResponseEntity.ok("Participants rejected.");
    }
}