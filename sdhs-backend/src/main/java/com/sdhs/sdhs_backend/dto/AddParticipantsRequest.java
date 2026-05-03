package com.sdhs.sdhs_backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class AddParticipantsRequest {

    private List<ParticipantDTO> participants;
    private PaymentDTO payment;

    @Getter
    @Setter
    public static class ParticipantDTO {
        private String volunteerId;
        private String fullName;
        private Integer age;
        private String relationship;
    }

    @Getter
    @Setter
    public static class PaymentDTO {
        private BigDecimal amount;
        private String utrNumber;
        private LocalDate transactionDate;
    }
}