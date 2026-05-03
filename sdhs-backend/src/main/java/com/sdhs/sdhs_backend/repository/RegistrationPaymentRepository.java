package com.sdhs.sdhs_backend.repository;

import com.sdhs.sdhs_backend.entity.RegistrationPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistrationPaymentRepository extends JpaRepository<RegistrationPayment, Long> {
    List<RegistrationPayment> findAllByRegistrationId(Long registrationId);
}