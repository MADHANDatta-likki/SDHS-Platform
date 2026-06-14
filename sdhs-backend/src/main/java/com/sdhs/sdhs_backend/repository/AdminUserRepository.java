package com.sdhs.sdhs_backend.repository;

import com.sdhs.sdhs_backend.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    Optional<AdminUser> findByVolunteerIdAndActiveTrue(String volunteerId);
}
