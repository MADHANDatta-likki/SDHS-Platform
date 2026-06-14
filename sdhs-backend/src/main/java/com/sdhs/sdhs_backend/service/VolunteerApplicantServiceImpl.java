package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.dto.VolunteerApplicantRejectRequest;
import com.sdhs.sdhs_backend.dto.VolunteerApplicantRequest;
import com.sdhs.sdhs_backend.dto.VolunteerApplicantResponse;
import com.sdhs.sdhs_backend.entity.VolunteerApplicant;
import com.sdhs.sdhs_backend.entity.Volunteer;
import com.sdhs.sdhs_backend.repository.VolunteerApplicantRepository;
import com.sdhs.sdhs_backend.repository.VolunteerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class VolunteerApplicantServiceImpl implements VolunteerApplicantService {

    private static final String STATUS_PENDING_REVIEW = "PENDING_REVIEW";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String SYSTEM_REVIEWER = "SYSTEM";

    private final VolunteerApplicantRepository applicantRepository;
    private final VolunteerRepository volunteerRepository;

    public VolunteerApplicantServiceImpl(
            VolunteerApplicantRepository applicantRepository,
            VolunteerRepository volunteerRepository
    ) {
        this.applicantRepository = applicantRepository;
        this.volunteerRepository = volunteerRepository;
    }

    @Override
    @Transactional
    public VolunteerApplicant submitApplicant(VolunteerApplicantRequest request) {
        validateRequired(request);

        String referredByVolunteerId = request.getReferredByVolunteerId().trim().toUpperCase();

        if (volunteerRepository.findByVid(referredByVolunteerId).isEmpty()) {
            throw new RuntimeException("Referred By Volunteer ID was not found in SDHS records.");
        }

        LocalDateTime now = LocalDateTime.now();

        VolunteerApplicant applicant = new VolunteerApplicant();
        applicant.setFullName(request.getFullName().trim());
        applicant.setContactNumber(request.getContactNumber().trim());
        applicant.setEmail(trimToNull(request.getEmail()));
        applicant.setPlace(request.getPlace().trim());
        applicant.setPhotoUrl(request.getPhotoUrl().trim());
        applicant.setReferredByVolunteerId(referredByVolunteerId);
        applicant.setApplicantStatus(STATUS_PENDING_REVIEW);
        applicant.setCreatedAt(now);
        applicant.setUpdatedAt(now);

        return applicantRepository.save(applicant);
    }

    @Override
    public List<VolunteerApplicantResponse> getApplicants(String status) {
        List<VolunteerApplicant> applicants;

        if (status == null || status.isBlank()) {
            applicants = applicantRepository.findAllByOrderByCreatedAtDesc();
        } else {
            applicants = applicantRepository.findByApplicantStatusOrderByCreatedAtDesc(
                    status.trim().toUpperCase()
            );
        }

        return toResponseList(applicants);
    }

    @Override
    @Transactional
    public VolunteerApplicant approveApplicant(Long applicantId) {
        VolunteerApplicant applicant = getPendingApplicant(applicantId);
        LocalDateTime now = LocalDateTime.now();

        applicant.setApplicantStatus(STATUS_APPROVED);
        applicant.setAdminComments(null);
        applicant.setReviewedAt(now);
        applicant.setReviewedBy(SYSTEM_REVIEWER);
        applicant.setUpdatedAt(now);

        return applicantRepository.save(applicant);
    }

    @Override
    @Transactional
    public VolunteerApplicant rejectApplicant(
            Long applicantId,
            VolunteerApplicantRejectRequest request
    ) {
        VolunteerApplicant applicant = getPendingApplicant(applicantId);
        String comments = request == null ? null : trimToNull(request.getAdminComments());

        if (comments == null) {
            throw new RuntimeException("Admin comments are required when rejecting an applicant.");
        }

        LocalDateTime now = LocalDateTime.now();

        applicant.setApplicantStatus(STATUS_REJECTED);
        applicant.setAdminComments(comments);
        applicant.setReviewedAt(now);
        applicant.setReviewedBy(SYSTEM_REVIEWER);
        applicant.setUpdatedAt(now);

        return applicantRepository.save(applicant);
    }

    private List<VolunteerApplicantResponse> toResponseList(
            List<VolunteerApplicant> applicants
    ) {
        List<String> referrerIds = applicants.stream()
                .map(VolunteerApplicant::getReferredByVolunteerId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<String, Volunteer> referrerMap = referrerIds.isEmpty()
                ? Collections.emptyMap()
                : volunteerRepository.findByVidIn(referrerIds)
                .stream()
                .collect(Collectors.toMap(
                        Volunteer::getVid,
                        volunteer -> volunteer
                ));

        List<Volunteer> volunteers = volunteerRepository.findAll();

        return applicants.stream()
                .map(applicant -> {
                    Volunteer duplicate = findPossibleDuplicate(applicant, volunteers);

                    return toResponse(
                            applicant,
                            referrerMap.get(applicant.getReferredByVolunteerId()),
                            duplicate
                    );
                })
                .toList();
    }

    private VolunteerApplicantResponse toResponse(
            VolunteerApplicant applicant,
            Volunteer referrer,
            Volunteer possibleDuplicate
    ) {
        return VolunteerApplicantResponse.builder()
                .applicantId(applicant.getApplicantId())
                .fullName(applicant.getFullName())
                .contactNumber(applicant.getContactNumber())
                .email(applicant.getEmail())
                .place(applicant.getPlace())
                .photoUrl(applicant.getPhotoUrl())
                .referredByVolunteerId(applicant.getReferredByVolunteerId())
                .referredByVolunteerName(
                        referrer != null ? referrer.getDisplayName() : null
                )
                .referredByCenterCode(
                        referrer != null ? referrer.getVCentreId() : null
                )
                .applicantStatus(applicant.getApplicantStatus())
                .adminComments(applicant.getAdminComments())
                .createdAt(applicant.getCreatedAt())
                .reviewedAt(applicant.getReviewedAt())
                .reviewedBy(applicant.getReviewedBy())
                .possibleDuplicateVolunteerId(
                        possibleDuplicate != null ? possibleDuplicate.getVid() : null
                )
                .possibleDuplicateVolunteerName(
                        possibleDuplicate != null ? possibleDuplicate.getDisplayName() : null
                )
                .possibleDuplicateCenterCode(
                        possibleDuplicate != null ? possibleDuplicate.getVCentreId() : null
                )
                .possibleDuplicatePhone(
                        possibleDuplicate != null ? possibleDuplicate.getPhone() : null
                )
                .possibleDuplicateEmail(
                        possibleDuplicate != null ? possibleDuplicate.getEmail() : null
                )
                .possibleDuplicateImageUrl(
                        possibleDuplicate != null
                                ? "https://sdhs2.azurewebsites.net/Images/Volunteers/"
                                + possibleDuplicate.getVid()
                                + ".jpg?sdfd944"
                                : null
                )
                .build();
    }

    private Volunteer findPossibleDuplicate(
            VolunteerApplicant applicant,
            List<Volunteer> volunteers
    ) {
        String applicantPhone = normalize(applicant.getContactNumber());
        String applicantEmail = normalizeLower(applicant.getEmail());
        String applicantName = normalizeLower(applicant.getFullName());

        if (applicantPhone != null) {
            for (Volunteer volunteer : volunteers) {
                if (applicantPhone.equals(normalize(volunteer.getPhone()))) {
                    return volunteer;
                }
            }
        }

        if (applicantEmail != null) {
            for (Volunteer volunteer : volunteers) {
                if (applicantEmail.equals(normalizeLower(volunteer.getEmail()))) {
                    return volunteer;
                }
            }
        }

        if (applicantName != null) {
            for (Volunteer volunteer : volunteers) {
                String volunteerName = normalizeLower(volunteer.getDisplayName());

                if (volunteerName != null
                        && (volunteerName.contains(applicantName)
                        || applicantName.contains(volunteerName))) {
                    return volunteer;
                }
            }
        }

        return null;
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String normalizeLower(String value) {
        String normalized = normalize(value);

        return normalized == null ? null : normalized.toLowerCase();
    }

    private VolunteerApplicant getPendingApplicant(Long applicantId) {
        VolunteerApplicant applicant =
                applicantRepository.findById(applicantId)
                        .orElseThrow(() -> new RuntimeException("Volunteer applicant not found."));

        if (!STATUS_PENDING_REVIEW.equals(applicant.getApplicantStatus())) {
            throw new RuntimeException("Only pending volunteer applicants can be updated.");
        }

        return applicant;
    }

    private void validateRequired(VolunteerApplicantRequest request) {
        if (request == null) {
            throw new RuntimeException("Please complete the Join Us form before submitting.");
        }

        if (isBlank(request.getFullName())) {
            throw new RuntimeException("Full Name is required.");
        }

        if (isBlank(request.getContactNumber())) {
            throw new RuntimeException("Contact Number is required.");
        }

        if (isBlank(request.getPlace())) {
            throw new RuntimeException("Place is required.");
        }

        if (isBlank(request.getPhotoUrl())) {
            throw new RuntimeException("Photo upload is required.");
        }

        if (isBlank(request.getReferredByVolunteerId())) {
            throw new RuntimeException("Referred By Volunteer ID is required.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
