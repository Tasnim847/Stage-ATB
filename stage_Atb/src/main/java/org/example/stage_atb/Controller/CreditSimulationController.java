package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.ICreditSimulationService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.response.CreditSimulationDTO;
import org.example.stage_atb.entity.CreditSimulation;
import org.example.stage_atb.entity.User;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/credit-simulations")
@RequiredArgsConstructor
@Slf4j
public class CreditSimulationController {

    private final ICreditSimulationService simulationService;
    private final IUserService userService;

    /**
     * Récupérer toutes les simulations de l'utilisateur connecté
     */
    @GetMapping("/my-simulations")
    public ResponseEntity<List<CreditSimulationDTO>> getMySimulations() {
        try {
            User currentUser = userService.getCurrentUser();
            List<CreditSimulation> simulations = simulationService.getSimulationsByUser(currentUser.getId());

            List<CreditSimulationDTO> dtos = simulations.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des simulations: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupérer une simulation par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CreditSimulationDTO> getSimulationById(@PathVariable String id) {
        try {
            CreditSimulation simulation = simulationService.getSimulationById(id);

            // Vérifier que l'utilisateur est autorisé
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.getCurrentUser();

            if (!simulation.getUser().getId().equals(currentUser.getId()) &&
                    !authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                    a.getAuthority().equals("ROLE_ANALYST"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(convertToDTO(simulation));
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de la simulation: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Créer une simulation autonome
     */
    @PostMapping("/simulate")
    public ResponseEntity<CreditSimulationDTO> createStandaloneSimulation(
            @RequestParam BigDecimal amount,
            @RequestParam Integer durationMonths,
            @RequestParam BigDecimal interestRate,
            @RequestParam(required = false) String clientId) {
        try {
            User currentUser = userService.getCurrentUser();
            CreditSimulation simulation = simulationService.createStandaloneSimulation(
                    amount, durationMonths, interestRate, currentUser, clientId);

            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(simulation));
        } catch (Exception e) {
            log.error("Erreur lors de la création de la simulation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Mettre à jour une simulation
     */
    @PutMapping("/{id}")
    public ResponseEntity<CreditSimulationDTO> updateSimulation(
            @PathVariable String id,
            @RequestParam BigDecimal amount,
            @RequestParam Integer durationMonths,
            @RequestParam BigDecimal interestRate) {
        try {
            CreditSimulation simulation = simulationService.updateSimulation(id, amount, durationMonths, interestRate);
            return ResponseEntity.ok(convertToDTO(simulation));
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour de la simulation: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Supprimer une simulation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSimulation(@PathVariable String id) {
        try {
            simulationService.deleteSimulation(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Erreur lors de la suppression de la simulation: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Comparer plusieurs simulations
     */
    @PostMapping("/compare")
    public ResponseEntity<String> compareSimulations(@RequestBody List<String> simulationIds) {
        try {
            List<CreditSimulation> simulations = simulationIds.stream()
                    .map(simulationService::getSimulationById)
                    .collect(Collectors.toList());

            String comparison = simulationService.compareSimulations(simulations);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            log.error("Erreur lors de la comparaison des simulations: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Générer un résumé de simulation
     */
    @GetMapping("/{id}/summary")
    public ResponseEntity<String> getSimulationSummary(@PathVariable String id) {
        try {
            CreditSimulation simulation = simulationService.getSimulationById(id);
            String summary = simulationService.generateSimulationSummary(simulation);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Erreur lors de la génération du résumé: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Convertir une entité en DTO
     */
    private CreditSimulationDTO convertToDTO(CreditSimulation simulation) {
        return CreditSimulationDTO.builder()
                .id(simulation.getId())
                .creditRequestId(simulation.getCreditRequest() != null ?
                        simulation.getCreditRequest().getId() : null)
                .userId(simulation.getUser().getId())
                .clientId(simulation.getClient() != null ?
                        simulation.getClient().getId() : null)
                .amount(simulation.getAmount())
                .durationMonths(simulation.getDurationMonths())
                .interestRate(simulation.getInterestRate())
                .monthlyPayment(simulation.getMonthlyPayment())
                .totalInterest(simulation.getTotalInterest())
                .totalPayment(simulation.getTotalPayment())
                .borrowingCapacity(simulation.getBorrowingCapacity())
                .debtRatio(simulation.getDebtRatio())
                .solvencyScore(simulation.getSolvencyScore())
                .simulationResults(simulation.getSimulationResults())
                .comparisonResults(simulation.getComparisonResults())
                .simulationName(simulation.getSimulationName())
                .createdAt(simulation.getCreatedAt())
                .updatedAt(simulation.getUpdatedAt())
                .build();
    }

    // ============================================================
    // 📝 NOUVEAUX ENDPOINTS UPDATE
    // ============================================================

    /**
     * Mettre à jour uniquement le montant
     */
    @PatchMapping("/{id}/amount")
    public ResponseEntity<CreditSimulationDTO> updateAmount(
            @PathVariable String id,
            @RequestParam BigDecimal amount) {

        log.info("PATCH /{id}/amount - Updating amount: {} to {}", id, amount);

        try {
            if (!hasAccess(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            CreditSimulation simulation = simulationService.updateSimulationAmount(id, amount);
            return ResponseEntity.ok(convertToDTO(simulation));
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du montant: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Mettre à jour uniquement la durée
     */
    @PatchMapping("/{id}/duration")
    public ResponseEntity<CreditSimulationDTO> updateDuration(
            @PathVariable String id,
            @RequestParam Integer durationMonths) {

        log.info("PATCH /{id}/duration - Updating duration: {} to {} months", id, durationMonths);

        try {
            if (!hasAccess(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            CreditSimulation simulation = simulationService.updateSimulationDuration(id, durationMonths);
            return ResponseEntity.ok(convertToDTO(simulation));
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour de la durée: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Mettre à jour uniquement le taux d'intérêt
     */
    @PatchMapping("/{id}/interest-rate")
    public ResponseEntity<CreditSimulationDTO> updateInterestRate(
            @PathVariable String id,
            @RequestParam BigDecimal interestRate) {

        log.info("PATCH /{id}/interest-rate - Updating interest rate: {} to {}%", id, interestRate);

        try {
            if (!hasAccess(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            CreditSimulation simulation = simulationService.updateSimulationInterestRate(id, interestRate);
            return ResponseEntity.ok(convertToDTO(simulation));
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du taux d'intérêt: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Mettre à jour le nom d'une simulation
     */
    @PatchMapping("/{id}/name")
    public ResponseEntity<CreditSimulationDTO> updateName(
            @PathVariable String id,
            @RequestParam String name) {

        log.info("PATCH /{id}/name - Updating name: {} to {}", id, name);

        try {
            if (!hasAccess(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            CreditSimulation simulation = simulationService.updateSimulationName(id, name);
            return ResponseEntity.ok(convertToDTO(simulation));
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du nom: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Mettre à jour plusieurs simulations en lot
     */
    @PatchMapping("/batch/interest-rate")
    public ResponseEntity<Integer> batchUpdateInterestRate(
            @RequestBody List<String> ids,
            @RequestParam BigDecimal interestRate) {

        log.info("PATCH /batch/interest-rate - Batch updating {} simulations with rate: {}%", ids.size(), interestRate);

        try {
            int updatedCount = simulationService.batchUpdateSimulations(ids, interestRate);
            return ResponseEntity.ok(updatedCount);
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour en lot: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ============================================================
    // 🗑️ NOUVEAUX ENDPOINTS DELETE
    // ============================================================

    /**
     * Supprimer toutes les simulations de l'utilisateur connecté
     */
    @DeleteMapping("/my-simulations")
    public ResponseEntity<Integer> deleteMySimulations() {
        log.info("DELETE /my-simulations - Deleting all my simulations");

        try {
            User currentUser = userService.getCurrentUser();
            int deletedCount = simulationService.deleteSimulationsByUser(currentUser.getId());
            return ResponseEntity.ok(deletedCount);
        } catch (Exception e) {
            log.error("Erreur lors de la suppression des simulations: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Supprimer les simulations plus anciennes qu'une date (Admin uniquement)
     */
    @DeleteMapping("/older-than")
    public ResponseEntity<Integer> deleteOlderThan(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {

        log.info("DELETE /older-than - Deleting simulations older than: {}", date);

        try {
            if (!isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            int deletedCount = simulationService.deleteSimulationsOlderThan(date);
            return ResponseEntity.ok(deletedCount);
        } catch (Exception e) {
            log.error("Erreur lors de la suppression des anciennes simulations: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Supprimer toutes les simulations (⚠️ Admin uniquement)
     */
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllSimulations() {
        log.warn("DELETE /all - Deleting ALL simulations!");

        try {
            if (!isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            simulationService.deleteAllSimulations();
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Erreur lors de la suppression de toutes les simulations: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ============================================================
    // 🔒 MÉTHODES DE SÉCURITÉ
    // ============================================================

    private boolean hasAccess(String simulationId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            boolean isAdminOrAnalyst = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                            a.getAuthority().equals("ROLE_ANALYST"));

            if (isAdminOrAnalyst) {
                return true;
            }

            User currentUser = userService.getCurrentUser();
            CreditSimulation simulation = simulationService.getSimulationById(simulationId);

            return simulation.getUser().getId().equals(currentUser.getId());

        } catch (Exception e) {
            log.error("Erreur lors de la vérification d'accès: {}", e.getMessage(), e);
            return false;
        }
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}