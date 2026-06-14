package com.sdhs.sdhs_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VolunteerApplicantRequest {

    private String fullName;
    private String contactNumber;
    private String email;
    private String place;
    private String photoUrl;
    private String referredByVolunteerId;
}
