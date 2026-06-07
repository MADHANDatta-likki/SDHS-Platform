package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.dto.AdminParticipantReportDTO;
import com.sdhs.sdhs_backend.service.AdminParticipantReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminParticipantReportController {

    private final AdminParticipantReportService reportService;

    @GetMapping("/participants")
    public List<AdminParticipantReportDTO> getParticipantsReport(

            @RequestParam(required = false) Long eventId,

            @RequestParam(required = false)
            String participantStatus,

            @RequestParam(required = false)
            String centerCode,

            @RequestParam(required = false)
            String paymentStatus
    ) {

        return reportService.getParticipantReport(
                eventId,
                participantStatus,
                centerCode,
                paymentStatus
        );
    }
}
