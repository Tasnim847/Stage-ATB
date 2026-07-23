package org.example.stage_atb.Controller;

import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Service.ICreditRequestService;
import org.example.stage_atb.Service.ICreditSimulationService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.CreditRequestDTO;
import org.example.stage_atb.dto.response.CreditResponseDTO;
import org.example.stage_atb.dto.response.CreditSimulationDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.CreditSimulation;
import org.example.stage_atb.entity.User;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credit-requests")
@RequiredArgsConstructor
@Slf4j
public class CreditRequestController {

    private final ICreditRequestService creditRequestService;
    private final ICreditSimulationService creditSimulationService;
    private final IUserService userService; // ✅ AJOUTER
    private final CreditRequestRepository creditRequestRepository; // ✅ AJOUTER pour les méthodes avec count

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
     * Fonctionne pour les rôles CLIENT, ADVISOR, ADMIN, ANALYST
     */
    @GetMapping("/my-credits")
    public ResponseEntity<List<CreditResponseDTO>> getMyCreditRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("🔍 Getting credit requests for user: {}", email);

        // Récupérer l'utilisateur connecté
        User currentUser = userService.getCurrentUser();

        List<CreditResponseDTO> credits = new ArrayList<>();

        // Déterminer le rôle et récupérer les crédits appropriés
        switch (currentUser.getRole()) {
            case CLIENT:
                // Le client voit ses propres crédits
                credits = creditRequestService.getCreditRequestsByClientEmail(email);
                log.info("📋 Found {} credit requests for client: {}", credits.size(), email);
                break;

            case ADVISOR:
                // Le conseiller voit les crédits de ses clients
                credits = creditRequestService.getCreditRequestsByAdvisorEmail(email);
                log.info("📋 Found {} credit requests for advisor's clients: {}", credits.size(), email);
                break;

            case ANALYST:
                // L'analyste voit les crédits des clients qui lui sont assignés
                credits = creditRequestService.getCreditRequestsByAnalystEmail(email);
                log.info("📋 Found {} credit requests for analyst's clients: {}", credits.size(), email);
                break;

            case ADMIN:
            case MANAGER:
                // L'admin/manager voit tous les crédits
                credits = creditRequestService.getAllCreditRequests();
                log.info("📋 Found {} total credit requests for admin/manager: {}", credits.size(), email);
                break;

            default:
                log.warn("⚠️ Unknown role: {}", currentUser.getRole());
                credits = new ArrayList<>();
        }

