package com.sdhs.sdhs_backend.dto;

public class PaymentSubmissionRequest {

    private String utrNumber;
    private String paymentProofFilePath;

    public String getUtrNumber() {
        return utrNumber;
    }

    public void setUtrNumber(String utrNumber) {
        this.utrNumber = utrNumber;
    }

    public String getPaymentProofFilePath() {
        return paymentProofFilePath;
    }

    public void setPaymentProofFilePath(String paymentProofFilePath) {
        this.paymentProofFilePath = paymentProofFilePath;
    }
}