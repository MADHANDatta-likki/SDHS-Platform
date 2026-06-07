package com.sdhs.sdhs_backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class AdminEventRequest {

    private String eventName;
    private String eventType;
    private String description;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate registrationStartDate;
    private LocalDate registrationEndDate;
    private Boolean paymentRequired;
    private BigDecimal amountPerVolunteer;
    private String eventImageUrl;
    private String eventStatus;
    private Boolean registrationOpen;
    private Boolean active;
}
