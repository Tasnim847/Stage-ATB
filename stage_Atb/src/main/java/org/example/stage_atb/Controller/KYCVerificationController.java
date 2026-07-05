package org.example.stage_atb.Controller;

import org.example.stage_atb.Service.IKYCVService;
import org.example.stage_atb.dto.request.KYCVerificationRequestDTO;
import org.example.stage_atb.dto.response.KYCVerificationResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kyc-verifications")
@RequiredArgsConstructor
public class KYCVerificationController {

    private final IKYCVService kycVerificationService;

    @PostMapping
    public ResponseEntity<KYCVerificationResponseDTO> createKYCVerification(
            @Valid @RequestBody KYCVerificationRequestDTO requestDTO) {
        KYCVerificationResponseDTO response = kycVerificationService.createKYCVerification(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<KYCVerificationResponseDTO> getKYCVerificationById(@PathVariable String id) {
        KYCVerificationResponseDTO response = kycVerificationService.getKYCVerificationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<KYCVerificationResponseDTO>> getKYCVerificationsByClient(
            @PathVariable String clientId) {
        List<KYCVerificationResponseDTO> response = kycVerificationService.getKYCVerificationsByClient(clientId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/client/{clientId}/document/{documentId}")
    public ResponseEntity<KYCVerificationResponseDTO> getKYCVerificationByClientAndDocument(
            @PathVariable String clientId,
            @PathVariable String documentId) {
        KYCVerificationResponseDTO response = kycVerificationService.getKYCVerificationByClientAndDocument(clientId, documentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<KYCVerificationResponseDTO>> getAllKYCVerifications() {
        List<KYCVerificationResponseDTO> response = kycVerificationService.getAllKYCVerifications();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<KYCVerificationResponseDTO> updateKYCVerification(
            @PathVariable String id,
            @Valid @RequestBody KYCVerificationRequestDTO requestDTO) {
        KYCVerificationResponseDTO response = kycVerificationService.updateKYCVerification(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKYCVerification(@PathVariable String id) {
        kycVerificationService.deleteKYCVerification(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/perform/{clientId}")
    public ResponseEntity<KYCVerificationResponseDTO> performKYCVerification(@PathVariable String clientId) {
        KYCVerificationResponseDTO response = kycVerificationService.performKYCVerification(clientId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/client/{clientId}/document/{documentId}/verify-identity")
    public ResponseEntity<KYCVerificationResponseDTO> verifyIdentity(
            @PathVariable String clientId,
            @PathVariable String documentId) {
        KYCVerificationResponseDTO response = kycVerificationService.verifyIdentity(clientId, documentId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/client/{clientId}/document/{documentId}/verify-address")
    public ResponseEntity<KYCVerificationResponseDTO> verifyAddress(
            @PathVariable String clientId,
            @PathVariable String documentId) {
        KYCVerificationResponseDTO response = kycVerificationService.verifyAddress(clientId, documentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/client/{clientId}/document/{documentId}/detect-fraud")
    public ResponseEntity<KYCVerificationResponseDTO> detectFraud(
            @PathVariable String clientId,
            @PathVariable String documentId) {
        KYCVerificationResponseDTO response = kycVerificationService.detectFraud(clientId, documentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<KYCVerificationResponseDTO>> getPendingVerifications() {
        List<KYCVerificationResponseDTO> response = kycVerificationService.getPendingVerifications();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/fraud-detected")
    public ResponseEntity<List<KYCVerificationResponseDTO>> getFraudDetected() {
        List<KYCVerificationResponseDTO> response = kycVerificationService.getFraudDetected();
        return ResponseEntity.ok(response);
    }
}