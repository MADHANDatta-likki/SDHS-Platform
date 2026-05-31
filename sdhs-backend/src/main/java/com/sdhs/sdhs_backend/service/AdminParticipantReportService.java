package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.dto.AdminParticipantReportDTO;

import java.util.List;

public interface AdminParticipantReportService {

    List<AdminParticipantReportDTO> getParticipantReport(
            Long eventId,
            String participantStatus,
            String centerCode
    );
}
