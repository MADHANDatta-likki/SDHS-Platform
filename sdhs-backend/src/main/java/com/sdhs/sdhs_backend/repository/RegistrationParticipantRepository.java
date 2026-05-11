package com.sdhs.sdhs_backend.repository;

import com.sdhs.sdhs_backend.entity.RegistrationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

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

}