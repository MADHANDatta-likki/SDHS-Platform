package com.sdhs.sdhs_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "registration_payment")
public class RegistrationPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "registration_id")
    private Long registrationId;

    private BigDecimal amount;

    @Column(name = "utr_number")
    private String utrNumber;

    @Column(name = "transaction_date")
    private LocalDate transactionDate;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "payment_proof_file_path")
    private String paymentProofFilePath;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verified_by")
    private String verifiedBy;
}