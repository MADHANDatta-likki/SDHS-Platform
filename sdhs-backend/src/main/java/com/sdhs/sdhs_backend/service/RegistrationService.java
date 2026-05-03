package com.sdhs.sdhs_backend.service;

import java.util.List;

import com.sdhs.sdhs_backend.dto.AddParticipantsRequest;
import com.sdhs.sdhs_backend.dto.CampRegistrationRequest;
import com.sdhs.sdhs_backend.dto.RegistrationDetailsResponse;

public interface RegistrationService {

    void registerCamp(CampRegistrationRequest request);
    List<?> getMyRegistrations(String volunteerId);
    void addParticipants(Long registrationId, AddParticipantsRequest request);
    RegistrationDetailsResponse getRegistrationDetails(Long registrationId);
}