package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.dto.ParticipantApprovalRequest;
import com.sdhs.sdhs_backend.entity.Event;
import com.sdhs.sdhs_backend.entity.EventRegistration;
import com.sdhs.sdhs_backend.entity.RegistrationParticipant;
import com.sdhs.sdhs_backend.entity.RegistrationPayment;
import com.sdhs.sdhs_backend.repository.EventRegistrationRepository;
import com.sdhs.sdhs_backend.repository.EventRepository;
import com.sdhs.sdhs_backend.repository.RegistrationParticipantRepository;
import com.sdhs.sdhs_backend.repository.RegistrationPaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminParticipantServiceImpl implements AdminParticipantService {

    private final RegistrationParticipantRepository participantRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final RegistrationPaymentRepository paymentRepository;

    public AdminParticipantServiceImpl(
            RegistrationParticipantRepository participantRepository,
            EventRegistrationRepository registrationRepository,
            EventRepository eventRepository,
            RegistrationPaymentRepository paymentRepository
    ) {
        this.participantRepository = participantRepository;
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    public List<Map<String, Object>> getPendingParticipants() {

        List<RegistrationParticipant> participants =
                participantRepository.findByParticipantStatusAndAddedLater(
                        "PENDING_REVIEW",
                        true
                );

        List<Map<String, Object>> response = new ArrayList<>();

        for (RegistrationParticipant participant : participants) {

            EventRegistration registration =
                    registrationRepository.findById(participant.getRegistrationId())
                            .orElse(null);

            if (registration == null) {
                continue;
            }

            Event event =
                    eventRepository.findById(registration.getEventId())
                            .orElse(null);

            Map<String, Object> row = new HashMap<>();
            row.put("participantId", participant.getParticipantId());
            row.put("registrationId", participant.getRegistrationId());
            row.put("eventId", participant.getEventId());
            row.put("eventName", event != null ? event.getEventName() : "Unknown");
            row.put("volunteerId", participant.getVolunteerId());
            row.put("fullName", participant.getFullName());
            row.put("relationshipToPrimary", participant.getRelationshipToPrimary());
            row.put("participantType", participant.getParticipantType());
            row.put("participantStatus", participant.getParticipantStatus());
            row.put("primaryVolunteerId", registration.getPrimaryVolunteerId());
            row.put("teamLeaderCode", registration.getTeamLeaderCode());
            row.put("createdAt", participant.getCreatedAt());

            response.add(row);
        }

        return response;
    }

    @Override
    public void approveParticipants(ParticipantApprovalRequest request) {

        EventRegistration registration =
                registrationRepository.findById(request.getRegistrationId())
                        .orElseThrow(() -> new RuntimeException("Registration not found"));

        Event event =
                eventRepository.findById(registration.getEventId())
                        .orElseThrow(() -> new RuntimeException("Event not found"));

        List<RegistrationParticipant> selectedParticipants =
                participantRepository.findAllById(request.getParticipantIds());

        if (selectedParticipants.isEmpty()) {
            throw new RuntimeException("No participants selected");
        }

        RegistrationPayment payment = null;

        if (Boolean.TRUE.equals(event.getPaymentRequired())) {
            BigDecimal totalAmount =
                    getVolunteerAmount(event)
                            .multiply(BigDecimal.valueOf(selectedParticipants.size()));

            payment = new RegistrationPayment();
            payment.setRegistrationId(request.getRegistrationId());
            payment.setAmount(totalAmount);
            payment.setPaymentStatus("PENDING_PAYMENT");
            payment.setCreatedAt(LocalDateTime.now());

            payment = paymentRepository.save(payment);
        }

        for (RegistrationParticipant participant : selectedParticipants) {

            if (!participant.getRegistrationId().equals(request.getRegistrationId())) {
                throw new RuntimeException("Participant does not belong to this registration");
            }

            if (!Boolean.TRUE.equals(participant.getAddedLater())) {
                throw new RuntimeException("Only later-added participants can be approved from this flow");
            }

            if (!"PENDING_REVIEW".equals(participant.getParticipantStatus())) {
                throw new RuntimeException("Participant " + participant.getParticipantId() + " is not pending review");
            }

            if (payment == null) {
                participant.setParticipantStatus("CONFIRMED");
                participant.setPaymentId(null);
            } else {
                participant.setParticipantStatus("APPROVED_FOR_PAYMENT");
                participant.setPaymentId(payment.getPaymentId());
            }

            participantRepository.save(participant);
        }

        registration.setOverallStatus(payment == null ? "CONFIRMED" : "APPROVED_FOR_PAYMENT");
        registration.setUpdatedAt(LocalDateTime.now());
        registrationRepository.save(registration);
    }

    @Override
    public void rejectParticipants(ParticipantApprovalRequest request) {

        List<RegistrationParticipant> selectedParticipants =
                participantRepository.findAllById(request.getParticipantIds());

        for (RegistrationParticipant participant : selectedParticipants) {

            if (!Boolean.TRUE.equals(participant.getAddedLater())) {
                throw new RuntimeException("Only later-added participants can be rejected from this flow");
            }

            if (!"PENDING_REVIEW".equals(participant.getParticipantStatus())) {
                throw new RuntimeException("Participant " + participant.getParticipantId() + " is not pending review");
            }

            participant.setParticipantStatus("REJECTED");
            participantRepository.save(participant);
        }
    }

    private BigDecimal getVolunteerAmount(Event event) {
        if (event.getAmountPerVolunteer() != null) {
            return event.getAmountPerVolunteer();
        }

        if (event.getFeePerPerson() != null) {
            return event.getFeePerPerson();
        }

        return BigDecimal.ZERO;
    }
}
