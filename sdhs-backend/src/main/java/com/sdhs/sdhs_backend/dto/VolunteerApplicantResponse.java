package com.sdhs.sdhs_backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VolunteerApplicantResponse {

    private Long applicantId;
    private String fullName;
    private String contactNumber;
    private String email;
    private String place;
    private String photoUrl;
    private String referredByVolunteerId;
    private String referredByVolunteerName;
    private String referredByCenterCode;
    private String applicantStatus;
    private String adminComments;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private String reviewedBy;

    private String possibleDuplicateVolunteerId;
    private String possibleDuplicateVolunteerName;
    private String possibleDuplicateCenterCode;
    private String possibleDuplicatePhone;
    private String possibleDuplicateEmail;
    private String possibleDuplicateImageUrl;
}
