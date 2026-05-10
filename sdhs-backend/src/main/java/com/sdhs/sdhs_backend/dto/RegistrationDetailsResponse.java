package com.sdhs.sdhs_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class RegistrationDetailsResponse {

    private Long registrationId;
    private Long eventId;
    private String eventName;
    private String registrationStatus;
    private String teamLeaderCode;

    private List<ParticipantDetails> participants;
    private List<PaymentDetails> payments;

    @Getter
    @AllArgsConstructor
    public static class ParticipantDetails {
        private Long participantId;
        private String volunteerId;
        private String fullName;
        private Integer age;
        private String relationshipToPrimary;
        private String participantType;
        private String participantStatus;
        private Long paymentId;
    }

    @Getter
    @AllArgsConstructor
    public static class PaymentDetails {
        private Long paymentId;
        private BigDecimal amount;
        private String utrNumber;
        private LocalDate transactionDate;
        private String paymentStatus;
        private LocalDateTime verifiedAt;
    }
}