package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.dto.AddParticipantsRequest;
import com.sdhs.sdhs_backend.dto.CampRegistrationRequest;
import com.sdhs.sdhs_backend.dto.MyRegistrationResponse;
import com.sdhs.sdhs_backend.dto.RegistrationDetailsResponse;
import com.sdhs.sdhs_backend.entity.Event;
import com.sdhs.sdhs_backend.entity.EventRegistration;
import com.sdhs.sdhs_backend.entity.RegistrationParticipant;
import com.sdhs.sdhs_backend.entity.RegistrationPayment;
import com.sdhs.sdhs_backend.repository.EventRegistrationRepository;
import com.sdhs.sdhs_backend.repository.EventRepository;
import com.sdhs.sdhs_backend.repository.RegistrationParticipantRepository;
import com.sdhs.sdhs_backend.repository.RegistrationPaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RegistrationServiceImpl implements RegistrationService {

    private final EventRegistrationRepository registrationRepo;
    private final RegistrationParticipantRepository participantRepo;
    private final RegistrationPaymentRepository paymentRepo;
    private final EventRepository eventRepo;

    public RegistrationServiceImpl(
            EventRegistrationRepository registrationRepo,
            RegistrationParticipantRepository participantRepo,
            RegistrationPaymentRepository paymentRepo,
            EventRepository eventRepo) {
        this.registrationRepo = registrationRepo;
        this.participantRepo = participantRepo;
        this.paymentRepo = paymentRepo;
        this.eventRepo = eventRepo;
    }

    @Override
    public void registerCamp(CampRegistrationRequest request) {

        Event event = eventRepo.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        validateRegistrationAllowed(event);

        EventRegistration reg = new EventRegistration();
        reg.setEventId(request.getEventId());
        reg.setPrimaryVolunteerId(
                request.getParticipants().stream()
                        .filter(p -> p.getType().equals("PRIMARY"))
                        .findFirst()
                        .get()
                        .getVolunteerId()
        );
        reg.setTeamLeaderCode(request.getTeamLeaderCode());
        reg.setOverallStatus("PENDING_REVIEW");
        reg.setCreatedAt(LocalDateTime.now());
        reg.setUpdatedAt(LocalDateTime.now());

        reg = registrationRepo.save(reg);

        for (CampRegistrationRequest.ParticipantDTO p : request.getParticipants()) {

            RegistrationParticipant rp = new RegistrationParticipant();
            rp.setRegistrationId(reg.getRegistrationId());
            rp.setEventId(request.getEventId());
            rp.setVolunteerId(p.getVolunteerId());
            rp.setFullName(p.getFullName());
            rp.setAge(p.getAge());
            rp.setRelationshipToPrimary(p.getRelationship());
            rp.setParticipantType(p.getType());
            rp.setParticipantStatus("PENDING_REVIEW");
            rp.setPaymentId(null);
            rp.setCreatedAt(LocalDateTime.now());
            rp.setAddedLater(false);

            try {
                participantRepo.save(rp);
            } catch (DataIntegrityViolationException ex) {
                throw new RuntimeException(
                        "Volunteer " + p.getVolunteerId() + " is already registered for this event"
                );
            }
        }
    }

    @Override
    public List<MyRegistrationResponse> getMyRegistrations(String volunteerId) {

        List<EventRegistration> registrations = registrationRepo.findByPrimaryVolunteerId(volunteerId);
        List<MyRegistrationResponse> response = new ArrayList<>();

        for (EventRegistration reg : registrations) {
            int count = participantRepo.countByRegistrationId(reg.getRegistrationId());

            List<RegistrationPayment> payments =
                    paymentRepo.findAllByRegistrationId(reg.getRegistrationId());

            Event event = eventRepo.findById(reg.getEventId()).orElse(null);

            BigDecimal totalAmount = payments.stream()
                    .map(RegistrationPayment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String latestPaymentStatus = payments.isEmpty()
                    ? "NA"
                    : payments.get(payments.size() - 1).getPaymentStatus();

            boolean hasPendingAdditionalVolunteers = participantRepo.findByRegistrationId(reg.getRegistrationId())
                    .stream()
                    .anyMatch(participant ->
                            Boolean.TRUE.equals(participant.getAddedLater())
                                    && "PENDING_REVIEW".equals(participant.getParticipantStatus())
                    );

            response.add(new MyRegistrationResponse(
                    reg.getRegistrationId(),
                    reg.getEventId(),
                    event != null ? event.getEventName() : "Unknown",
                    reg.getOverallStatus(),
                    count,
                    totalAmount,
                    latestPaymentStatus,
                    hasPendingAdditionalVolunteers
            ));
        }

        return response;
    }

    @Override
    public void addParticipants(Long registrationId, AddParticipantsRequest request) {

        EventRegistration registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        Event event = eventRepo.findById(registration.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        validateRegistrationAllowed(event);

        for (AddParticipantsRequest.ParticipantDTO p : request.getParticipants()) {

            participantRepo.findByEventIdAndVolunteerId(registration.getEventId(), p.getVolunteerId())
                    .ifPresent(existing -> {
                        throw new RuntimeException("Volunteer " + p.getVolunteerId() + " is already registered for this event");
                    });

            RegistrationParticipant rp = new RegistrationParticipant();
            rp.setRegistrationId(registrationId);
            rp.setEventId(registration.getEventId());
            rp.setVolunteerId(p.getVolunteerId());
            rp.setFullName(p.getFullName());
            rp.setAge(p.getAge());
            rp.setRelationshipToPrimary(p.getRelationship());
            rp.setParticipantType("ACCOMPANYING");
            rp.setParticipantStatus("PENDING_REVIEW");
            rp.setPaymentId(null);
            rp.setCreatedAt(LocalDateTime.now());
            rp.setAddedLater(true);

            try {
                participantRepo.save(rp);
            } catch (DataIntegrityViolationException ex) {
                throw new RuntimeException(
                        "Volunteer " + p.getVolunteerId() + " is already registered for this event"
                );
            }
        }
    }

    @Override
    public RegistrationDetailsResponse getRegistrationDetails(Long registrationId) {

        EventRegistration reg = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        Event event = eventRepo.findById(reg.getEventId()).orElse(null);

        List<RegistrationParticipant> participants =
                participantRepo.findByRegistrationId(registrationId);

        List<RegistrationPayment> payments =
                paymentRepo.findAllByRegistrationId(registrationId);

        List<RegistrationDetailsResponse.ParticipantDetails> participantDTOs = new ArrayList<>();

        for (RegistrationParticipant p : participants) {
            participantDTOs.add(
                    new RegistrationDetailsResponse.ParticipantDetails(
                            p.getParticipantId(),
                            p.getVolunteerId(),
                            p.getFullName(),
                            p.getAge(),
                            p.getRelationshipToPrimary(),
                            p.getParticipantType(),
                            p.getParticipantStatus(),
                            p.getPaymentId()
                    )
            );
        }

        List<RegistrationDetailsResponse.PaymentDetails> paymentDTOs = new ArrayList<>();

        for (RegistrationPayment pay : payments) {
            paymentDTOs.add(
                    new RegistrationDetailsResponse.PaymentDetails(
                            pay.getPaymentId(),
                            pay.getAmount(),
                            pay.getUtrNumber(),
                            pay.getTransactionDate(),
                            pay.getPaymentStatus(),
                            pay.getVerifiedAt()
                    )
            );
        }

        return new RegistrationDetailsResponse(
                reg.getRegistrationId(),
                reg.getEventId(),
                event != null ? event.getEventName() : "Unknown",
                reg.getOverallStatus(),
                reg.getTeamLeaderCode(),
                participantDTOs,
                paymentDTOs
        );
    }

    private void validateRegistrationAllowed(Event event) {
        LocalDate today = LocalDate.now();

        if (!Boolean.TRUE.equals(event.getActive())) {
            throw new RuntimeException("Registration is not available for this event.");
        }

        if (!Boolean.TRUE.equals(event.getRegistrationOpen())) {
            throw new RuntimeException("Registration is closed for this event.");
        }

        if (!"ACTIVE".equalsIgnoreCase(event.getEventStatus() == null ? "ACTIVE" : event.getEventStatus())) {
            throw new RuntimeException("Registration is not available for this event.");
        }

        if (event.getEndDate() != null && event.getEndDate().isBefore(today)) {
            throw new RuntimeException("Registration is closed for this event.");
        }

        if (event.getRegistrationStartDate() != null && today.isBefore(event.getRegistrationStartDate())) {
            throw new RuntimeException("Registration has not opened for this event yet.");
        }

        if (event.getRegistrationEndDate() != null && today.isAfter(event.getRegistrationEndDate())) {
            throw new RuntimeException("Registration is closed for this event.");
        }
    }
}
