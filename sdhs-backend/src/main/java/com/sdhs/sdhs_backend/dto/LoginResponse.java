package com.sdhs.sdhs_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private String vid;
    private String displayName;
    private String phone;
    private Boolean isAdmin;
    private String adminRole;
}
