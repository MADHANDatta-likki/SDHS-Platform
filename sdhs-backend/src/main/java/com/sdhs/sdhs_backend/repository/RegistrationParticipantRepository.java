package com.sdhs.sdhs_backend.repository;

import com.sdhs.sdhs_backend.entity.RegistrationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegistrationParticipantRepository extends JpaRepository<RegistrationParticipant, Long> {

    Optional<RegistrationParticipant> findByEventIdAndVolunteerId(Long eventId, String volunteerId);

    List<RegistrationParticipant> findByRegistrationId(Long registrationId);
    int countByRegistrationId(Long registrationId);

    List<RegistrationParticipant> findByParticipantStatus(String participantStatus);

    List<RegistrationParticipant> findByParticipantStatusAndAddedLater(
        String participantStatus,
        Boolean addedLater
);
@Query("""
        SELECT rp
        FROM RegistrationParticipant rp
        WHERE
            (:eventId IS NULL OR rp.eventId = :eventId)
            AND (:participantStatus IS NULL OR rp.participantStatus = :participantStatus)
        """)
List<RegistrationParticipant> searchParticipantsForReport(
        @Param("eventId") Long eventId,
        @Param("participantStatus") String participantStatus
);

}