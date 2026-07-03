package org.example.stage_atb.Controller;

import org.example.stage_atb.Service.IFraudAlertService;
import org.example.stage_atb.dto.request.FraudAlertRequestDTO;
import org.example.stage_atb.dto.response.FraudAlertResponseDTO;
import org.example.stage_atb.enums.RiskLevel;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fraud-alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FraudAlertController {

    private final IFraudAlertService fraudAlertService;

    @PostMapping
    public ResponseEntity<FraudAlertResponseDTO> createFraudAlert(
            @Valid @RequestBody FraudAlertRequestDTO requestDTO) {
        FraudAlertResponseDTO response = fraudAlertService.createFraudAlert(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FraudAlertResponseDTO> getFraudAlertById(@PathVariable String id) {
        FraudAlertResponseDTO response = fraudAlertService.getFraudAlertById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<FraudAlertResponseDTO>> getFraudAlertsByClient(
            @PathVariable String clientId) {
        List<FraudAlertResponseDTO> response = fraudAlertService.getFraudAlertsByClient(clientId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/credit-request/{creditRequestId}")
    public ResponseEntity<List<FraudAlertResponseDTO>> getFraudAlertsByCreditRequest(
            @PathVariable String creditRequestId) {
        List<FraudAlertResponseDTO> response = fraudAlertService.getFraudAlertsByCreditRequest(creditRequestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<List<FraudAlertResponseDTO>> getFraudAlertsBySeverity(
            @PathVariable RiskLevel severity) {
        List<FraudAlertResponseDTO> response = fraudAlertService.getFraudAlertsBySeverity(severity);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<FraudAlertResponseDTO>> getAllFraudAlerts() {
        List<FraudAlertResponseDTO> response = fraudAlertService.getAllFraudAlerts();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FraudAlertResponseDTO> updateFraudAlert(
            @PathVariable String id,
            @Valid @RequestBody FraudAlertRequestDTO requestDTO) {
        FraudAlertResponseDTO response = fraudAlertService.updateFraudAlert(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFraudAlert(@PathVariable String id) {
        fraudAlertService.deleteFraudAlert(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<FraudAlertResponseDTO> reviewFraudAlert(@PathVariable String id) {
        FraudAlertResponseDTO response = fraudAlertService.reviewFraudAlert(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<FraudAlertResponseDTO> confirmFraudAlert(@PathVariable String id) {
        FraudAlertResponseDTO response = fraudAlertService.confirmFraudAlert(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/action")
    public ResponseEntity<FraudAlertResponseDTO> takeAction(
            @PathVariable String id,
            @RequestParam String actionNotes) {
        FraudAlertResponseDTO response = fraudAlertService.takeAction(id, actionNotes);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unreviewed")
    public ResponseEntity<List<FraudAlertResponseDTO>> getUnreviewedAlerts() {
        List<FraudAlertResponseDTO> response = fraudAlertService.getUnreviewedAlerts();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/confirmed-unresolved")
    public ResponseEntity<List<FraudAlertResponseDTO>> getConfirmedUnresolvedAlerts() {
        List<FraudAlertResponseDTO> response = fraudAlertService.getConfirmedUnresolvedAlerts();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/detect/{creditRequestId}")
    public ResponseEntity<FraudAlertResponseDTO> detectFraudWithAI(
            @PathVariable String creditRequestId) {
        FraudAlertResponseDTO response = fraudAlertService.detectFraudWithAI(creditRequestId);
        return ResponseEntity.ok(response);
    }
}