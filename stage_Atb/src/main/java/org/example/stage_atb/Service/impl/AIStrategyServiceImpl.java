// Service/impl/AIStrategyServiceImpl.java - CORRIGÉ
package org.example.stage_atb.Service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.UserRepository;
import org.example.stage_atb.Service.IAIStrategyService;
import org.example.stage_atb.dto.request.StrategicReportRequest;
import org.example.stage_atb.dto.response.AIDecisionDTO;
import org.example.stage_atb.dto.response.SectionMetricDTO;
import org.example.stage_atb.dto.response.StrategicReportResponse;
import org.example.stage_atb.dto.response.StrategicSectionDTO;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.enums.CreditStatus;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional // ✅ AJOUTER @Transactional sur toute la classe
public class AIStrategyServiceImpl implements IAIStrategyService {

    private final CreditRequestRepository creditRequestRepository;
    private final UserRepository userRepository;

    private static final List<String> RISK_FACTORS = Arrays.asList(
            "Taux d'endettement élevé",
            "Revenus instables",
            "Historique de crédit récent",
            "Montant de crédit élevé",
            "Garantie insuffisante"
    );

    private static final List<String> SUGGESTED_ACTIONS = Arrays.asList(
            "Demander des garanties supplémentaires",
            "Réduire le montant du crédit",
            "Augmenter la durée de remboursement",
            "Fournir des documents financiers complémentaires",
            "Envisager un co-emprunteur"
    );

    @Override
    public StrategicReportResponse generateStrategicReport(StrategicReportRequest request) {
        log.info("📊 Génération du rapport stratégique pour la période: {}", request.getPeriod());

        List<CreditRequest> requests = getRequestsByPeriod(request.getPeriod());

        String title = "Rapport Stratégique - " + getPeriodLabel(request.getPeriod());

        List<StrategicSectionDTO> sections = new ArrayList<>();

        sections.add(generateOverviewSection(requests));

        if (request.isIncludeRiskAnalysis()) {
            sections.add(generateRiskAnalysisSection(requests));
        }

        if (request.isIncludePerformance()) {
            sections.add(generatePerformanceSection(requests));
        }

        if (request.isIncludeForecast()) {
            sections.add(generateForecastSection(requests));
        }

        List<String> recommendations = generateRecommendations(requests);

        return StrategicReportResponse.builder()
                .id(UUID.randomUUID().toString())
                .title(title)
                .date(LocalDateTime.now())
                .summary(generateSummary(requests, request))
                .sections(sections)
                .recommendations(recommendations)
                .generatedBy("IA Stratégique v2.0")
                .version("1.0")
                .build();
    }

