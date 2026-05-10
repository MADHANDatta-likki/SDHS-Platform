package com.sdhs.sdhs_backend.service;

import java.util.List;
import java.util.Map;

public interface AdminRegistrationService {

    List<Map<String, Object>> getPendingRegistrations();

    void approveRegistration(Long registrationId);

    void rejectRegistration(Long registrationId);
}