// Service/impl/AnalystManagementServiceImpl.java
package org.example.stage_atb.Service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Mappers.CreditRequestMapper;
import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.UserRepository;
import org.example.stage_atb.Service.IAnalystManagementService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.AnalystAssignmentRequest;
import org.example.stage_atb.dto.request.BatchAssignmentRequest;
import org.example.stage_atb.dto.response.*;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.CreditStatus;
import org.example.stage_atb.enums.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AnalystManagementServiceImpl implements IAnalystManagementService {

    private final CreditRequestRepository creditRequestRepository;
    private final CreditRequestMapper creditRequestMapper;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final IUserService userService;

    private static final int MAX_WORKLOAD = 20; // Nombre max de dossiers par analyste
    private static final List<CreditStatus> PROCESSED_STATUSES = Arrays.asList(
            CreditStatus.APPROVED,
            CreditStatus.REJECTED,
            CreditStatus.CANCELLED,
            CreditStatus.COMPLETED
    );

    private static final List<CreditStatus> ACTIVE_STATUSES = Arrays.asList(
            CreditStatus.PENDING_ANALYSIS,
            CreditStatus.UNDER_REVIEW,
            CreditStatus.PENDING_DOCUMENTS
    );

    // ============================================
    // GESTION DES DOSSIERS
    // ============================================

    @Override
    public List<CreditResponseDTO> getAllProcessedFiles() {
        log.info("📋 Récupération de tous les dossiers traités");

        List<CreditRequest> processedRequests = creditRequestRepository
                .findAll()
                .stream()
                .filter(cr -> PROCESSED_STATUSES.contains(cr.getStatus()))
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .collect(Collectors.toList());

        log.info("✅ {} dossiers traités trouvés", processedRequests.size());
        return processedRequests.stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CreditResponseDTO> getProcessedFilesByAnalyst(String analystId) {
        log.info("📋 Récupération des dossiers traités par l'analyste: {}", analystId);

        // Vérifier que l'analyste existe
        User analyst = userRepository.findById(analystId)
                .orElseThrow(() -> new RuntimeException("Analyste non trouvé avec l'id: " + analystId));

        if (analyst.getRole() != UserRole.ANALYST) {
            throw new RuntimeException("L'utilisateur n'est pas un analyste");
        }

        List<CreditRequest> processedRequests = creditRequestRepository
                .findByAnalystId(analystId)
                .stream()
                .filter(cr -> PROCESSED_STATUSES.contains(cr.getStatus()))
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .collect(Collectors.toList());

        log.info("✅ {} dossiers traités trouvés pour l'analyste: {}", processedRequests.size(), analyst.getEmail());
        return processedRequests.stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CreditResponseDTO> getProcessedFilesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📋 Récupération des dossiers traités entre {} et {}", startDate, endDate);

        List<CreditRequest> processedRequests = creditRequestRepository
                .findByDateRange(startDate, endDate)
                .stream()
                .filter(cr -> PROCESSED_STATUSES.contains(cr.getStatus()))
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .collect(Collectors.toList());

        log.info("✅ {} dossiers traités trouvés pour la période", processedRequests.size());
        return processedRequests.stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CreditRequestSummaryDTO> getPendingAssignmentRequests() {
        log.info("📋 Récupération des dossiers en attente d'affectation");

        List<CreditRequest> pendingRequests = creditRequestRepository
                .findByStatusAndAnalystIsNull(CreditStatus.PENDING_ANALYSIS);

        return pendingRequests.stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
    }

    // ============================================
    // RÉPARTITION DES DOSSIERS
    // ============================================

    @Override
    public CreditResponseDTO assignRequestToAnalyst(AnalystAssignmentRequest request) {
        log.info("📋 Assignation du dossier {} à l'analyste: {}",
                request.getCreditRequestId(), request.getAnalystId());

        // Vérifier que l'analyste existe
        User analyst = userRepository.findById(request.getAnalystId())
                .orElseThrow(() -> new RuntimeException("Analyste non trouvé avec l'id: " + request.getAnalystId()));

        if (analyst.getRole() != UserRole.ANALYST) {
            throw new RuntimeException("L'utilisateur n'est pas un analyste");
        }

        // Vérifier la charge de travail
        long currentWorkload = creditRequestRepository.countByAnalystIdAndStatuses(
                analyst.getId(), ACTIVE_STATUSES);

        if (currentWorkload >= MAX_WORKLOAD && !request.isForceAssign()) {
            throw new RuntimeException(
                    String.format("L'analyste a déjà %d dossiers en cours (max: %d)",
                            currentWorkload, MAX_WORKLOAD)
            );
        }

        // Récupérer le dossier
        CreditRequest creditRequest = creditRequestRepository
                .findById(request.getCreditRequestId())
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé avec l'id: " + request.getCreditRequestId()));

        // Vérifier que le dossier est en attente
        if (creditRequest.getStatus() != CreditStatus.PENDING_ANALYSIS) {
            throw new RuntimeException("Le dossier n'est pas en attente d'analyse. Statut actuel: " + creditRequest.getStatus());
        }

        // Assigner l'analyste au client
        Client client = creditRequest.getClient();
        client.setAnalyst(analyst);
        clientRepository.save(client);

        // Mettre à jour le statut
        creditRequest.setStatus(CreditStatus.UNDER_REVIEW);
        creditRequest.setUpdatedAt(LocalDateTime.now());
        creditRequestRepository.save(creditRequest);

        log.info("✅ Dossier {} assigné à l'analyste {}",
                creditRequest.getRequestNumber(), analyst.getEmail());

        return creditRequestMapper.toResponseDTO(creditRequest);
    }

    @Override
    public List<CreditResponseDTO> batchAssignRequests(BatchAssignmentRequest request) {
        log.info("📋 Assignation en lot de {} dossiers", request.getAssignments().size());

        List<CreditResponseDTO> results = new ArrayList<>();
        Map<String, String> errors = new HashMap<>();

        for (BatchAssignmentRequest.SingleAssignment assignment : request.getAssignments()) {
            try {
                AnalystAssignmentRequest singleRequest = AnalystAssignmentRequest.builder()
                        .creditRequestId(assignment.getCreditRequestId())
                        .analystId(assignment.getAnalystId())
                        .forceAssign(true)
                        .build();

                CreditResponseDTO result = assignRequestToAnalyst(singleRequest);
                results.add(result);
            } catch (Exception e) {
                log.error("❌ Erreur lors de l'assignation du dossier {}: {}",
                        assignment.getCreditRequestId(), e.getMessage());
                errors.put(assignment.getCreditRequestId(), e.getMessage());
            }
        }

        log.info("✅ {} dossiers assignés avec succès, {} erreurs",
                results.size(), errors.size());

        return results;
    }

    @Override
    public Map<String, List<CreditResponseDTO>> autoDistributeRequests(List<String> creditRequestIds) {
        log.info("📋 Distribution automatique de {} dossiers", creditRequestIds.size());

        // Récupérer tous les analystes actifs
        List<User> analysts = userRepository.findActiveUsersByRole(UserRole.ANALYST);

        if (analysts.isEmpty()) {
            throw new RuntimeException("Aucun analyste disponible");
        }

        // Calculer la charge de travail de chaque analyste
        Map<String, Long> workloads = new HashMap<>();
        for (User analyst : analysts) {
            long count = creditRequestRepository.countByAnalystIdAndStatuses(
                    analyst.getId(), ACTIVE_STATUSES);
            workloads.put(analyst.getId(), count);
        }

        // Trier les analystes par charge de travail
        List<User> sortedAnalysts = analysts.stream()
                .sorted(Comparator.comparingLong(a -> workloads.getOrDefault(a.getId(), 0L)))
                .collect(Collectors.toList());

        // Distribuer les dossiers
        Map<String, List<CreditResponseDTO>> distribution = new HashMap<>();
        for (String analystId : workloads.keySet()) {
            distribution.put(analystId, new ArrayList<>());
        }

        int analystIndex = 0;
        for (String creditRequestId : creditRequestIds) {
            // Prendre l'analyste avec la plus faible charge
            User analyst = sortedAnalysts.get(analystIndex % sortedAnalysts.size());

            try {
                AnalystAssignmentRequest request = AnalystAssignmentRequest.builder()
                        .creditRequestId(creditRequestId)
                        .analystId(analyst.getId())
                        .forceAssign(true)
                        .build();

                CreditResponseDTO result = assignRequestToAnalyst(request);
                distribution.get(analyst.getId()).add(result);

                // Mettre à jour la charge
                workloads.put(analyst.getId(), workloads.get(analyst.getId()) + 1);

            } catch (Exception e) {
                log.error("❌ Erreur lors de l'assignation du dossier {}: {}",
                        creditRequestId, e.getMessage());
            }

            analystIndex++;
        }

        log.info("✅ Distribution automatique terminée");
        return distribution;
    }

    @Override
    public Map<String, List<CreditResponseDTO>> rebalanceWorkload() {
        log.info("📋 Rééquilibrage de la charge de travail");

        // Récupérer tous les analystes actifs
        List<User> analysts = userRepository.findActiveUsersByRole(UserRole.ANALYST);

        if (analysts.isEmpty()) {
            throw new RuntimeException("Aucun analyste disponible");
        }

        // Récupérer tous les dossiers en cours
        List<CreditRequest> activeRequests = creditRequestRepository
                .findAll()
                .stream()
                .filter(cr -> ACTIVE_STATUSES.contains(cr.getStatus()))
                .collect(Collectors.toList());

        // Calculer la charge de travail actuelle
        Map<String, Long> currentWorkload = new HashMap<>();
        for (User analyst : analysts) {
            long count = creditRequestRepository.countByAnalystIdAndStatuses(
                    analyst.getId(), ACTIVE_STATUSES);
            currentWorkload.put(analyst.getId(), count);
        }

        // Si la charge est déjà équilibrée
        long minWorkload = currentWorkload.values().stream().min(Long::compareTo).orElse(0L);
        long maxWorkload = currentWorkload.values().stream().max(Long::compareTo).orElse(0L);

        if (maxWorkload - minWorkload <= 2) {
            log.info("✅ La charge de travail est déjà équilibrée");
            return new HashMap<>();
        }

        // Rééquilibrer
        Map<String, List<CreditResponseDTO>> rebalanced = new HashMap<>();
        List<User> sortedAnalysts = analysts.stream()
                .sorted(Comparator.comparingLong(a -> currentWorkload.getOrDefault(a.getId(), 0L)))
                .collect(Collectors.toList());

        // Pour chaque dossier actif, réassigner à l'analyste avec la plus faible charge
        for (CreditRequest request : activeRequests) {
            User targetAnalyst = sortedAnalysts.stream()
                    .min(Comparator.comparingLong(a -> currentWorkload.getOrDefault(a.getId(), 0L)))
                    .orElse(null);

            if (targetAnalyst != null) {
                try {
                    // Réaffecter le dossier
                    CreditResponseDTO result = reassignRequest(
                            request.getId(),
                            targetAnalyst.getId(),
                            "Rééquilibrage automatique de la charge"
                    );

                    rebalanced.computeIfAbsent(targetAnalyst.getId(), k -> new ArrayList<>())
                            .add(result);

                    // Mettre à jour la charge
                    currentWorkload.put(targetAnalyst.getId(),
                            currentWorkload.getOrDefault(targetAnalyst.getId(), 0L) + 1);

                } catch (Exception e) {
                    log.error("❌ Erreur lors du rééquilibrage: {}", e.getMessage());
                }
            }
        }

        log.info("✅ Rééquilibrage terminé. {} dossiers réaffectés.",
                rebalanced.values().stream().mapToInt(List::size).sum());

        return rebalanced;
    }

    @Override
    public CreditResponseDTO reassignRequest(String creditRequestId, String newAnalystId, String reason) {
        log.info("📋 Réaffectation du dossier {} à l'analyste: {}", creditRequestId, newAnalystId);

        // Vérifier que le nouvel analyste existe
        User newAnalyst = userRepository.findById(newAnalystId)
                .orElseThrow(() -> new RuntimeException("Analyste non trouvé avec l'id: " + newAnalystId));

        if (newAnalyst.getRole() != UserRole.ANALYST) {
            throw new RuntimeException("L'utilisateur n'est pas un analyste");
        }

        // Récupérer le dossier
        CreditRequest creditRequest = creditRequestRepository
                .findById(creditRequestId)
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé avec l'id: " + creditRequestId));

        // Réaffecter
        Client client = creditRequest.getClient();
        client.setAnalyst(newAnalyst);
        clientRepository.save(client);

        creditRequest.setUpdatedAt(LocalDateTime.now());
        creditRequestRepository.save(creditRequest);

        log.info("✅ Dossier {} réaffecté à l'analyste {}",
                creditRequest.getRequestNumber(), newAnalyst.getEmail());

        return creditRequestMapper.toResponseDTO(creditRequest);
    }

    // ============================================
    // SUIVI DES PERFORMANCES
    // ============================================

    @Override
    public List<AnalystPerformanceDTO> getAllAnalystPerformance() {
        log.info("📊 Récupération des performances de tous les analystes");

        List<User> analysts = userRepository.findActiveUsersByRole(UserRole.ANALYST);

        return analysts.stream()
                .map(analyst -> getAnalystPerformance(analyst.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public AnalystPerformanceDTO getAnalystPerformance(String analystId) {
        log.info("📊 Récupération des performances de l'analyste: {}", analystId);

        User analyst = userRepository.findById(analystId)
                .orElseThrow(() -> new RuntimeException("Analyste non trouvé avec l'id: " + analystId));

        if (analyst.getRole() != UserRole.ANALYST) {
            throw new RuntimeException("L'utilisateur n'est pas un analyste");
        }

        // Récupérer tous les dossiers de l'analyste
        List<CreditRequest> analystRequests = creditRequestRepository.findByAnalystId(analystId);

        // Statistiques globales
        long totalProcessed = analystRequests.stream()
                .filter(cr -> PROCESSED_STATUSES.contains(cr.getStatus()))
                .count();

        long totalApproved = analystRequests.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                .count();

        long totalRejected = analystRequests.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.REJECTED)
                .count();

        long totalCancelled = analystRequests.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.CANCELLED)
                .count();

        long pendingRequests = analystRequests.stream()
                .filter(cr -> ACTIVE_STATUSES.contains(cr.getStatus()))
                .count();

        // Taux
        double approvalRate = totalProcessed > 0 ?
                (double) totalApproved / totalProcessed * 100 : 0;
        double rejectionRate = totalProcessed > 0 ?
                (double) totalRejected / totalProcessed * 100 : 0;

        // Temps de traitement moyen
        double averageProcessingTimeDays = calculateAverageProcessingTime(analystRequests);
        double averageDecisionTimeHours = calculateAverageDecisionTime(analystRequests);

        // Montants
        BigDecimal totalAmountApproved = analystRequests.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                .map(CreditRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalAmountRejected = analystRequests.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.REJECTED)
                .map(CreditRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageAmountPerRequest = analystRequests.isEmpty() ?
                BigDecimal.ZERO :
                analystRequests.stream()
                        .map(CreditRequest::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(analystRequests.size()), 2, BigDecimal.ROUND_HALF_UP);

        // Distribution par statut
        Map<String, Long> requestsByStatus = analystRequests.stream()
                .collect(Collectors.groupingBy(
                        cr -> cr.getStatus().toString(),
                        Collectors.counting()
                ));

        // Performance mensuelle
        List<MonthlyPerformanceDTO> monthlyPerformance = calculateMonthlyPerformance(analystRequests);

        // Dernières activités
        List<RecentActivityDTO> recentActivities = analystRequests.stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .limit(10)
                .map(this::convertToRecentActivity)
                .collect(Collectors.toList());

        // Classement et niveau de performance
        int rank = calculateRank(analystId);
        String performanceLevel = calculatePerformanceLevel(
                approvalRate, averageProcessingTimeDays, totalProcessed
        );

        return AnalystPerformanceDTO.builder()
                .analystId(analyst.getId())
                .analystName(analyst.getFirstName() + " " + analyst.getLastName())
                .analystEmail(analyst.getEmail())
                .totalProcessed(totalProcessed)
                .pendingRequests(pendingRequests)
                .totalApproved(totalApproved)
                .totalRejected(totalRejected)
                .totalCancelled(totalCancelled)
                .approvalRate(approvalRate)
                .rejectionRate(rejectionRate)
                .averageProcessingTimeDays(averageProcessingTimeDays)
                .averageDecisionTimeHours(averageDecisionTimeHours)
                .totalAmountApproved(totalAmountApproved)
                .totalAmountRejected(totalAmountRejected)
                .averageAmountPerRequest(averageAmountPerRequest)
                .requestsByStatus(requestsByStatus)
                .monthlyPerformance(monthlyPerformance)
                .recentActivities(recentActivities)
                .rank(rank)
                .performanceLevel(performanceLevel)
                .lastActivityDate(analystRequests.stream()
                        .map(CreditRequest::getUpdatedAt)
                        .max(LocalDateTime::compareTo)
                        .orElse(null))
                .build();
    }

    @Override
    public List<AnalystWorkloadDTO> getAllAnalystWorkload() {
        log.info("📋 Récupération de la charge de travail de tous les analystes");

        List<User> analysts = userRepository.findActiveUsersByRole(UserRole.ANALYST);

        return analysts.stream()
                .map(analyst -> getAnalystWorkload(analyst.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public AnalystWorkloadDTO getAnalystWorkload(String analystId) {
        log.info("📋 Récupération de la charge de travail de l'analyste: {}", analystId);

        User analyst = userRepository.findById(analystId)
                .orElseThrow(() -> new RuntimeException("Analyste non trouvé avec l'id: " + analystId));

        if (analyst.getRole() != UserRole.ANALYST) {
            throw new RuntimeException("L'utilisateur n'est pas un analyste");
        }

        long currentWorkload = creditRequestRepository.countByAnalystIdAndStatuses(
                analystId, ACTIVE_STATUSES);

        List<CreditRequest> assignedRequests = creditRequestRepository
                .findByAnalystIdAndStatus(analystId, CreditStatus.UNDER_REVIEW);

        double workloadPercentage = (double) currentWorkload / MAX_WORKLOAD * 100;
        String workloadLevel = calculateWorkloadLevel(workloadPercentage);

        List<CreditRequestSummaryDTO> assignedSummaries = assignedRequests.stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());

        return AnalystWorkloadDTO.builder()
                .analystId(analyst.getId())
                .analystName(analyst.getFirstName() + " " + analyst.getLastName())
                .analystEmail(analyst.getEmail())
                .currentWorkload(currentWorkload)
                .maxCapacity(MAX_WORKLOAD)
                .workloadPercentage(workloadPercentage)
                .workloadLevel(workloadLevel)
                .assignedRequests(assignedSummaries)
                .build();
    }

    @Override
    public List<AnalystPerformanceDTO> getAnalystRanking() {
        log.info("🏆 Récupération du classement des analystes");

        List<AnalystPerformanceDTO> performances = getAllAnalystPerformance();

        // Trier par score global (approval rate + volume)
        performances.sort((a, b) -> {
            double scoreA = a.getApprovalRate() * 0.6 + Math.min(a.getTotalProcessed() / 10.0, 40);
            double scoreB = b.getApprovalRate() * 0.6 + Math.min(b.getTotalProcessed() / 10.0, 40);
            return Double.compare(scoreB, scoreA);
        });

        // Mettre à jour les rangs
        for (int i = 0; i < performances.size(); i++) {
            performances.get(i).setRank(i + 1);
        }

        return performances;
    }

    @Override
    public String generatePerformanceReport(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📊 Génération du rapport de performance pour la période: {} - {}", startDate, endDate);

        List<AnalystPerformanceDTO> performances = getAllAnalystPerformance();

        StringBuilder report = new StringBuilder();
        report.append("═══════════════════════════════════════════════════════════════════\n");
        report.append("                  📊 RAPPORT DE PERFORMANCE DES ANALYSTES          \n");
        report.append("═══════════════════════════════════════════════════════════════════\n\n");

        report.append("📅 Période: ").append(startDate.toLocalDate())
                .append(" → ").append(endDate.toLocalDate()).append("\n\n");

        report.append("📈 RÉSUMÉ GLOBAL:\n");
        report.append("   ├─ Nombre d'analystes: ").append(performances.size()).append("\n");

        long totalProcessed = performances.stream()
                .mapToLong(AnalystPerformanceDTO::getTotalProcessed)
                .sum();
        report.append("   ├─ Total dossiers traités: ").append(totalProcessed).append("\n");

        long totalApproved = performances.stream()
                .mapToLong(AnalystPerformanceDTO::getTotalApproved)
                .sum();
        report.append("   ├─ Total approuvés: ").append(totalApproved).append("\n");

        long totalRejected = performances.stream()
                .mapToLong(AnalystPerformanceDTO::getTotalRejected)
                .sum();
        report.append("   └─ Total rejetés: ").append(totalRejected).append("\n\n");

        report.append("🏆 CLASSEMENT DES ANALYSTES:\n");
        report.append("─────────────────────────────────────────────────────────────────\n");

        List<AnalystPerformanceDTO> sorted = new ArrayList<>(performances);
        sorted.sort((a, b) -> Double.compare(
                b.getApprovalRate() * 0.6 + Math.min(b.getTotalProcessed() / 10.0, 40),
                a.getApprovalRate() * 0.6 + Math.min(a.getTotalProcessed() / 10.0, 40)
        ));

        for (int i = 0; i < sorted.size(); i++) {
            AnalystPerformanceDTO p = sorted.get(i);
            report.append(String.format("   %d. %s\n", i + 1, p.getAnalystName()));
            report.append(String.format("      ├─ Taux d'approbation: %.1f%%\n", p.getApprovalRate()));
            report.append(String.format("      ├─ Dossiers traités: %d\n", p.getTotalProcessed()));
            report.append(String.format("      └─ Temps moyen: %.1f jours\n", p.getAverageProcessingTimeDays()));
        }

        report.append("\n═══════════════════════════════════════════════════════════════════\n");
        report.append("              ℹ️  Rapport généré le ")
                .append(LocalDateTime.now()).append("\n");
        report.append("═══════════════════════════════════════════════════════════════════\n");

        return report.toString();
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    private CreditRequestSummaryDTO convertToSummary(CreditRequest request) {
        return CreditRequestSummaryDTO.builder()
                .id(request.getId())
                .requestNumber(request.getRequestNumber())
                .clientName(request.getClient().getFirstName() + " " + request.getClient().getLastName())
                .amount(request.getAmount())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .priority("NORMAL")
                .daysPending((int) ChronoUnit.DAYS.between(
                        request.getCreatedAt(), LocalDateTime.now()))
                .build();
    }

    private RecentActivityDTO convertToRecentActivity(CreditRequest request) {
        return RecentActivityDTO.builder()
                .creditRequestId(request.getId())
                .requestNumber(request.getRequestNumber())
                .clientName(request.getClient().getFirstName() + " " + request.getClient().getLastName())
                .action(getActionLabel(request.getStatus()))
                .status(request.getStatus().toString())
                .actionDate(request.getUpdatedAt())
                .amount(request.getAmount())
                .build();
    }

    private String getActionLabel(CreditStatus status) {
        switch (status) {
            case APPROVED: return "Approuvé";
            case REJECTED: return "Rejeté";
            case CANCELLED: return "Annulé";
            case COMPLETED: return "Complété";
            case UNDER_REVIEW: return "En révision";
            default: return "En traitement";
        }
    }

    private double calculateAverageProcessingTime(List<CreditRequest> requests) {
        List<CreditRequest> processed = requests.stream()
                .filter(cr -> PROCESSED_STATUSES.contains(cr.getStatus()))
                .collect(Collectors.toList());

        if (processed.isEmpty()) return 0;

        double totalDays = processed.stream()
                .mapToDouble(cr -> ChronoUnit.DAYS.between(cr.getCreatedAt(), cr.getUpdatedAt()))
                .sum();

        return totalDays / processed.size();
    }

    private double calculateAverageDecisionTime(List<CreditRequest> requests) {
        List<CreditRequest> decided = requests.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.APPROVED ||
                        cr.getStatus() == CreditStatus.REJECTED)
                .collect(Collectors.toList());

        if (decided.isEmpty()) return 0;

        double totalHours = decided.stream()
                .mapToDouble(cr -> ChronoUnit.HOURS.between(cr.getCreatedAt(), cr.getUpdatedAt()))
                .sum();

        return totalHours / decided.size();
    }

    private List<MonthlyPerformanceDTO> calculateMonthlyPerformance(List<CreditRequest> requests) {
        Map<String, List<CreditRequest>> byMonth = requests.stream()
                .filter(cr -> PROCESSED_STATUSES.contains(cr.getStatus()))
                .collect(Collectors.groupingBy(
                        cr -> cr.getUpdatedAt().getYear() + "-" +
                                String.format("%02d", cr.getUpdatedAt().getMonthValue())
                ));

        return byMonth.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("-");
                    int year = Integer.parseInt(parts[0]);
                    int month = Integer.parseInt(parts[1]);
                    List<CreditRequest> monthRequests = entry.getValue();

                    long approved = monthRequests.stream()
                            .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                            .count();
                    long rejected = monthRequests.stream()
                            .filter(cr -> cr.getStatus() == CreditStatus.REJECTED)
                            .count();

                    return MonthlyPerformanceDTO.builder()
                            .month(getMonthName(month))
                            .year(year)
                            .processedCount(monthRequests.size())
                            .approvedCount(approved)
                            .rejectedCount(rejected)
                            .approvalRate(monthRequests.isEmpty() ? 0 : (double) approved / monthRequests.size() * 100)
                            .totalAmount(monthRequests.stream()
                                    .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                                    .map(CreditRequest::getAmount)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add))
                            .averageProcessingTime(calculateAverageProcessingTime(monthRequests))
                            .build();
                })
                .sorted((a, b) -> {
                    if (a.getYear() != b.getYear()) return b.getYear() - a.getYear();
                    return b.getMonth().compareTo(a.getMonth());
                })
                .collect(Collectors.toList());
    }

    private String getMonthName(int month) {
        String[] months = {"Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
                "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"};
        return months[month - 1];
    }

    private int calculateRank(String analystId) {
        List<AnalystPerformanceDTO> rankings = getAnalystRanking();
        for (int i = 0; i < rankings.size(); i++) {
            if (rankings.get(i).getAnalystId().equals(analystId)) {
                return i + 1;
            }
        }
        return rankings.size() + 1;
    }

    private String calculatePerformanceLevel(double approvalRate, double avgTime, long totalProcessed) {
        if (approvalRate >= 80 && avgTime <= 3 && totalProcessed >= 20) {
            return "EXCELLENT";
        } else if (approvalRate >= 60 && avgTime <= 5 && totalProcessed >= 10) {
            return "GOOD";
        } else if (approvalRate >= 40 && avgTime <= 7) {
            return "AVERAGE";
        } else {
            return "NEEDS_IMPROVEMENT";
        }
    }

    private String calculateWorkloadLevel(double percentage) {
        if (percentage >= 80) return "CRITICAL";
        if (percentage >= 60) return "HIGH";
        if (percentage >= 30) return "MODERATE";
        return "LOW";
    }
}