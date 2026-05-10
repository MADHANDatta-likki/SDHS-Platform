package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.dto.ParticipantApprovalRequest;

import java.util.List;
import java.util.Map;

public interface AdminParticipantService {

    List<Map<String, Object>> getPendingParticipants();

    void approveParticipants(ParticipantApprovalRequest request);

    void rejectParticipants(ParticipantApprovalRequest request);
}