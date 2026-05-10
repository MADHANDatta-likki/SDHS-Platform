package com.sdhs.sdhs_backend.service;

import com.sdhs.sdhs_backend.dto.PaymentSubmissionRequest;

import java.util.Map;

public interface VolunteerPaymentService {

    Map<String, Object> getPaymentDetails(Long registrationId);

    void submitPayment(
            Long registrationId,
            PaymentSubmissionRequest request
    );
}