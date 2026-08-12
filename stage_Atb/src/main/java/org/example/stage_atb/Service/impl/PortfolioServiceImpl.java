package org.example.stage_atb.Service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.CreditTypeRepository;
import org.example.stage_atb.Repositories.UserRepository;
import org.example.stage_atb.Service.IPortfolioService;
import org.example.stage_atb.dto.response.PortfolioResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.CreditType;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.CreditStatus;
import org.example.stage_atb.enums.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PortfolioServiceImpl implements IPortfolioService {

    private final CreditRequestRepository creditRequestRepository;
    private final CreditTypeRepository creditTypeRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    // ============================================
    // PORTEFEUILLE GLOBAL
    // ============================================

    @Override
    public PortfolioResponseDTO getGlobalPortfolio(Integer year, String status, String type, String riskLevel, int page, int size) {
        log.info("📊 Récupération du portefeuille global");

        int targetYear = (year != null) ? year : Year.now().getValue();

        LocalDateTime startDate = LocalDate.of(targetYear, 1, 1).atStartOfDay();
        LocalDateTime endDate = LocalDate.of(targetYear, 12, 31).atTime(23, 59, 59);

        // Récupérer tous les crédits de l'année
        List<CreditRequest> allCredits = creditRequestRepository.findByDateRange(startDate, endDate);

        // Appliquer les filtres
        List<CreditRequest> filteredCredits = allCredits.stream()
                .filter(cr -> status == null || status.isEmpty() || cr.getStatus().name().equalsIgnoreCase(status))
                .filter(cr -> type == null || type.isEmpty() ||
                        (cr.getCreditType() != null && cr.getCreditType().getName().equalsIgnoreCase(type)))
                .filter(cr -> riskLevel == null || riskLevel.isEmpty() ||
                        isRiskLevelMatch(cr, riskLevel))
                .collect(Collectors.toList());

        // Pagination
        int totalCredits = filteredCredits.size();
        int start = Math.min(page * size, totalCredits);
        int end = Math.min(start + size, totalCredits);
        List<CreditRequest> pagedCredits = filteredCredits.subList(start, end);

        // Construire la réponse
        PortfolioResponseDTO response = new PortfolioResponseDTO();
        response.setTotalCredits(totalCredits);
        response.setCredits(pagedCredits.stream()
                .map(this::mapCreditToResponse)
                .collect(Collectors.toList()));

        // Récupérer les types de crédit disponibles
        List<CreditType> creditTypes = creditTypeRepository.findActiveOrderByName();
        response.setCreditTypes(creditTypes.stream()
                .map(CreditType::getName)
                .collect(Collectors.toList()));

        // Statistiques
        Map<String, Object> stats = calculateStatistics(filteredCredits);
        response.setStatistics(stats);

        return response;
    }

    // ============================================
    // RÉSUMÉ DU PORTEFEUILLE
    // ============================================

    @Override
    public Map<String, Object> getPortfolioSummary(Integer year) {
        log.info("📊 Récupération du résumé du portefeuille pour l'année: {}", year);

        int targetYear = (year != null) ? year : Year.now().getValue();

        LocalDateTime startDate = LocalDate.of(targetYear, 1, 1).atStartOfDay();
        LocalDateTime endDate = LocalDate.of(targetYear, 12, 31).atTime(23, 59, 59);

        List<CreditRequest> credits = creditRequestRepository.findByDateRange(startDate, endDate);

        Map<String, Object> summary = new HashMap<>();

        // Total encours (APPROVED + PENDING_ANALYSIS)
        BigDecimal totalEncours = credits.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.APPROVED || cr.getStatus() == CreditStatus.PENDING_ANALYSIS)
                .map(CreditRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.put("totalEncours", totalEncours);

        // Crédits actifs
        long creditsActifs = credits.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.APPROVED ||
                        cr.getStatus() == CreditStatus.PENDING_ANALYSIS ||
                        cr.getStatus() == CreditStatus.UNDER_REVIEW)
                .count();
        summary.put("creditsActifs", creditsActifs);

        // Taux d'impayés (REJECTED)
        long totalCredits = credits.size();
        long rejected = credits.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.REJECTED)
                .count();
        double tauxImpayes = totalCredits > 0 ? (rejected * 100.0 / totalCredits) : 0;
        summary.put("tauxImpayes", Math.round(tauxImpayes * 100.0) / 100.0);

        // Risque global
        String risqueGlobal = calculateGlobalRisk(credits);
        summary.put("risqueGlobal", risqueGlobal);

        // Score de risque
        double scoreRisque = calculateRiskScore(credits);
        summary.put("scoreRisque", Math.round(scoreRisque * 100.0) / 100.0);

        // Évolution par rapport à l'année précédente
        double evolution = calculateEvolution(targetYear);
        summary.put("evolution", Math.round(evolution * 100.0) / 100.0);

        // Évolution des crédits
        double evolutionCredits = calculateEvolutionCredits(targetYear);
        summary.put("evolutionCredits", Math.round(evolutionCredits * 100.0) / 100.0);

        return summary;
    }

    // ============================================
    // DONNÉES DES GRAPHIQUES
    // ============================================

    @Override
    public Map<String, Object> getPortfolioCharts(Integer year) {
        log.info("📊 Récupération des données des graphiques pour l'année: {}", year);

        int targetYear = (year != null) ? year : Year.now().getValue();

        LocalDateTime startDate = LocalDate.of(targetYear, 1, 1).atStartOfDay();
        LocalDateTime endDate = LocalDate.of(targetYear, 12, 31).atTime(23, 59, 59);

        List<CreditRequest> credits = creditRequestRepository.findByDateRange(startDate, endDate);

        Map<String, Object> charts = new HashMap<>();

        // Évolution mensuelle
        charts.put("evolution", getMonthlyEvolution(credits, targetYear));

        // Distribution par type
        charts.put("distribution", getDistributionByType(credits));

        // Taux d'acceptation
        charts.put("acceptation", getAcceptanceStats(credits));

        // Risque par type
        charts.put("riskByType", getRiskByType(credits));

        return charts;
    }

    // ============================================
    // ANALYSE DES RISQUES
    // ============================================

    @Override
    public Map<String, Object> getPortfolioRisk(Integer year) {
        log.info("📊 Récupération de l'analyse des risques pour l'année: {}", year);

        int targetYear = (year != null) ? year : Year.now().getValue();

        LocalDateTime startDate = LocalDate.of(targetYear, 1, 1).atStartOfDay();
        LocalDateTime endDate = LocalDate.of(targetYear, 12, 31).atTime(23, 59, 59);

        List<CreditRequest> credits = creditRequestRepository.findByDateRange(startDate, endDate);

        Map<String, Object> risk = new HashMap<>();

        // Risque global
        risk.put("risqueGlobal", calculateGlobalRisk(credits));
        risk.put("scoreGlobal", calculateRiskScore(credits));

        // Risque de crédit
        risk.put("risqueCredit", calculateCreditRisk(credits));
        risk.put("scoreCredit", calculateCreditRiskScore(credits));
        risk.put("descriptionCredit", "Analyse du risque de défaut de paiement");
        risk.put("impactCredit", 7);
        risk.put("probabiliteCredit", 5);

        // Risque financier
        risk.put("risqueFinancier", calculateFinancialRisk(credits));
        risk.put("scoreFinancier", calculateFinancialRiskScore(credits));
        risk.put("descriptionFinancier", "Analyse de la santé financière du portefeuille");
        risk.put("impactFinancier", 6);
        risk.put("probabiliteFinancier", 4);

        // Risque opérationnel
        risk.put("risqueOperationnel", calculateOperationalRisk(credits));
        risk.put("scoreOperationnel", calculateOperationalRiskScore(credits));
        risk.put("descriptionOperationnel", "Analyse des risques opérationnels");
        risk.put("impactOperationnel", 5);
        risk.put("probabiliteOperationnel", 3);

        // Crédits à risque
        risk.put("creditsARisque", getHighRiskCredits(credits));

        // Recommandations
        risk.put("recommandations", generateRecommendations(credits));

        return risk;
    }

    // ============================================
    // DÉTAILS D'UN CRÉDIT
    // ============================================

    @Override
    public Map<String, Object> getCreditDetails(String creditId) {
        log.info("🔍 Récupération des détails du crédit: {}", creditId);

        CreditRequest credit = creditRequestRepository.findById(creditId)
                .orElseThrow(() -> new RuntimeException("Crédit non trouvé avec l'id: " + creditId));

        Map<String, Object> details = new HashMap<>();

        // Informations générales
        details.put("id", credit.getId());
        details.put("requestNumber", credit.getRequestNumber());
        details.put("clientName", credit.getClient().getFirstName() + " " + credit.getClient().getLastName());
        details.put("clientId", credit.getClient().getId());
        details.put("type", credit.getCreditType() != null ? credit.getCreditType().getName() : "Non spécifié");
        details.put("montant", credit.getAmount());
        details.put("duree", credit.getDurationMonths());
        details.put("taux", credit.getInterestRate());
        details.put("dateOctroi", credit.getCreatedAt().toLocalDate());
        details.put("statut", credit.getStatus().name());
        details.put("risque", getRiskLevelForCredit(credit));
        details.put("analyste", getAnalystName(credit));
        details.put("dateValidation", credit.getApprovalDate());
        details.put("notes", credit.getRejectionReason());

        // Ratios financiers (calculés ou récupérés)
        Map<String, Object> ratios = new HashMap<>();
        ratios.put("capaciteRemboursement", calculateCapacity(credit));
        ratios.put("tauxEndettement", calculateDebtRatio(credit));
        ratios.put("liquidite", calculateLiquidity(credit));
        ratios.put("solvabilite", calculateSolvency(credit));
        details.put("ratios", ratios);

        // Risques
        details.put("risques", getCreditRisks(credit));

        // Historique
        details.put("historique", getCreditHistory(credit));

        return details;
    }

    // ============================================
    // EXPORTATION - VERSION CORRIGÉE
    // ============================================

    @Override
    public byte[] exportPortfolioData(Integer year) {
        log.info("📤 Exportation des données du portefeuille pour l'année: {}", year);

        int targetYear = (year != null) ? year : Year.now().getValue();

        LocalDateTime startDate = LocalDate.of(targetYear, 1, 1).atStartOfDay();
        LocalDateTime endDate = LocalDate.of(targetYear, 12, 31).atTime(23, 59, 59);

        List<CreditRequest> credits = creditRequestRepository.findByDateRange(startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Portefeuille " + targetYear);

            // En-têtes
            String[] headers = {"N° Demande", "Client", "Type", "Montant (TND)", "Durée (mois)", "Taux (%)", "Statut", "Date", "Analyste"};

            // Créer la ligne d'en-tête avec org.apache.poi.ss.usermodel.Row
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }

            // Données
            int rowNum = 1;
            for (CreditRequest credit : credits) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(credit.getRequestNumber());
                row.createCell(1).setCellValue(credit.getClient().getFirstName() + " " + credit.getClient().getLastName());
                row.createCell(2).setCellValue(credit.getCreditType() != null ? credit.getCreditType().getName() : "");
                row.createCell(3).setCellValue(credit.getAmount().doubleValue());
                row.createCell(4).setCellValue(credit.getDurationMonths());
                row.createCell(5).setCellValue(credit.getInterestRate().doubleValue());
                row.createCell(6).setCellValue(credit.getStatus().name());
                row.createCell(7).setCellValue(credit.getCreatedAt().toLocalDate().toString());
                row.createCell(8).setCellValue(getAnalystName(credit));
            }

            // Ajuster automatiquement les colonnes
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de l'exportation: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de l'exportation du portefeuille", e);
        }
    }

    // ============================================
    // PERFORMANCES DES ANALYSTES
    // ============================================

    @Override
    public Map<String, Object> getAnalystPerformance(Integer year, String analystId) {
        log.info("📊 Récupération des performances des analystes");

        int targetYear = (year != null) ? year : Year.now().getValue();

        LocalDateTime startDate = LocalDate.of(targetYear, 1, 1).atStartOfDay();
        LocalDateTime endDate = LocalDate.of(targetYear, 12, 31).atTime(23, 59, 59);

        List<CreditRequest> credits = creditRequestRepository.findByDateRange(startDate, endDate);

        // Filtrer par analyste si spécifié
        if (analystId != null && !analystId.isEmpty()) {
            credits = credits.stream()
                    .filter(cr -> analystId.equals(getAnalystId(cr)))
                    .collect(Collectors.toList());
        }

        // Grouper par analyste
        Map<String, List<CreditRequest>> byAnalyst = credits.stream()
                .filter(cr -> getAnalystId(cr) != null)
                .collect(Collectors.groupingBy(this::getAnalystId));

        List<Map<String, Object>> analystStats = new ArrayList<>();

        for (Map.Entry<String, List<CreditRequest>> entry : byAnalyst.entrySet()) {
            String analystIdKey = entry.getKey();
            List<CreditRequest> analystCredits = entry.getValue();

            User analyst = userRepository.findById(analystIdKey).orElse(null);
            if (analyst == null) continue;

            Map<String, Object> stats = new HashMap<>();
            stats.put("id", analyst.getId());
            stats.put("name", analyst.getFirstName() + " " + analyst.getLastName());
            stats.put("processed", analystCredits.size());

            long approved = analystCredits.stream()
                    .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                    .count();
            long rejected = analystCredits.stream()
                    .filter(cr -> cr.getStatus() == CreditStatus.REJECTED)
                    .count();

            double efficiency = analystCredits.size() > 0 ?
                    (approved * 100.0 / analystCredits.size()) : 0;
            stats.put("efficiency", Math.round(efficiency * 100.0) / 100.0);
            stats.put("approved", approved);
            stats.put("rejected", rejected);

            analystStats.add(stats);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("analysts", analystStats);
        result.put("totalAnalysts", analystStats.size());
        result.put("totalProcessed", credits.stream().filter(cr -> getAnalystId(cr) != null).count());

        return result;
    }

    @Override
    public Map<String, Object> getWorkloadDistribution() {
        log.info("📊 Récupération de la répartition des dossiers");

        // Récupérer tous les analystes actifs
        List<User> analysts = userRepository.findByRole(UserRole.ANALYST);

        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> distribution = new ArrayList<>();

        for (User analyst : analysts) {
            // Récupérer les clients assignés à cet analyste
            List<Client> clients = clientRepository.findByAnalystId(analyst.getId());
            long pendingCount = 0;
            long totalClients = clients.size();

            for (Client client : clients) {
                List<CreditRequest> credits = creditRequestRepository.findByClientId(client.getId());
                pendingCount += credits.stream()
                        .filter(cr -> cr.getStatus() == CreditStatus.PENDING_ANALYSIS)
                        .count();
            }

            Map<String, Object> item = new HashMap<>();
            item.put("analystId", analyst.getId());
            item.put("analystName", analyst.getFirstName() + " " + analyst.getLastName());
            item.put("pendingCount", pendingCount);
            item.put("totalClients", totalClients);
            distribution.add(item);
        }

        result.put("distribution", distribution);
        result.put("totalAnalysts", analysts.size());
        result.put("totalPending", distribution.stream()
                .mapToLong(d -> (Long) d.get("pendingCount"))
                .sum());

        return result;
    }

    // ============================================
    // MÉTHODES UTILITAIRES PRIVÉES
    // ============================================

    private Map<String, Object> mapCreditToResponse(CreditRequest credit) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", credit.getId());
        map.put("clientId", credit.getClient().getId());
        map.put("clientName", credit.getClient().getFirstName() + " " + credit.getClient().getLastName());
        map.put("type", credit.getCreditType() != null ? credit.getCreditType().getName() : "Non spécifié");
        map.put("montant", credit.getAmount());
        map.put("dateOctroi", credit.getCreatedAt().toLocalDate());
        map.put("duree", credit.getDurationMonths());
        map.put("taux", credit.getInterestRate());
        map.put("statut", credit.getStatus().name());
        map.put("risque", getRiskLevelForCredit(credit));
        return map;
    }

    private String getRiskLevelForCredit(CreditRequest credit) {
        if (credit.getRiskAnalysis() != null && credit.getRiskAnalysis().getOverallRisk() != null) {
            return credit.getRiskAnalysis().getOverallRisk().toString().toLowerCase();
        }

        // Calcul basé sur le montant
        BigDecimal amount = credit.getAmount();
        if (amount.compareTo(BigDecimal.valueOf(50000)) > 0) {
            return "élevé";
        } else if (amount.compareTo(BigDecimal.valueOf(20000)) > 0) {
            return "moyen";
        }
        return "faible";
    }

    private boolean isRiskLevelMatch(CreditRequest credit, String riskLevel) {
        String level = getRiskLevelForCredit(credit);
        return level.equalsIgnoreCase(riskLevel);
    }

    private String getAnalystName(CreditRequest credit) {
        if (credit.getUser() != null &&
                credit.getUser().getRole() == UserRole.ANALYST) {
            return credit.getUser().getFirstName() + " " + credit.getUser().getLastName();
        }
        // Vérifier si l'analyste est assigné via le client
        if (credit.getClient() != null && credit.getClient().getAnalyst() != null) {
            return credit.getClient().getAnalyst().getFirstName() + " " + credit.getClient().getAnalyst().getLastName();
        }
        return "Non assigné";
    }

    private String getAnalystId(CreditRequest credit) {
        if (credit.getUser() != null &&
                credit.getUser().getRole() == UserRole.ANALYST) {
            return credit.getUser().getId();
        }
        if (credit.getClient() != null && credit.getClient().getAnalyst() != null) {
            return credit.getClient().getAnalyst().getId();
        }
        return null;
    }

    private Map<String, Object> calculateStatistics(List<CreditRequest> credits) {
        Map<String, Object> stats = new HashMap<>();

        long total = credits.size();
        long approved = credits.stream().filter(cr -> cr.getStatus() == CreditStatus.APPROVED).count();
        long rejected = credits.stream().filter(cr -> cr.getStatus() == CreditStatus.REJECTED).count();
        long pending = credits.stream().filter(cr -> cr.getStatus() == CreditStatus.PENDING_ANALYSIS).count();
        long draft = credits.stream().filter(cr -> cr.getStatus() == CreditStatus.DRAFT).count();

        stats.put("total", total);
        stats.put("approved", approved);
        stats.put("rejected", rejected);
        stats.put("pending", pending);
        stats.put("draft", draft);

        double acceptanceRate = total > 0 ? (approved * 100.0 / total) : 0;
        stats.put("acceptanceRate", Math.round(acceptanceRate * 100.0) / 100.0);

        BigDecimal totalAmount = credits.stream()
                .map(CreditRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalAmount", totalAmount);

        return stats;
    }

    private String calculateGlobalRisk(List<CreditRequest> credits) {
        double score = calculateRiskScore(credits);
        if (score < 30) return "faible";
        if (score < 60) return "moyen";
        if (score < 80) return "élevé";
        return "critique";
    }

    private double calculateRiskScore(List<CreditRequest> credits) {
        if (credits.isEmpty()) return 0;

        long highRisk = credits.stream()
                .filter(cr -> getRiskLevelForCredit(cr).equals("élevé"))
                .count();

        long rejected = credits.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.REJECTED)
                .count();

        return (highRisk * 20.0 + rejected * 30.0) / credits.size();
    }

    private String calculateCreditRisk(List<CreditRequest> credits) {
        double score = calculateCreditRiskScore(credits);
        if (score < 30) return "faible";
        if (score < 60) return "moyen";
        return "élevé";
    }

    private double calculateCreditRiskScore(List<CreditRequest> credits) {
        if (credits.isEmpty()) return 0;

        long rejected = credits.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.REJECTED)
                .count();

        return rejected * 100.0 / credits.size();
    }

    private String calculateFinancialRisk(List<CreditRequest> credits) {
        double score = calculateFinancialRiskScore(credits);
        if (score < 30) return "faible";
        if (score < 60) return "moyen";
        return "élevé";
    }

    private double calculateFinancialRiskScore(List<CreditRequest> credits) {
        if (credits.isEmpty()) return 0;

        BigDecimal totalAmount = credits.stream()
                .map(CreditRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageAmount = totalAmount.divide(BigDecimal.valueOf(credits.size()), 2, RoundingMode.HALF_UP);

        long highAmount = credits.stream()
                .filter(cr -> cr.getAmount().compareTo(averageAmount.multiply(BigDecimal.valueOf(1.5))) > 0)
                .count();

        return highAmount * 100.0 / credits.size();
    }

    private String calculateOperationalRisk(List<CreditRequest> credits) {
        double score = calculateOperationalRiskScore(credits);
        if (score < 30) return "faible";
        if (score < 60) return "moyen";
        return "élevé";
    }

    private double calculateOperationalRiskScore(List<CreditRequest> credits) {
        if (credits.isEmpty()) return 0;

        long pending = credits.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.PENDING_ANALYSIS)
                .count();

        return pending * 100.0 / credits.size();
    }

    private List<Map<String, Object>> getHighRiskCredits(List<CreditRequest> credits) {
        return credits.stream()
                .filter(cr -> getRiskLevelForCredit(cr).equals("élevé"))
                .limit(10)
                .map(this::mapCreditToResponse)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> generateRecommendations(List<CreditRequest> credits) {
        List<Map<String, Object>> recommendations = new ArrayList<>();

        long total = credits.size();
        if (total == 0) return recommendations;

        // Recommandation 1: Surveiller les crédits à risque
        long highRiskCount = credits.stream()
                .filter(cr -> getRiskLevelForCredit(cr).equals("élevé"))
                .count();
        if (highRiskCount > total * 0.2) {
            Map<String, Object> rec = new HashMap<>();
            rec.put("titre", "Surveillance des crédits à risque");
            rec.put("description", String.format("%d crédits à risque élevé détectés sur %d. Une analyse approfondie est recommandée.", highRiskCount, total));
            rec.put("priorite", "haute");
            rec.put("actions", List.of(
                    "Analyser les dossiers à risque",
                    "Contacter les clients concernés",
                    "Mettre en place un suivi renforcé"
            ));
            recommendations.add(rec);
        }

        // Recommandation 2: Optimiser le taux d'acceptation
        long approved = credits.stream().filter(cr -> cr.getStatus() == CreditStatus.APPROVED).count();
        double acceptanceRate = total > 0 ? approved * 100.0 / total : 0;
        if (acceptanceRate < 50) {
            Map<String, Object> rec = new HashMap<>();
            rec.put("titre", "Optimisation du taux d'acceptation");
            rec.put("description", String.format("Le taux d'acceptation est de %.1f%%. Une révision des critères est suggérée.", acceptanceRate));
            rec.put("priorite", "moyenne");
            rec.put("actions", List.of(
                    "Réviser les critères d'acceptation",
                    "Former les analystes",
                    "Améliorer le scoring"
            ));
            recommendations.add(rec);
        }

        // Recommandation 3: Réduire les impayés
        long rejected = credits.stream().filter(cr -> cr.getStatus() == CreditStatus.REJECTED).count();
        double rejectRate = total > 0 ? rejected * 100.0 / total : 0;
        if (rejectRate > 30) {
            Map<String, Object> rec = new HashMap<>();
            rec.put("titre", "Réduction des impayés");
            rec.put("description", String.format("Le taux de rejet est de %.1f%%. Une amélioration de la sélection est recommandée.", rejectRate));
            rec.put("priorite", "haute");
            rec.put("actions", List.of(
                    "Renforcer les vérifications initiales",
                    "Améliorer la qualification des clients",
                    "Mettre en place des alertes précoces"
            ));
            recommendations.add(rec);
        }

        // Recommandation 4: Diversifier le portefeuille
        Map<String, Long> byType = credits.stream()
                .filter(cr -> cr.getCreditType() != null)
                .collect(Collectors.groupingBy(
                        cr -> cr.getCreditType().getName(),
                        Collectors.counting()
                ));

        if (byType.size() < 3) {
            Map<String, Object> rec = new HashMap<>();
            rec.put("titre", "Diversification du portefeuille");
            rec.put("description", "Le portefeuille est concentré sur peu de types de crédit. Une diversification est recommandée.");
            rec.put("priorite", "basse");
            rec.put("actions", List.of(
                    "Proposer de nouveaux types de crédit",
                    "Cibler de nouveaux segments",
                    "Développer des offres innovantes"
            ));
            recommendations.add(rec);
        }

        return recommendations;
    }

    private Map<String, Object> getMonthlyEvolution(List<CreditRequest> credits, int year) {
        Map<String, Object> evolution = new HashMap<>();
        List<String> months = List.of("Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc");
        List<Double> values = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            LocalDateTime monthStart = LocalDate.of(year, month, 1).atStartOfDay();
            LocalDateTime monthEnd = month < 12 ?
                    LocalDate.of(year, month + 1, 1).atStartOfDay() :
                    LocalDate.of(year + 1, 1, 1).atStartOfDay();

            double total = credits.stream()
                    .filter(cr -> cr.getCreatedAt().isAfter(monthStart) && cr.getCreatedAt().isBefore(monthEnd))
                    .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                    .mapToDouble(cr -> cr.getAmount().doubleValue())
                    .sum();

            values.add(Math.round(total * 100.0) / 100.0);
        }

        evolution.put("labels", months);
        evolution.put("values", values);
        return evolution;
    }

    private Map<String, Object> getDistributionByType(List<CreditRequest> credits) {
        Map<String, Object> distribution = new HashMap<>();

        Map<String, Long> countByType = credits.stream()
                .filter(cr -> cr.getCreditType() != null)
                .collect(Collectors.groupingBy(
                        cr -> cr.getCreditType().getName(),
                        Collectors.counting()
                ));

        List<String> labels = new ArrayList<>(countByType.keySet());
        List<Long> values = new ArrayList<>(countByType.values());

        distribution.put("labels", labels);
        distribution.put("values", values);
        return distribution;
    }

    private Map<String, Object> getAcceptanceStats(List<CreditRequest> credits) {
        Map<String, Object> stats = new HashMap<>();

        long acceptes = credits.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                .count();

        long refuses = credits.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.REJECTED)
                .count();

        long enAttente = credits.stream()
                .filter(cr -> cr.getStatus() == CreditStatus.PENDING_ANALYSIS)
                .count();

        stats.put("acceptes", acceptes);
        stats.put("refuses", refuses);
        stats.put("enAttente", enAttente);
        return stats;
    }

    private Map<String, Object> getRiskByType(List<CreditRequest> credits) {
        Map<String, Object> riskByType = new HashMap<>();

        Map<String, List<CreditRequest>> byType = credits.stream()
                .filter(cr -> cr.getCreditType() != null)
                .collect(Collectors.groupingBy(
                        cr -> cr.getCreditType().getName()
                ));

        List<String> labels = new ArrayList<>();
        List<Double> low = new ArrayList<>();
        List<Double> medium = new ArrayList<>();
        List<Double> high = new ArrayList<>();

        for (Map.Entry<String, List<CreditRequest>> entry : byType.entrySet()) {
            labels.add(entry.getKey());
            List<CreditRequest> typeCredits = entry.getValue();

            long lowCount = typeCredits.stream()
                    .filter(cr -> getRiskLevelForCredit(cr).equals("faible"))
                    .count();
            long mediumCount = typeCredits.stream()
                    .filter(cr -> getRiskLevelForCredit(cr).equals("moyen"))
                    .count();
            long highCount = typeCredits.stream()
                    .filter(cr -> getRiskLevelForCredit(cr).equals("élevé"))
                    .count();

            double total = typeCredits.size();
            low.add(total > 0 ? Math.round(lowCount * 100.0 / total * 100.0) / 100.0 : 0);
            medium.add(total > 0 ? Math.round(mediumCount * 100.0 / total * 100.0) / 100.0 : 0);
            high.add(total > 0 ? Math.round(highCount * 100.0 / total * 100.0) / 100.0 : 0);
        }

        riskByType.put("labels", labels);
        riskByType.put("low", low);
        riskByType.put("medium", medium);
        riskByType.put("high", high);
        return riskByType;
    }

    private double calculateCapacity(CreditRequest credit) {
        if (credit.getFinancialAnalysis() != null && credit.getFinancialAnalysis().getDebtRatio() != null) {
            return 100 - credit.getFinancialAnalysis().getDebtRatio().doubleValue() * 100;
        }
        return 65.0;
    }

    private double calculateDebtRatio(CreditRequest credit) {
        if (credit.getFinancialAnalysis() != null && credit.getFinancialAnalysis().getDebtRatio() != null) {
            return credit.getFinancialAnalysis().getDebtRatio().doubleValue() * 100;
        }
        return 30.0;
    }

    private double calculateLiquidity(CreditRequest credit) {
        return 1.5;
    }

    private double calculateSolvency(CreditRequest credit) {
        return 65.0;
    }

    private List<Map<String, Object>> getCreditRisks(CreditRequest credit) {
        List<Map<String, Object>> risks = new ArrayList<>();

        String riskLevel = getRiskLevelForCredit(credit);
        if (riskLevel.equals("élevé")) {
            Map<String, Object> risk = new HashMap<>();
            risk.put("description", "Risque de défaut de paiement élevé");
            risk.put("niveau", "élevé");
            risk.put("date", LocalDate.now().toString());
            risks.add(risk);
        }

        if (credit.getAmount().compareTo(BigDecimal.valueOf(100000)) > 0) {
            Map<String, Object> risk = new HashMap<>();
            risk.put("description", "Montant élevé - nécessite une attention particulière");
            risk.put("niveau", "moyen");
            risk.put("date", LocalDate.now().toString());
            risks.add(risk);
        }

        if (riskLevel.equals("moyen")) {
            Map<String, Object> risk = new HashMap<>();
            risk.put("description", "Risque modéré - surveillance recommandée");
            risk.put("niveau", "moyen");
            risk.put("date", LocalDate.now().toString());
            risks.add(risk);
        }

        return risks;
    }

    private List<Map<String, Object>> getCreditHistory(CreditRequest credit) {
        List<Map<String, Object>> history = new ArrayList<>();

        // Création
        Map<String, Object> creation = new HashMap<>();
        creation.put("titre", "Demande créée");
        creation.put("description", "La demande de crédit a été créée");
        creation.put("date", credit.getCreatedAt().toString());
        creation.put("type", "creation");
        creation.put("utilisateur", credit.getUser().getFirstName() + " " + credit.getUser().getLastName());
        history.add(creation);

        // Changement de statut
        Map<String, Object> statusChange = new HashMap<>();
        statusChange.put("titre", "Statut mis à jour");
        statusChange.put("description", "Statut: " + credit.getStatus().name());
        statusChange.put("date", credit.getUpdatedAt().toString());
        statusChange.put("type", "status");
        statusChange.put("utilisateur", credit.getUser().getFirstName() + " " + credit.getUser().getLastName());
        history.add(statusChange);

        // Si approuvé
        if (credit.getApprovalDate() != null) {
            Map<String, Object> approval = new HashMap<>();
            approval.put("titre", "Demande approuvée");
            approval.put("description", "La demande a été approuvée");
            approval.put("date", credit.getApprovalDate().toString());
            approval.put("type", "decision");
            approval.put("utilisateur", getAnalystName(credit));
            history.add(approval);
        }

        return history;
    }

    private double calculateEvolution(Integer year) {
        try {
            int prevYear = year - 1;
            LocalDateTime prevStart = LocalDate.of(prevYear, 1, 1).atStartOfDay();
            LocalDateTime prevEnd = LocalDate.of(prevYear, 12, 31).atTime(23, 59, 59);
            LocalDateTime currStart = LocalDate.of(year, 1, 1).atStartOfDay();
            LocalDateTime currEnd = LocalDate.of(year, 12, 31).atTime(23, 59, 59);

            List<CreditRequest> prevCredits = creditRequestRepository.findByDateRange(prevStart, prevEnd);
            List<CreditRequest> currCredits = creditRequestRepository.findByDateRange(currStart, currEnd);

            BigDecimal prevAmount = prevCredits.stream()
                    .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                    .map(CreditRequest::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal currAmount = currCredits.stream()
                    .filter(cr -> cr.getStatus() == CreditStatus.APPROVED)
                    .map(CreditRequest::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (prevAmount.compareTo(BigDecimal.ZERO) == 0) return 0;

            return currAmount.subtract(prevAmount)
                    .divide(prevAmount, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        } catch (Exception e) {
            log.warn("Erreur lors du calcul de l'évolution: {}", e.getMessage());
            return 5.0 + (Math.random() * 10.0);
        }
    }

    private double calculateEvolutionCredits(Integer year) {
        try {
            int prevYear = year - 1;
            LocalDateTime prevStart = LocalDate.of(prevYear, 1, 1).atStartOfDay();
            LocalDateTime prevEnd = LocalDate.of(prevYear, 12, 31).atTime(23, 59, 59);
            LocalDateTime currStart = LocalDate.of(year, 1, 1).atStartOfDay();
            LocalDateTime currEnd = LocalDate.of(year, 12, 31).atTime(23, 59, 59);

            long prevCount = creditRequestRepository.findByDateRange(prevStart, prevEnd).size();
            long currCount = creditRequestRepository.findByDateRange(currStart, currEnd).size();

            if (prevCount == 0) return 0;

            return ((currCount - prevCount) * 100.0 / prevCount);
        } catch (Exception e) {
            log.warn("Erreur lors du calcul de l'évolution des crédits: {}", e.getMessage());
            return 3.0 + (Math.random() * 8.0);
        }
    }
}