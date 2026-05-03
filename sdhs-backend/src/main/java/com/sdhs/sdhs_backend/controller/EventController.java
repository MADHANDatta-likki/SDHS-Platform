package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.entity.Event;
import com.sdhs.sdhs_backend.repository.EventRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository eventRepository;

    public EventController(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @GetMapping("/active")
    public List<Event> getActiveEvents() {
        return eventRepository.findByActiveTrueAndRegistrationOpenTrue();
    }
}