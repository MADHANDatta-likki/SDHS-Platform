package com.sdhs.sdhs_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "volunteer_applicant")
public class VolunteerApplicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "applicant_id")
    private Long applicantId;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "contact_number")
    private String contactNumber;

    private String email;

    private String place;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "referred_by_volunteer_id")
    private String referredByVolunteerId;

    @Column(name = "applicant_status")
    private String applicantStatus;

    @Column(name = "admin_comments")
    private String adminComments;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
