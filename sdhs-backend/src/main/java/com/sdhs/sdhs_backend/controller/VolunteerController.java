package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.repository.VolunteerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/volunteers")
public class VolunteerController {

    private final VolunteerRepository volunteerRepository;

    public VolunteerController(VolunteerRepository volunteerRepository) {
        this.volunteerRepository = volunteerRepository;
    }

    @GetMapping("/{vid}")
    public ResponseEntity<?> getVolunteerByVid(@PathVariable String vid) {
        return volunteerRepository.findByVid(vid)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}