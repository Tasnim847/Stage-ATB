package org.example.stage_atb.Controller;

import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.ICreditRequestService;
import org.example.stage_atb.Service.ICreditSimulationService;
import org.example.stage_atb.dto.request.CreditRequestDTO;
import org.example.stage_atb.dto.response.CreditResponseDTO;
import org.example.stage_atb.dto.response.CreditSimulationDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.CreditSimulation;
import org.example.stage_atb.enums.CreditStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/credit-requests")
@RequiredArgsConstructor
@Slf4j
public class CreditRequestController {

    private final ICreditRequestService creditRequestService;
    private final ICreditSimulationService creditSimulationService;

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

    /**
     * ✅ Récupérer les crédits du client connecté
     */
    @GetMapping("/my-credits")
    public ResponseEntity<List<CreditResponseDTO>> getMyCreditRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        List<CreditResponseDTO> credits = creditRequestService.getCreditRequestsByClientEmail(email);
        return ResponseEntity.ok(credits);
    }

    /**
     * ✅ Récupérer les crédits du client connecté par statut
     */
    @GetMapping("/my-credits/status/{status}")
    public ResponseEntity<List<CreditResponseDTO>> getMyCreditRequestsByStatus(@PathVariable CreditStatus status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        List<CreditResponseDTO> credits = creditRequestService.getCreditRequestsByClientEmailAndStatus(email, status);
        return ResponseEntity.ok(credits);
    }

    /**
     * ✅ Compter les crédits du client connecté
     */
    @GetMapping("/my-credits/count")
    public ResponseEntity<Long> countMyCreditRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        long count = creditRequestService.countCreditRequestsByClientEmail(email);
        return ResponseEntity.ok(count);
    }

    /**
     * ✅ Récupérer la simulation d'une demande de crédit
     */
    @GetMapping("/{id}/simulation")
    public ResponseEntity<CreditSimulationDTO> getSimulationByCreditRequestId(@PathVariable String id) {
        try {
            log.info("Récupération de la simulation pour la demande: {}", id);

            // Récupérer la demande de crédit
            CreditRequest creditRequest = creditRequestService.getCreditRequestEntityById(id);
            if (creditRequest == null) {
                log.warn("Demande de crédit non trouvée: {}", id);
                return ResponseEntity.notFound().build();
            }

            // Vérifier que l'utilisateur connecté est bien le propriétaire
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            log.info("Utilisateur connecté: {}", userEmail);

            // Vérifier si l'utilisateur est le client ou un admin/analyst
            boolean isOwner = creditRequest.getClient().getEmail().equals(userEmail);
            boolean isAuthorized = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                            a.getAuthority().equals("ROLE_ANALYST"));

            if (!isOwner && !isAuthorized) {
                log.warn("Accès non autorisé à la simulation pour l'utilisateur: {}", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Récupérer la simulation liée
            CreditSimulation simulation = creditRequest.getCreditSimulation();
            if (simulation == null) {
                log.warn("Simulation non trouvée pour la demande: {}", id);
                return ResponseEntity.notFound().build();
            }

            // Convertir en DTO
            CreditSimulationDTO dto = CreditSimulationDTO.builder()
                    .id(simulation.getId())
                    .creditRequestId(simulation.getCreditRequest().getId())
                    .userId(simulation.getUser().getId())
                    .clientId(simulation.getClient() != null ? simulation.getClient().getId() : null)
                    .amount(simulation.getAmount())
                    .durationMonths(simulation.getDurationMonths())
                    .interestRate(simulation.getInterestRate())
                    .monthlyPayment(simulation.getMonthlyPayment())
                    .totalInterest(simulation.getTotalInterest())
                    .totalPayment(simulation.getTotalPayment())
                    .borrowingCapacity(simulation.getBorrowingCapacity())
                    .simulationResults(simulation.getSimulationResults())
                    .comparisonResults(simulation.getComparisonResults())
                    .simulationName(simulation.getSimulationName())
                    .createdAt(simulation.getCreatedAt())
                    .updatedAt(simulation.getUpdatedAt())
                    .build();

            log.info("Simulation récupérée avec succès pour la demande: {}", id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de la simulation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<CreditResponseDTO> cancelCreditRequest(@PathVariable String id) {
        // Vérifier que l'utilisateur est le propriétaire
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        CreditRequest creditRequest = creditRequestService.getCreditRequestEntityById(id);
        if (creditRequest == null) {
            return ResponseEntity.notFound().build();
        }

        // Vérifier que le client est le propriétaire
        if (!creditRequest.getClient().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Vérifier que la demande est en attente (PENDING_ANALYSIS ou UNDER_REVIEW)
        if (creditRequest.getStatus() != CreditStatus.PENDING_ANALYSIS &&
                creditRequest.getStatus() != CreditStatus.UNDER_REVIEW) {
            return ResponseEntity.badRequest().build();
        }

        CreditResponseDTO response = creditRequestService.cancelCreditRequest(id);
        return ResponseEntity.ok(response);
    }

}