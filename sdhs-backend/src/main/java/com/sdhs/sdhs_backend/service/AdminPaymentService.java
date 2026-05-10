package com.sdhs.sdhs_backend.service;

import java.util.List;
import java.util.Map;

public interface AdminPaymentService {

    List<Map<String, Object>> getSubmittedPayments();

    void verifyPayment(Long registrationId);

    void rejectPayment(Long registrationId);
}