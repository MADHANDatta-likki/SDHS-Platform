package com.sdhs.sdhs_backend.repository;

import com.sdhs.sdhs_backend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByActiveTrueAndRegistrationOpenTrue();

    @Query("""
            SELECT e
            FROM Event e
            WHERE COALESCE(e.active, true) = true
              AND COALESCE(e.registrationOpen, true) = true
              AND COALESCE(e.eventStatus, 'ACTIVE') = 'ACTIVE'
              AND (e.endDate IS NULL OR e.endDate >= :today)
            ORDER BY CASE WHEN e.startDate IS NULL THEN 1 ELSE 0 END, e.startDate ASC, e.eventId DESC
            """)
    List<Event> findPublicActiveEvents(@Param("today") LocalDate today);
}
