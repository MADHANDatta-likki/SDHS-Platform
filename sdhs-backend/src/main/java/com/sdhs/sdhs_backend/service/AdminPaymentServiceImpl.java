package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.entity.EventRegistration;
import com.sdhs.sdhs_backend.entity.RegistrationParticipant;
import com.sdhs.sdhs_backend.entity.RegistrationPayment;
import com.sdhs.sdhs_backend.repository.EventRegistrationRepository;
import com.sdhs.sdhs_backend.repository.RegistrationParticipantRepository;
import com.sdhs.sdhs_backend.repository.RegistrationPaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminPaymentServiceImpl implements AdminPaymentService {

    private final RegistrationPaymentRepository paymentRepository;
    private final EventRegistrationRepository registrationRepository;
    private final RegistrationParticipantRepository participantRepository;

    public AdminPaymentServiceImpl(
            RegistrationPaymentRepository paymentRepository,
            EventRegistrationRepository registrationRepository,
            RegistrationParticipantRepository participantRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.registrationRepository = registrationRepository;
        this.participantRepository = participantRepository;
    }

    @Override
    public List<Map<String, Object>> getSubmittedPayments() {

        List<RegistrationPayment> payments =
                paymentRepository.findByPaymentStatus("PAYMENT_SUBMITTED");

        List<Map<String, Object>> response = new ArrayList<>();

        for (RegistrationPayment payment : payments) {

            EventRegistration registration =
                    registrationRepository.findById(payment.getRegistrationId())
                            .orElse(null);

            if (registration == null) {
                continue;
            }

            List<RegistrationParticipant> participants =
                    participantRepository.findByRegistrationId(registration.getRegistrationId())
                            .stream()
                            .filter(participant ->
                                    participant.getPaymentId() != null
                                            && participant.getPaymentId().equals(payment.getPaymentId())
                            )
                            .toList();

            Map<String, Object> row = new HashMap<>();
            row.put("registrationId", registration.getRegistrationId());
            row.put("paymentId", payment.getPaymentId());
            row.put("volunteerId", registration.getPrimaryVolunteerId());
            row.put("amount", payment.getAmount());
            row.put("utrNumber", payment.getUtrNumber());
            row.put("paymentProofFilePath", payment.getPaymentProofFilePath());
            row.put("paymentStatus", payment.getPaymentStatus());
            row.put("registrationStatus", registration.getOverallStatus());
            row.put("participants", participants);

            response.add(row);
        }

        return response;
    }

    @Override
    public void verifyPayment(Long registrationId) {

        RegistrationPayment payment =
                paymentRepository.findFirstByRegistrationIdAndPaymentStatusOrderByPaymentIdDesc(
                                registrationId,
                                "PAYMENT_SUBMITTED"
                        )
                        .orElseThrow(() ->
                                new RuntimeException("Submitted payment not found")
                        );

        payment.setPaymentStatus("PAYMENT_VERIFIED");
        payment.setVerifiedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        EventRegistration registration =
                registrationRepository.findById(registrationId)
                        .orElseThrow(() ->
                                new RuntimeException("Registration not found")
                        );

        registration.setOverallStatus("CONFIRMED");
        registration.setUpdatedAt(LocalDateTime.now());
        registrationRepository.save(registration);
        List<RegistrationParticipant> participants =
                participantRepository.findByRegistrationId(registrationId)
                        .stream()
                        .filter(participant ->
                                participant.getPaymentId() != null
                                        && participant.getPaymentId().equals(payment.getPaymentId())
                        )
                        .toList();

        for (RegistrationParticipant participant : participants) {
            participant.setParticipantStatus("CONFIRMED");
            participantRepository.save(participant);
        }
    }

    @Override
    public void rejectPayment(Long registrationId) {

        RegistrationPayment payment =
                paymentRepository.findFirstByRegistrationIdAndPaymentStatusOrderByPaymentIdDesc(
                                registrationId,
                                "PAYMENT_SUBMITTED"
                        )
                        .orElseThrow(() ->
                                new RuntimeException("Submitted payment not found")
                        );

        payment.setPaymentStatus("PAYMENT_REJECTED");
        paymentRepository.save(payment);

        EventRegistration registration =
                registrationRepository.findById(registrationId)
                        .orElseThrow(() ->
                                new RuntimeException("Registration not found")
                        );

        registration.setOverallStatus("APPROVED_FOR_PAYMENT");
        registration.setUpdatedAt(LocalDateTime.now());
        registrationRepository.save(registration);
        List<RegistrationParticipant> participants =
                participantRepository.findByRegistrationId(registrationId)
                        .stream()
                        .filter(participant ->
                                participant.getPaymentId() != null
                                        && participant.getPaymentId().equals(payment.getPaymentId())
                        )
                        .toList();

        for (RegistrationParticipant participant : participants) {
            participant.setParticipantStatus("APPROVED_FOR_PAYMENT");
            participantRepository.save(participant);
        }
    }
}