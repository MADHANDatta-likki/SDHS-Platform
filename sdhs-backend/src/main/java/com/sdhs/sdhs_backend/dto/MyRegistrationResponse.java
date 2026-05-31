package com.sdhs.sdhs_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class MyRegistrationResponse {

    private Long registrationId;
    private Long eventId;
    private String eventName;
    private String status;
    private Integer participantsCount;
    private BigDecimal amount;
    private String paymentStatus;
    private Boolean hasPendingAdditionalVolunteers;
}