package com.sdhs.sdhs_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    private String volunteerId;   // maps to VID
    private String phoneNumber;   // maps to Phone
}