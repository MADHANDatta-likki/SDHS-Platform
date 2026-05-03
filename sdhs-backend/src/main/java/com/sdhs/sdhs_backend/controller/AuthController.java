package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.dto.LoginRequest;
import com.sdhs.sdhs_backend.dto.LoginResponse;
import com.sdhs.sdhs_backend.entity.Volunteer;
import com.sdhs.sdhs_backend.repository.VolunteerRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final VolunteerRepository volunteerRepository;

    public AuthController(VolunteerRepository volunteerRepository) {
        this.volunteerRepository = volunteerRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        return volunteerRepository
                .findByVidAndPhoneAndIsActive(
                        request.getVolunteerId(),
                        request.getPhoneNumber(),
                        "Y"
                )
                .map(this::buildResponse)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid Volunteer ID or Phone Number"));
    }

    private LoginResponse buildResponse(Volunteer v) {
        return new LoginResponse(
                v.getVid(),
                v.getDisplayName(),
                v.getPhone()
        );
    }
}