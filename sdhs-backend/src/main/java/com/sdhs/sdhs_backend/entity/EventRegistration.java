package com.sdhs.sdhs_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "event_registration")
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "registration_id")
    private Long registrationId;

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "primary_volunteer_id")
    private String primaryVolunteerId;

    @Column(name = "team_leader_code")
    private String teamLeaderCode;

    @Column(name = "overall_status")
    private String overallStatus;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}