package com.sdhs.sdhs_backend.repository;

import com.sdhs.sdhs_backend.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    Optional<EventRegistration> findByEventIdAndPrimaryVolunteerId(Long eventId, String primaryVolunteerId);
    List<EventRegistration> findByPrimaryVolunteerId(String volunteerId);
}