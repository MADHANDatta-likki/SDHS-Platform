package com.sdhs.sdhs_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminParticipantReportDTO {

    private Long registrationId;
    private Long participantId;
    private Long eventId;

    private String eventName;

    private String volunteerId;
    private String volunteerName;

    private String centerCode;

    private Integer age;

    private String phone;
    private String email;

    private String registrationStatus;
    private String participantStatus;
    private String paymentStatus;

    private Boolean addedLater;
    private Boolean accommodationRequired;

    private String imageUrl;
}