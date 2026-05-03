package com.sdhs.sdhs_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sdhs.sdhs_backend.entity.Volunteer;

import java.util.Optional;

public interface VolunteerRepository extends JpaRepository<Volunteer, String> {

    Optional<Volunteer> findByVidAndPhoneAndIsActive(
            String vid,
            String phone,
            String isActive
    );
}