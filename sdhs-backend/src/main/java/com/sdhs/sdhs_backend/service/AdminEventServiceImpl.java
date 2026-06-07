package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.dto.AdminEventRequest;
import com.sdhs.sdhs_backend.entity.Event;
import com.sdhs.sdhs_backend.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AdminEventServiceImpl implements AdminEventService {

    private final EventRepository eventRepository;

    public AdminEventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public List<Event> getEvents() {
        return eventRepository.findAll();
    }

    @Override
    public Event getEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Override
    public Event createEvent(AdminEventRequest request) {
        Event event = new Event();
        applyRequest(event, request);
        return eventRepository.save(event);
    }

    @Override
    public Event updateEvent(Long eventId, AdminEventRequest request) {
        Event event = getEvent(eventId);
        applyRequest(event, request);
        return eventRepository.save(event);
    }

    @Override
    public Event completeEvent(Long eventId) {
        Event event = getEvent(eventId);
        event.setEventStatus("COMPLETED");
        event.setRegistrationOpen(false);
        event.setActive(false);
        return eventRepository.save(event);
    }

    @Override
    public Event cancelEvent(Long eventId) {
        Event event = getEvent(eventId);
        event.setEventStatus("CANCELLED");
        event.setRegistrationOpen(false);
        event.setActive(false);
        return eventRepository.save(event);
    }

    private void applyRequest(Event event, AdminEventRequest request) {
        event.setEventName(request.getEventName());
        event.setEventType(request.getEventType());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setRegistrationStartDate(request.getRegistrationStartDate());
        event.setRegistrationEndDate(request.getRegistrationEndDate());
        boolean paymentRequired = Boolean.TRUE.equals(request.getPaymentRequired());
        BigDecimal amount = paymentRequired
                ? request.getAmountPerVolunteer()
                : BigDecimal.ZERO;

        if (amount == null) {
            amount = BigDecimal.ZERO;
        }

        event.setPaymentRequired(paymentRequired);
        event.setAmountPerVolunteer(amount);
        event.setEventImageUrl(request.getEventImageUrl());
        event.setEventStatus(normalizeStatus(request.getEventStatus()));
        event.setRegistrationOpen(request.getRegistrationOpen() != null ? request.getRegistrationOpen() : true);
        event.setActive(request.getActive() != null ? request.getActive() : isActiveStatus(event.getEventStatus()));

        // Keep older fee column populated for existing payment code and reports.
        event.setFeePerPerson(amount);
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "ACTIVE";
        }

        String normalized = status.trim().toUpperCase();

        return switch (normalized) {
            case "ACTIVE", "COMPLETED", "CANCELLED" -> normalized;
            default -> "ACTIVE";
        };
    }

    private boolean isActiveStatus(String status) {
        return "ACTIVE".equals(status);
    }
}