    @Override
    public List<StrategicReportResponse> getStrategicReports(int limit) {
        log.info("📋 Récupération des {} derniers rapports stratégiques", limit);
        List<StrategicReportResponse> reports = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, 5); i++) {
            reports.add(generateMockReport(i));
        }
        return reports;
    }

    @Override
    public StrategicReportResponse getStrategicReport(String id) {
        log.info("📋 Récupération du rapport stratégique: {}", id);
        return generateMockReport(0);
    }

    @Override
    public List<AIDecisionDTO> getAIDecisions() {
        log.info("🧠 Récupération des décisions IA");

        List<CreditRequest> pendingRequests = creditRequestRepository
                .findByStatus(CreditStatus.PENDING_ANALYSIS);

        if (pendingRequests.isEmpty()) {
            // Si aucune demande en attente, retourner des données mockées
            return generateMockDecisions();
        }

        return pendingRequests.stream()
                .limit(5)
                .map(this::generateAIDecision)
                .collect(Collectors.toList());
    }

    @Override
    public Resource exportReport(String id, String format) {
        log.info("📤 Export du rapport {} au format {}", id, format);

        String content = "Rapport Stratégique\n";
        content += "==================\n\n";
        content += "Date: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE) + "\n";
        content += "Contenu généré par IA\n";
        content += "\nRecommandations stratégiques:\n";
        content += "- Optimiser le processus d'approbation\n";
        content += "- Renforcer l'analyse des risques\n";

        return new ByteArrayResource(content.getBytes());
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    private List<CreditRequest> getRequestsByPeriod(String period) {
        LocalDateTime startDate = switch (period) {
            case "today" -> LocalDateTime.now().minusDays(1);
            case "week" -> LocalDateTime.now().minusWeeks(1);
            case "month" -> LocalDateTime.now().minusMonths(1);
            case "quarter" -> LocalDateTime.now().minusMonths(3);
            case "year" -> LocalDateTime.now().minusYears(1);
            default -> LocalDateTime.now().minusMonths(1);
        };

        return creditRequestRepository.findByDateRange(startDate, LocalDateTime.now());
    }

    private String getPeriodLabel(String period) {
        return switch (period) {
            case "today" -> "Aujourd'hui";
            case "week" -> "Cette semaine";
            case "month" -> "Ce mois";
            case "quarter" -> "Ce trimestre";
            case "year" -> "Cette année";
            default -> "Période";
        };
    }

    private StrategicSectionDTO generateOverviewSection(List<CreditRequest> requests) {
        long total = requests.size();
        long approved = requests.stream()
                .filter(r -> r.getStatus() == CreditStatus.APPROVED)
                .count();
        long rejected = requests.stream()
                .filter(r -> r.getStatus() == CreditStatus.REJECTED)
                .count();
        long pending = requests.stream()
                .filter(r -> r.getStatus() == CreditStatus.PENDING_ANALYSIS ||
                        r.getStatus() == CreditStatus.UNDER_REVIEW)
                .count();

        BigDecimal totalAmount = requests.stream()
                .map(CreditRequest::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<SectionMetricDTO> metrics = Arrays.asList(
                SectionMetricDTO.builder()
                        .label("Total demandes")
                        .value(total)
                        .change(0)
                        .trend("stable")
                        .color("#1a237e")
                        .build(),
                SectionMetricDTO.builder()
                        .label("Approuvées")
                        .value(approved)
                        .change(total > 0 ? Math.round((double) approved / total * 100) : 0)
                        .trend("up")
                        .color("#4caf50")
                        .build(),
                SectionMetricDTO.builder()
                        .label("Rejetées")
                        .value(rejected)
                        .change(total > 0 ? Math.round((double) rejected / total * 100) : 0)
                        .trend("down")
                        .color("#f44336")
                        .build(),
                SectionMetricDTO.builder()
                        .label("En attente")
                        .value(pending)
                        .change(0)
                        .trend("stable")
                        .color("#ff9800")
                        .build(),
                SectionMetricDTO.builder()
                        .label("Montant total")
                        .value(totalAmount.toString() + " TND")
                        .change(0)
                        .trend("stable")
                        .color("#1a237e")
                        .build()
        );

        return StrategicSectionDTO.builder()
                .title("📊 Vue d'ensemble")
                .content("Analyse globale des demandes de crédit sur la période sélectionnée.")
                .metrics(metrics)
                .build();
    }

    private StrategicSectionDTO generateRiskAnalysisSection(List<CreditRequest> requests) {
        long highRisk = requests.stream()
                .filter(r -> r.getRiskAnalysis() != null &&
                        r.getRiskAnalysis().getRiskScore() != null &&
                        r.getRiskAnalysis().getRiskScore().compareTo(BigDecimal.valueOf(70)) >= 0)
                .count();

        return StrategicSectionDTO.builder()
                .title("⚠️ Analyse des risques")
                .content("Identification des risques majeurs détectés dans les demandes de crédit.")
                .metrics(Arrays.asList(
                        SectionMetricDTO.builder()
                                .label("Risque élevé")
                                .value(highRisk)
                                .change(highRisk > 0 ? 5 : 0)
                                .trend(highRisk > 0 ? "up" : "stable")
                                .color("#f44336")
                                .build()
                ))
                .build();
    }

    private StrategicSectionDTO generatePerformanceSection(List<CreditRequest> requests) {
        long total = requests.size();
        long approved = requests.stream()
                .filter(r -> r.getStatus() == CreditStatus.APPROVED)
                .count();
        double approvalRate = total > 0 ? (double) approved / total * 100 : 0;

        return StrategicSectionDTO.builder()
                .title("📈 Performance")
                .content("Indicateurs de performance des demandes de crédit.")
                .metrics(Arrays.asList(
                        SectionMetricDTO.builder()
                                .label("Taux d'approbation")
                                .value(Math.round(approvalRate) + "%")
                                .change(Math.round(approvalRate))
                                .trend(approvalRate >= 50 ? "up" : "down")
                                .color(approvalRate >= 50 ? "#4caf50" : "#f44336")
                                .build()
                ))
                .build();
    }

    private StrategicSectionDTO generateForecastSection(List<CreditRequest> requests) {
        long total = requests.size();
        long pending = requests.stream()
                .filter(r -> r.getStatus() == CreditStatus.PENDING_ANALYSIS)
                .count();
        long forecastApproved = Math.round(pending * 0.65);

        return StrategicSectionDTO.builder()
                .title("🔮 Prévisions")
                .content("Prévisions basées sur les tendances actuelles des demandes de crédit.")
                .metrics(Arrays.asList(
                        SectionMetricDTO.builder()
                                .label("Demandes en attente")
                                .value(pending)
                                .change(0)
                                .trend("stable")
                                .color("#ff9800")
                                .build(),
                        SectionMetricDTO.builder()
                                .label("Prévision d'approbation")
                                .value(forecastApproved)
                                .change(0)
                                .trend("up")
                                .color("#4caf50")
                                .build()
                ))
                .build();
    }

    private List<String> generateRecommendations(List<CreditRequest> requests) {
        List<String> recommendations = new ArrayList<>();

        long highRisk = requests.stream()
                .filter(r -> r.getRiskAnalysis() != null &&
                        r.getRiskAnalysis().getRiskScore() != null &&
                        r.getRiskAnalysis().getRiskScore().compareTo(BigDecimal.valueOf(70)) >= 0)
                .count();

        if (highRisk > 0) {
            recommendations.add("🔴 Renforcer l'analyse des risques pour les demandes à haut risque");
        }

        long pending = requests.stream()
                .filter(r -> r.getStatus() == CreditStatus.PENDING_ANALYSIS)
                .count();
        if (pending > 10) {
            recommendations.add("⏳ Augmenter les ressources pour traiter les demandes en attente");
        }

        recommendations.add("📊 Optimiser le processus d'approbation pour réduire les délais");
        recommendations.add("🤖 Former les analystes sur les nouveaux outils IA");
        recommendations.add("📈 Suivre régulièrement les indicateurs de performance");

        return recommendations;
    }

    private String generateSummary(List<CreditRequest> requests, StrategicReportRequest request) {
        long total = requests.size();
        long approved = requests.stream()
                .filter(r -> r.getStatus() == CreditStatus.APPROVED)
                .count();
        double approvalRate = total > 0 ? (double) approved / total * 100 : 0;

        return String.format(
                "Rapport stratégique généré pour la période '%s'. " +
                        "Total des demandes: %d. Taux d'approbation: %.1f%%. " +
                        "Les analyses indiquent %s tendance générale. " +
                        "Recommandations stratégiques incluses.",
                getPeriodLabel(request.getPeriod()),
                total,
                approvalRate,
                approvalRate >= 50 ? "une" : "une légère"
        );
    }

    // ✅ MÉTHODE CORRIGÉE - AVEC GESTION DES NULL
    private AIDecisionDTO generateAIDecision(CreditRequest request) {
        Random random = new Random();
        double riskScore = 30 + random.nextDouble() * 50;
        String riskLevel = riskScore < 40 ? "LOW" :
                riskScore < 60 ? "MODERATE" :
                        riskScore < 80 ? "HIGH" : "CRITICAL";
        double confidence = 65 + random.nextDouble() * 30;

        List<String> factors = new ArrayList<>();
        int factorCount = 2 + random.nextInt(3);
        Collections.shuffle(RISK_FACTORS);
        for (int i = 0; i < factorCount && i < RISK_FACTORS.size(); i++) {
            factors.add(RISK_FACTORS.get(i));
        }

        List<String> actions = new ArrayList<>();
        int actionCount = 1 + random.nextInt(2);
        Collections.shuffle(SUGGESTED_ACTIONS);
        for (int i = 0; i < actionCount && i < SUGGESTED_ACTIONS.size(); i++) {
            actions.add(SUGGESTED_ACTIONS.get(i));
        }

        // ✅ RÉCUPÉRATION SÉCURISÉE DU NOM DU CLIENT
        String clientName = "Client inconnu";
        Client client = request.getClient();
        if (client != null) {
            try {
                clientName = (client.getFirstName() != null ? client.getFirstName() : "") +
                        " " +
                        (client.getLastName() != null ? client.getLastName() : "");
                clientName = clientName.trim();
                if (clientName.isEmpty()) {
                    clientName = "Client sans nom";
                }
            } catch (Exception e) {
                log.warn("Impossible de récupérer le nom du client: {}", e.getMessage());
                clientName = "Client #" + request.getClient().getId();
            }
        }

        return AIDecisionDTO.builder()
                .id(request.getId())
                .requestNumber(request.getRequestNumber() != null ? request.getRequestNumber() : "N/A")
                .clientName(clientName)
                .aiRecommendation(getRecommendationByRisk(riskLevel))
                .riskScore(Math.round(riskScore * 100) / 100.0)
                .riskLevel(riskLevel)
                .confidence(Math.round(confidence * 100) / 100.0)
                .factors(factors)
                .suggestedActions(actions)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private String getRecommendationByRisk(String riskLevel) {
        return switch (riskLevel) {
            case "LOW" -> "Crédit recommandé avec conditions standard";
            case "MODERATE" -> "Crédit recommandé avec surveillance renforcée";
            case "HIGH" -> "Crédit à étudier avec précautions";
            case "CRITICAL" -> "Crédit non recommandé sans garanties supplémentaires";
            default -> "Analyse approfondie requise";
        };
    }

    private StrategicReportResponse generateMockReport(int index) {
        List<StrategicSectionDTO> sections = Arrays.asList(
                StrategicSectionDTO.builder()
                        .title("📊 Vue d'ensemble")
                        .content("Analyse globale des demandes de crédit.")
                        .metrics(Arrays.asList(
                                SectionMetricDTO.builder()
                                        .label("Total demandes")
                                        .value(150 + index * 10)
                                        .change(5)
                                        .trend("up")
                                        .color("#1a237e")
                                        .build()
                        ))
                        .build()
        );

        return StrategicReportResponse.builder()
                .id(UUID.randomUUID().toString())
                .title("Rapport Stratégique " + (index + 1))
                .date(LocalDateTime.now().minusDays(index * 2))
                .summary("Rapport stratégique " + (index + 1))
                .sections(sections)
                .recommendations(Arrays.asList(
                        "Optimiser le processus d'approbation",
                        "Renforcer l'analyse des risques"
                ))
                .generatedBy("IA Stratégique v2.0")
                .version("1.0")
                .build();
    }

    // ✅ MÉTHODE POUR GÉNÉRER DES DÉCISIONS MOCKÉES
    private List<AIDecisionDTO> generateMockDecisions() {
        List<AIDecisionDTO> decisions = new ArrayList<>();
        Random random = new Random();

        String[] clients = {"Jean Dupont", "Marie Martin", "Pierre Durand", "Sophie Leblanc", "Lucas Moreau"};
        String[] recommendations = {
                "Crédit recommandé avec conditions standard",
                "Crédit recommandé avec surveillance renforcée",
                "Crédit à étudier avec précautions",
                "Crédit non recommandé sans garanties supplémentaires"
        };
        String[] riskLevels = {"LOW", "MODERATE", "HIGH", "CRITICAL"};
        String[] requestNumbers = {"CR-2024-001", "CR-2024-002", "CR-2024-003", "CR-2024-004", "CR-2024-005"};

        for (int i = 0; i < 5; i++) {
            double riskScore = 30 + random.nextDouble() * 50;
            int riskIndex = riskScore < 40 ? 0 : riskScore < 60 ? 1 : riskScore < 80 ? 2 : 3;

            List<String> factors = new ArrayList<>();
            int factorCount = 2 + random.nextInt(3);
            Collections.shuffle(RISK_FACTORS);
            for (int j = 0; j < factorCount && j < RISK_FACTORS.size(); j++) {
                factors.add(RISK_FACTORS.get(j));
            }

            List<String> actions = new ArrayList<>();
            int actionCount = 1 + random.nextInt(2);
            Collections.shuffle(SUGGESTED_ACTIONS);
            for (int j = 0; j < actionCount && j < SUGGESTED_ACTIONS.size(); j++) {
                actions.add(SUGGESTED_ACTIONS.get(j));
            }

            decisions.add(AIDecisionDTO.builder()
                    .id(UUID.randomUUID().toString())
                    .requestNumber(requestNumbers[i % requestNumbers.length])
                    .clientName(clients[i % clients.length])
                    .aiRecommendation(recommendations[riskIndex])
                    .riskScore(Math.round(riskScore * 100) / 100.0)
                    .riskLevel(riskLevels[riskIndex])
                    .confidence(Math.round((60 + random.nextDouble() * 35) * 100) / 100.0)
                    .factors(factors)
                    .suggestedActions(actions)
                    .generatedAt(LocalDateTime.now().minusMinutes(random.nextInt(120)))
                    .build());
        }

        return decisions;
    }
}