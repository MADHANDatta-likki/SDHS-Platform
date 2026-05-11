package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.dto.PaymentSubmissionRequest;
import com.sdhs.sdhs_backend.entity.EventRegistration;
import com.sdhs.sdhs_backend.entity.RegistrationParticipant;
import com.sdhs.sdhs_backend.entity.RegistrationPayment;
import com.sdhs.sdhs_backend.repository.EventRegistrationRepository;
import com.sdhs.sdhs_backend.repository.RegistrationParticipantRepository;
import com.sdhs.sdhs_backend.repository.RegistrationPaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VolunteerPaymentServiceImpl implements VolunteerPaymentService {

    private final RegistrationPaymentRepository paymentRepository;
    private final EventRegistrationRepository registrationRepository;
    private final RegistrationParticipantRepository participantRepository;

    public VolunteerPaymentServiceImpl(
            RegistrationPaymentRepository paymentRepository,
            EventRegistrationRepository registrationRepository,
            RegistrationParticipantRepository participantRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.registrationRepository = registrationRepository;
        this.participantRepository = participantRepository;
    }

    @Override
    public Map<String, Object> getPaymentDetails(Long registrationId) {
        RegistrationPayment payment =
                paymentRepository.findFirstByRegistrationIdAndPaymentStatusOrderByPaymentIdDesc(
                                registrationId,
                                "PENDING_PAYMENT"
                        )
                        .orElseThrow(() ->
                                new RuntimeException("No pending payment found for this registration")
                        );

        EventRegistration registration =
                registrationRepository.findById(registrationId)
                        .orElseThrow(() ->
                                new RuntimeException("Registration not found")
                        );

        List<RegistrationParticipant> participants =
                participantRepository.findByRegistrationId(registrationId)
                        .stream()
                        .filter(participant ->
                                participant.getPaymentId() != null
                                        && participant.getPaymentId().equals(payment.getPaymentId())
                        )
                        .toList();

        if (participants.isEmpty()) {
            participants = participantRepository.findByRegistrationId(registrationId);
        }

        Map<String, Object> response = new HashMap<>();

        response.put("registrationId", registrationId);
        response.put("paymentId", payment.getPaymentId());
        response.put("amount", payment.getAmount());
        response.put("paymentStatus", payment.getPaymentStatus());
        response.put("participants", participants);

        response.put("upiId", "sdhs@upi");
        response.put("paymentQrImage",
                "https://your-supabase-url/storage/v1/object/public/sdhs-public-assets/payment/qr-code.png"
        );

        response.put("volunteerId",
                registration.getPrimaryVolunteerId()
        );

        return response;
    }

    @Override
    public void submitPayment(
            Long registrationId,
            PaymentSubmissionRequest request
    ) {

        RegistrationPayment payment =
                paymentRepository.findFirstByRegistrationIdAndPaymentStatusOrderByPaymentIdDesc(
                                registrationId,
                                "PENDING_PAYMENT"
                        )
                        .orElseThrow(() ->
                                new RuntimeException("No pending payment found for this registration")
                        );

        payment.setUtrNumber(request.getUtrNumber());
        payment.setPaymentProofFilePath(
                request.getPaymentProofFilePath()
        );

        payment.setPaymentStatus("PAYMENT_SUBMITTED");

        paymentRepository.save(payment);

        EventRegistration registration =
                registrationRepository.findById(registrationId)
                        .orElseThrow(() ->
                                new RuntimeException("Registration not found")
                        );

        registration.setOverallStatus("PAYMENT_SUBMITTED");
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
            participant.setParticipantStatus("PAYMENT_SUBMITTED");
            participantRepository.save(participant);
        }
    }
}