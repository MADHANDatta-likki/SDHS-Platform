package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.dto.AdminEventRequest;
import com.sdhs.sdhs_backend.entity.Event;

import java.util.List;

public interface AdminEventService {

    List<Event> getEvents();

    Event getEvent(Long eventId);

    Event createEvent(AdminEventRequest request);

    Event updateEvent(Long eventId, AdminEventRequest request);

    Event completeEvent(Long eventId);

    Event cancelEvent(Long eventId);
}
