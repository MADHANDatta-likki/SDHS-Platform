package com.sdhs.sdhs_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "registration_participant")
public class RegistrationParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Long participantId;

    @Column(name = "registration_id")
    private Long registrationId;

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "volunteer_id")
    private String volunteerId;

    @Column(name = "full_name")
    private String fullName;

    private Integer age;

    private String gender;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "relationship_to_primary")
    private String relationshipToPrimary;

    @Column(name = "participant_type")
    private String participantType;

    @Column(name = "accommodation_required")
    private Boolean accommodationRequired;

    @Column(name = "participant_status")
    private String participantStatus;

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "added_later")
    private Boolean addedLater;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}