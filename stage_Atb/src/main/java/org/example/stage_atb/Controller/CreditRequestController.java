package org.example.stage_atb.Controller;


import org.example.stage_atb.Service.ICreditRequestService;
import org.example.stage_atb.dto.request.CreditRequestDTO;
import org.example.stage_atb.dto.response.CreditResponseDTO;
import org.example.stage_atb.enums.CreditStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/credit-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CreditRequestController {

    private final ICreditRequestService creditRequestService;

    @PostMapping
    public ResponseEntity<CreditResponseDTO> createCreditRequest(@Valid @RequestBody CreditRequestDTO requestDTO) {
        CreditResponseDTO response = creditRequestService.createCreditRequest(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreditResponseDTO> getCreditRequestById(@PathVariable String id) {
        CreditResponseDTO response = creditRequestService.getCreditRequestById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/number/{requestNumber}")
    public ResponseEntity<CreditResponseDTO> getCreditRequestByNumber(@PathVariable String requestNumber) {
        CreditResponseDTO response = creditRequestService.getCreditRequestByNumber(requestNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<CreditResponseDTO>> getCreditRequestsByClient(@PathVariable String clientId) {
        List<CreditResponseDTO> response = creditRequestService.getCreditRequestsByClient(clientId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CreditResponseDTO>> getCreditRequestsByUser(@PathVariable String userId) {
        List<CreditResponseDTO> response = creditRequestService.getCreditRequestsByUser(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CreditResponseDTO>> getCreditRequestsByStatus(@PathVariable CreditStatus status) {
        List<CreditResponseDTO> response = creditRequestService.getCreditRequestsByStatus(status);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CreditResponseDTO>> getAllCreditRequests() {
        List<CreditResponseDTO> response = creditRequestService.getAllCreditRequests();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CreditResponseDTO> updateCreditRequest(
            @PathVariable String id,
            @Valid @RequestBody CreditRequestDTO requestDTO) {
        CreditResponseDTO response = creditRequestService.updateCreditRequest(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CreditResponseDTO> updateStatus(
            @PathVariable String id,
            @RequestParam CreditStatus status,
            @RequestParam(required = false) String reason) {
        CreditResponseDTO response = creditRequestService.updateCreditRequestStatus(id, status, reason);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<CreditResponseDTO> approveCreditRequest(@PathVariable String id) {
        CreditResponseDTO response = creditRequestService.approveCreditRequest(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<CreditResponseDTO> rejectCreditRequest(
            @PathVariable String id,
            @RequestParam String reason) {
        CreditResponseDTO response = creditRequestService.rejectCreditRequest(id, reason);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCreditRequest(@PathVariable String id) {
        creditRequestService.deleteCreditRequest(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total/status/{status}")
    public ResponseEntity<BigDecimal> getTotalAmountByStatus(@PathVariable CreditStatus status) {
        BigDecimal total = creditRequestService.getTotalAmountByStatus(status);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> countByStatusSince(
            @PathVariable CreditStatus status,
            @RequestParam LocalDateTime since) {
        long count = creditRequestService.countByStatusSince(status, since);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/distribution/status")
    public ResponseEntity<List<Object[]>> getStatusDistribution() {
        List<Object[]> distribution = creditRequestService.getStatusDistribution();
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/high-risk")
    public ResponseEntity<List<CreditResponseDTO>> getHighRiskCreditRequests() {
        List<CreditResponseDTO> response = creditRequestService.getHighRiskCreditRequests();
        return ResponseEntity.ok(response);
    }
}