package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.dto.VolunteerApplicantRejectRequest;
import com.sdhs.sdhs_backend.dto.VolunteerApplicantRequest;
import com.sdhs.sdhs_backend.dto.VolunteerApplicantResponse;
import com.sdhs.sdhs_backend.entity.VolunteerApplicant;

import java.util.List;

public interface VolunteerApplicantService {

    VolunteerApplicant submitApplicant(VolunteerApplicantRequest request);

    List<VolunteerApplicantResponse> getApplicants(String status);

    VolunteerApplicant approveApplicant(Long applicantId);

    VolunteerApplicant rejectApplicant(Long applicantId, VolunteerApplicantRejectRequest request);
}
