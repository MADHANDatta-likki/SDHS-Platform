package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.dto.AdminParticipantReportDTO;
import com.sdhs.sdhs_backend.entity.Event;
import com.sdhs.sdhs_backend.entity.EventRegistration;
import com.sdhs.sdhs_backend.entity.RegistrationParticipant;
import com.sdhs.sdhs_backend.entity.RegistrationPayment;
import com.sdhs.sdhs_backend.entity.Volunteer;
import com.sdhs.sdhs_backend.repository.EventRepository;
import com.sdhs.sdhs_backend.repository.EventRegistrationRepository;
import com.sdhs.sdhs_backend.repository.RegistrationParticipantRepository;
import com.sdhs.sdhs_backend.repository.RegistrationPaymentRepository;
import com.sdhs.sdhs_backend.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminParticipantReportServiceImpl
        implements AdminParticipantReportService {

    private final RegistrationParticipantRepository participantRepository;
    private final VolunteerRepository volunteerRepository;
    private final RegistrationPaymentRepository paymentRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    @Override
    public List<AdminParticipantReportDTO> getParticipantReport(
            Long eventId,
            String participantStatus,
            String centerCode,
            String paymentStatus
    ) {

        if (participantStatus != null && participantStatus.isBlank()) {
            participantStatus = null;
        }

        if (centerCode != null && centerCode.isBlank()) {
            centerCode = null;
        }

        if (paymentStatus != null && paymentStatus.isBlank()) {
            paymentStatus = null;
        }

        if (participantStatus != null) {
            participantStatus = participantStatus.trim().toUpperCase();
        }

        if (paymentStatus != null) {
            paymentStatus = paymentStatus.trim().toUpperCase();
        }

        final String normalizedCenterCode;

        if (centerCode != null) {
            normalizedCenterCode = centerCode.trim().toUpperCase();
        } else {
            normalizedCenterCode = null;
        }

        List<RegistrationParticipant> participants =
                participantRepository.searchParticipantsForReport(
                        eventId,
                        participantStatus
                );

        List<String> volunteerIds = participants.stream()
                .map(RegistrationParticipant::getVolunteerId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<String, Volunteer> volunteerMap = volunteerIds.isEmpty()
                ? Collections.emptyMap()
                : volunteerRepository.findByVidIn(volunteerIds)
                .stream()
                .collect(Collectors.toMap(
                        Volunteer::getVid,
                        v -> v
                ));

        if (normalizedCenterCode != null) {

            participants = participants.stream()
                    .filter(participant -> {

                        Volunteer volunteer =
                                volunteerMap.get(participant.getVolunteerId());

                        return volunteer != null
                                && volunteer.getVCentreId() != null
                                && volunteer.getVCentreId()
                                .equalsIgnoreCase(normalizedCenterCode);
                    })
                    .toList();
        }

        List<Long> eventIds = participants.stream()
                .map(RegistrationParticipant::getEventId)
                .distinct()
                .toList();

        Map<Long, Event> eventMap =
                eventIds.isEmpty()
                        ? Collections.emptyMap()
                        : eventRepository.findAllById(eventIds)
                        .stream()
                        .collect(Collectors.toMap(
                                Event::getEventId,
                                e -> e
                        ));

        List<Long> registrationIds = participants.stream()
                .map(RegistrationParticipant::getRegistrationId)
                .distinct()
                .toList();

        Map<Long, EventRegistration> registrationMap =
                registrationIds.isEmpty()
                        ? Collections.emptyMap()
                        : registrationRepository.findAllById(registrationIds)
                        .stream()
                        .collect(Collectors.toMap(
                                EventRegistration::getRegistrationId,
                                registration -> registration
                        ));

        List<Long> paymentIds = participants.stream()
                .map(RegistrationParticipant::getPaymentId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, RegistrationPayment> paymentMap = paymentIds.isEmpty()
                ? Collections.emptyMap()
                : paymentRepository.findAllById(paymentIds)
                .stream()
                .collect(Collectors.toMap(
                        RegistrationPayment::getPaymentId,
                        payment -> payment
                ));

        List<AdminParticipantReportDTO> response = new ArrayList<>();

        for (RegistrationParticipant participant : participants) {

            Volunteer volunteer =
                    volunteerMap.get(participant.getVolunteerId());

            Event event =
                    eventMap.get(participant.getEventId());

            EventRegistration registration =
                    registrationMap.get(participant.getRegistrationId());

            RegistrationPayment payment =
                    participant.getPaymentId() == null
                            ? null
                            : paymentMap.get(participant.getPaymentId());

            String effectivePaymentStatus =
                    payment != null
                            ? payment.getPaymentStatus()
                            : Boolean.FALSE.equals(
                                    event != null ? event.getPaymentRequired() : null
                            )
                                    ? "NOT_REQUIRED"
                                    : null;

            if (paymentStatus != null
                    && (effectivePaymentStatus == null
                    || !paymentStatus.equalsIgnoreCase(effectivePaymentStatus))) {
                continue;
            }

            Integer age = null;

            if (volunteer != null && volunteer.getDateOfBirth() != null) {

                age = Period.between(
                        volunteer.getDateOfBirth(),
                        LocalDate.now()
                ).getYears();
            }

            response.add(
                    AdminParticipantReportDTO.builder()
                            .registrationId(participant.getRegistrationId())
                            .participantId(participant.getParticipantId())
                            .eventId(participant.getEventId())

                            .eventName(
                                    event != null
                                            ? event.getEventName()
                                            : null
                            )

                            .volunteerId(participant.getVolunteerId())

                            .volunteerName(
                                    volunteer != null
                                            ? volunteer.getDisplayName()
                                            : null
                            )

                            .centerCode(
                                    volunteer != null
                                            ? volunteer.getVCentreId()
                                            : null
                            )

                            .age(age)

                            .phone(
                                    volunteer != null
                                            ? volunteer.getPhone()
                                            : null
                            )

                            .email(
                                    volunteer != null
                                            ? volunteer.getEmail()
                                            : null
                            )

                            .registrationStatus(
                                    registration != null
                                            ? registration.getOverallStatus()
                                            : null
                            )

                            .participantStatus(
                                    participant.getParticipantStatus()
                            )

                            .paymentStatus(
                                    effectivePaymentStatus
                            )

                            .addedLater(
                                    participant.getAddedLater()
                            )

                            .accommodationRequired(
                                    participant.getAccommodationRequired()
                            )

                            .imageUrl(
                                    "https://sdhs2.azurewebsites.net/Images/Volunteers/"
                                            + participant.getVolunteerId()
                                            + ".jpg?sdfd944"
                            )

                            .build()
            );
        }

        return response;
    }
}
