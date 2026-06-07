package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.dto.AdminEventRequest;
import com.sdhs.sdhs_backend.entity.Event;
import com.sdhs.sdhs_backend.service.AdminEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/events")
@CrossOrigin
public class AdminEventController {

    private final AdminEventService adminEventService;

    public AdminEventController(AdminEventService adminEventService) {
        this.adminEventService = adminEventService;
    }

    @GetMapping
    public ResponseEntity<?> getEvents() {
        return ResponseEntity.ok(adminEventService.getEvents());
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<Event> getEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(adminEventService.getEvent(eventId));
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody AdminEventRequest request) {
        return ResponseEntity.ok(adminEventService.createEvent(request));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long eventId,
            @RequestBody AdminEventRequest request
    ) {
        return ResponseEntity.ok(adminEventService.updateEvent(eventId, request));
    }

    @PatchMapping("/{eventId}/complete")
    public ResponseEntity<Event> completeEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(adminEventService.completeEvent(eventId));
    }

    @PatchMapping("/{eventId}/cancel")
    public ResponseEntity<Event> cancelEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(adminEventService.cancelEvent(eventId));
    }
}
