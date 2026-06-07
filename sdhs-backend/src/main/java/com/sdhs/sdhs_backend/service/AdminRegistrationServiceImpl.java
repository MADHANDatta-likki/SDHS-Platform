package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.entity.Event;
import com.sdhs.sdhs_backend.entity.EventRegistration;
import com.sdhs.sdhs_backend.entity.RegistrationParticipant;
import com.sdhs.sdhs_backend.entity.RegistrationPayment;
import com.sdhs.sdhs_backend.repository.EventRegistrationRepository;
import com.sdhs.sdhs_backend.repository.EventRepository;
import com.sdhs.sdhs_backend.repository.RegistrationParticipantRepository;
import com.sdhs.sdhs_backend.repository.RegistrationPaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminRegistrationServiceImpl implements AdminRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final RegistrationParticipantRepository participantRepository;
    private final RegistrationPaymentRepository paymentRepository;
    private final EventRepository eventRepository;

    public AdminRegistrationServiceImpl(
            EventRegistrationRepository registrationRepository,
            RegistrationParticipantRepository participantRepository,
            RegistrationPaymentRepository paymentRepository,
            EventRepository eventRepository
    ) {
        this.registrationRepository = registrationRepository;
        this.participantRepository = participantRepository;
        this.paymentRepository = paymentRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public List<Map<String, Object>> getPendingRegistrations() {

        List<EventRegistration> registrations =
                registrationRepository.findByOverallStatus("PENDING_REVIEW");

        List<Map<String, Object>> response = new ArrayList<>();

        for (EventRegistration reg : registrations) {

            List<RegistrationParticipant> participants =
                    participantRepository.findByRegistrationId(reg.getRegistrationId());

            Map<String, Object> row = new HashMap<>();
            row.put("registrationId", reg.getRegistrationId());
            row.put("eventId", reg.getEventId());
            row.put("primaryVolunteerId", reg.getPrimaryVolunteerId());
            row.put("teamLeaderCode", reg.getTeamLeaderCode());
            row.put("status", reg.getOverallStatus());
            row.put("participantsCount", participants.size());
            row.put("participants", participants);
            row.put("createdAt", reg.getCreatedAt());

            response.add(row);
        }

        return response;
    }

    @Override
    @Transactional
    public void approveRegistration(Long registrationId) {

        EventRegistration registration =
                registrationRepository.findById(registrationId)
                        .orElseThrow(() -> new RuntimeException("Registration not found"));

        List<RegistrationParticipant> participants =
                participantRepository.findByRegistrationId(registrationId)
                        .stream()
                        .filter(participant -> !Boolean.TRUE.equals(participant.getAddedLater()))
                        .toList();

        if (participants.isEmpty()) {
            throw new RuntimeException("No participants found for this registration");
        }

        Event event =
                eventRepository.findById(registration.getEventId())
                        .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!Boolean.TRUE.equals(event.getPaymentRequired())) {
            RegistrationPayment payment = new RegistrationPayment();
            payment.setRegistrationId(registrationId);
            payment.setAmount(BigDecimal.ZERO);
            payment.setPaymentStatus("NOT_REQUIRED");
            payment.setCreatedAt(LocalDateTime.now());
            payment.setVerifiedAt(LocalDateTime.now());
            payment.setVerifiedBy("SYSTEM");

            payment = paymentRepository.save(payment);

            for (RegistrationParticipant participant : participants) {
                participant.setParticipantStatus("CONFIRMED");
                participant.setPaymentId(payment.getPaymentId());
                participantRepository.save(participant);
            }

            registration.setOverallStatus("CONFIRMED");
            registration.setUpdatedAt(LocalDateTime.now());
            registrationRepository.save(registration);
            return;
        }

        BigDecimal totalAmount =
                getVolunteerAmount(event)
                        .multiply(BigDecimal.valueOf(participants.size()));

        RegistrationPayment payment = new RegistrationPayment();
        payment.setRegistrationId(registrationId);
        payment.setAmount(totalAmount);
        payment.setPaymentStatus("PENDING_PAYMENT");
        payment.setCreatedAt(LocalDateTime.now());

        payment = paymentRepository.save(payment);

        for (RegistrationParticipant participant : participants) {
            participant.setParticipantStatus("APPROVED_FOR_PAYMENT");
            participant.setPaymentId(payment.getPaymentId());
            participantRepository.save(participant);
        }

        registration.setOverallStatus("APPROVED_FOR_PAYMENT");
        registration.setUpdatedAt(LocalDateTime.now());

        registrationRepository.save(registration);
    }

    @Override
    @Transactional
    public void rejectRegistration(Long registrationId) {

        EventRegistration registration =
                registrationRepository.findById(registrationId)
                        .orElseThrow(() -> new RuntimeException("Registration not found"));

        registration.setOverallStatus("REJECTED");
        registration.setUpdatedAt(LocalDateTime.now());

        registrationRepository.save(registration);

        List<RegistrationParticipant> participants =
                participantRepository.findByRegistrationId(registrationId)
                        .stream()
                        .filter(participant -> !Boolean.TRUE.equals(participant.getAddedLater()))
                        .toList();

        for (RegistrationParticipant participant : participants) {
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