        return ResponseEntity.ok(credits);
    }

    /**
     * ✅ Récupérer les crédits du client connecté par statut
     */
    @GetMapping("/my-credits/status/{status}")
    public ResponseEntity<List<CreditResponseDTO>> getMyCreditRequestsByStatus(@PathVariable CreditStatus status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("🔍 Getting credit requests for user: {} with status: {}", email, status);

        User currentUser = userService.getCurrentUser();
        List<CreditResponseDTO> credits = new ArrayList<>();

        switch (currentUser.getRole()) {
            case CLIENT:
                credits = creditRequestService.getCreditRequestsByClientEmailAndStatus(email, status);
                break;

            case ADVISOR:
                credits = creditRequestService.getCreditRequestsByAdvisorAndStatus(email, status);
                break;

            case ANALYST:
                credits = creditRequestService.getCreditRequestsByAnalystAndStatus(email, status);
                break;

            case ADMIN:
            case MANAGER:
                credits = creditRequestService.getCreditRequestsByStatus(status);
                break;

            default:
                credits = new ArrayList<>();
        }

        log.info("📋 Found {} credit requests with status: {}", credits.size(), status);
        return ResponseEntity.ok(credits);
    }

    /**
     * ✅ Compter les crédits du client connecté
     */
    @GetMapping("/my-credits/count")
    public ResponseEntity<Long> countMyCreditRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("🔍 Counting credit requests for user: {}", email);

        User currentUser = userService.getCurrentUser();
        long count = 0;

        switch (currentUser.getRole()) {
            case CLIENT:
                count = creditRequestService.countCreditRequestsByClientEmail(email);
                break;

            case ADVISOR:
                count = creditRequestService.countCreditRequestsByAdvisor(email);
                break;

            case ANALYST:
                count = creditRequestService.countCreditRequestsByAnalyst(email);
                break;

            case ADMIN:
            case MANAGER:
                count = creditRequestRepository.count();
                break;

            default:
                count = 0;
        }

        log.info("📋 Total credit requests count: {}", count);
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


    // CreditRequestController.java - Ajouter/Modifier ces méthodes

    /**
     * ✅ Récupérer les demandes de crédit d'un conseiller (ses clients)
     */
    @GetMapping("/advisor/my-clients")
    public ResponseEntity<List<CreditResponseDTO>> getCreditRequestsForAdvisor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Getting credit requests for advisor: {}", email);

        List<CreditResponseDTO> requests = creditRequestService.getCreditRequestsByAdvisorEmail(email);
        return ResponseEntity.ok(requests);
    }

    /**
     * ✅ Récupérer les demandes de crédit d'un conseiller par statut
     */
    @GetMapping("/advisor/my-clients/status/{status}")
    public ResponseEntity<List<CreditResponseDTO>> getCreditRequestsForAdvisorByStatus(
            @PathVariable CreditStatus status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Getting credit requests for advisor: {} with status: {}", email, status);

        List<CreditResponseDTO> requests = creditRequestService.getCreditRequestsByAdvisorAndStatus(email, status);
        return ResponseEntity.ok(requests);
    }

    /**
     * ✅ Compter les demandes de crédit d'un conseiller
     */
    @GetMapping("/advisor/my-clients/count")
    public ResponseEntity<Long> countCreditRequestsForAdvisor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        long count = creditRequestService.countCreditRequestsByAdvisor(email);
        return ResponseEntity.ok(count);
    }

    /**
     * ✅ Transmettre une demande à l'analyste (conseiller)
     */
    @PatchMapping("/{id}/transmit-to-analyst")
    public ResponseEntity<CreditResponseDTO> transmitToAnalyst(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Transmitting credit request {} to analyst by advisor: {}", id, email);

        // Vérifier que le conseiller est le propriétaire
        if (!creditRequestService.isAdvisorOwnerOfCreditRequest(email, id)) {
            log.warn("Advisor {} is not owner of credit request {}", email, id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String notes = payload != null ? payload.get("notes") : null;
        boolean force = payload != null && "true".equals(payload.get("force"));

        try {
            CreditResponseDTO response = creditRequestService.transmitToAnalyst(id, notes, force);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.error("Error transmitting credit request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * ✅ Vérifier si une demande peut être transmise
     */
    @GetMapping("/{id}/can-transmit")
    public ResponseEntity<Map<String, Object>> canTransmitToAnalyst(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Vérifier que le conseiller est le propriétaire
        if (!creditRequestService.isAdvisorOwnerOfCreditRequest(email, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean canTransmit = creditRequestService.canTransmitToAnalyst(id);
        List<String> missingDocuments = creditRequestService.getMissingDocumentsForTransmission(id);

        Map<String, Object> response = new HashMap<>();
        response.put("canTransmit", canTransmit);
        response.put("missingDocuments", missingDocuments);

        return ResponseEntity.ok(response);
    }

    /**
     * ✅ Annuler une demande par le conseiller
     */
    @PatchMapping("/{id}/cancel-by-advisor")
    public ResponseEntity<CreditResponseDTO> cancelCreditRequestByAdvisor(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Vérifier que le conseiller est le propriétaire
        if (!creditRequestService.isAdvisorOwnerOfCreditRequest(email, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String reason = payload != null ? payload.get("reason") : null;
        CreditResponseDTO response = creditRequestService.cancelCreditRequestByAdvisor(id, reason);
        return ResponseEntity.ok(response);
    }


    // ============================================
// MÉTHODES POUR ANALYSTE
// ============================================

    /**
     * ✅ Récupérer les demandes de crédit des clients assignés à l'analyste connecté
     */
    @GetMapping("/analyst/my-clients")
    public ResponseEntity<List<CreditResponseDTO>> getCreditRequestsForAnalyst() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Getting credit requests for analyst: {}", email);

        List<CreditResponseDTO> requests = creditRequestService.getCreditRequestsByAnalystEmail(email);
        return ResponseEntity.ok(requests);
    }

    /**
     * ✅ Récupérer les demandes de crédit des clients assignés à l'analyste par statut
     */
    @GetMapping("/analyst/my-clients/status/{status}")
    public ResponseEntity<List<CreditResponseDTO>> getCreditRequestsForAnalystByStatus(
            @PathVariable CreditStatus status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Getting credit requests for analyst: {} with status: {}", email, status);

        List<CreditResponseDTO> requests = creditRequestService.getCreditRequestsByAnalystAndStatus(email, status);
        return ResponseEntity.ok(requests);
    }

    /**
     * ✅ Compter les demandes de crédit des clients assignés à l'analyste
     */
    @GetMapping("/analyst/my-clients/count")
    public ResponseEntity<Long> countCreditRequestsForAnalyst() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        long count = creditRequestService.countCreditRequestsByAnalyst(email);
        return ResponseEntity.ok(count);
    }
}