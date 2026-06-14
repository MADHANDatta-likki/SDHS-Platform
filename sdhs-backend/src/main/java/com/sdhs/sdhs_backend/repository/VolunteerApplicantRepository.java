package com.sdhs.sdhs_backend.repository;

import com.sdhs.sdhs_backend.entity.VolunteerApplicant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VolunteerApplicantRepository extends JpaRepository<VolunteerApplicant, Long> {

    List<VolunteerApplicant> findByApplicantStatusOrderByCreatedAtDesc(String applicantStatus);

    List<VolunteerApplicant> findAllByOrderByCreatedAtDesc();
}
