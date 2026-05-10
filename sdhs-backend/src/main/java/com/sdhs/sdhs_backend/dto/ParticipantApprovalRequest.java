package com.sdhs.sdhs_backend.dto;

import java.util.List;

public class ParticipantApprovalRequest {

    private Long registrationId;
    private List<Long> participantIds;

    public Long getRegistrationId() {
        return registrationId;
    }

    public void setRegistrationId(Long registrationId) {
        this.registrationId = registrationId;
    }

    public List<Long> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<Long> participantIds) {
        this.participantIds = participantIds;
    }
}