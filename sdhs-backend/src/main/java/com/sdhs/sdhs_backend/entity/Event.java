package com.sdhs.sdhs_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "event")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "event_name")
    private String eventName;

    @Column(name = "event_type")
    private String eventType;

    private String description;

    private String location;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "fee_per_person")
    private BigDecimal feePerPerson;

    @Column(name = "registration_open")
    private Boolean registrationOpen;

    private Boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "registration_start_date")
    private LocalDate registrationStartDate;

    @Column(name = "registration_end_date")
    private LocalDate registrationEndDate;

    @Column(name = "payment_required")
    private Boolean paymentRequired;

    @Column(name = "amount_per_volunteer")
    private BigDecimal amountPerVolunteer;

    @Column(name = "event_status")
    private String eventStatus;

    @Column(name = "event_image_url")
    private String eventImageUrl;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (registrationOpen == null) {
            registrationOpen = true;
        }

        if (active == null) {
            active = true;
        }

        if (paymentRequired == null) {
            paymentRequired = true;
        }

        if (eventStatus == null || eventStatus.isBlank()) {
            eventStatus = "ACTIVE";
        }
    }
}
