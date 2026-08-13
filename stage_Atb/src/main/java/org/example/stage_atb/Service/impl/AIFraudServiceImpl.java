// Service/impl/AIFraudServiceImpl.java
package org.example.stage_atb.Service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Mappers.FraudAlertMapper;
import org.example.stage_atb.Repositories.FraudAlertRepository;
import org.example.stage_atb.Service.IAIFraudService;
import org.example.stage_atb.Service.IFraudAlertService;
import org.example.stage_atb.dto.response.FraudAlertResponseDTO;
import org.example.stage_atb.dto.response.FraudStatisticsDTO;
import org.example.stage_atb.entity.FraudAlert;
import org.example.stage_atb.enums.RiskLevel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AIFraudServiceImpl implements IAIFraudService {

    private final FraudAlertRepository fraudAlertRepository;
    private final FraudAlertMapper fraudAlertMapper;
    private final IFraudAlertService fraudAlertService;

    @Override
    public List<FraudAlertResponseDTO> getFraudAlerts(String status, String severity) {
        log.info("📋 Récupération des alertes de fraude");

        List<FraudAlert> alerts;

        // Si aucun filtre, retourner toutes les alertes
        if (status == null && severity == null) {
            alerts = fraudAlertRepository.findAll();
        } else {
            // Filtrer par statut et sévérité
            alerts = fraudAlertRepository.findAll().stream()
                    .filter(a -> {
                        boolean match = true;
                        if (status != null && !status.equals("ALL")) {
                            match = match && getAlertStatus(a).equals(status);
                        }
                        if (severity != null && !severity.equals("ALL")) {
                            try {
                                RiskLevel level = RiskLevel.valueOf(severity);
                                match = match && a.getSeverity() == level;
                            } catch (IllegalArgumentException e) {
                                // Ignorer
                            }
                        }
                        return match;
                    })
                    .collect(Collectors.toList());
        }

        // Trier par date de création (plus récent en premier)
        alerts.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        return alerts.stream()
                .map(fraudAlertMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FraudAlertResponseDTO getFraudAlert(String id) {
        log.info("📋 Récupération de l'alerte: {}", id);
        return fraudAlertService.getFraudAlertById(id);
    }

    @Override
    public FraudAlertResponseDTO updateFraudAlertStatus(String id, String status, String comments) {
        log.info("🔄 Mise à jour du statut de l'alerte: {} -> {}", id, status);

        FraudAlert alert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alerte non trouvée"));

        // Mettre à jour selon le statut
        switch (status.toUpperCase()) {
            case "UNDER_REVIEW":
                alert.setReviewed(true);
                break;
            case "CONFIRMED":
                alert.setConfirmed(true);
                alert.setReviewed(true);
                break;
            case "REJECTED":
                alert.setConfirmed(false);
                alert.setReviewed(true);
                break;
            default:
                // NEW - pas de changement
                break;
        }

        if (comments != null && !comments.isEmpty()) {
            alert.setActionNotes(comments);
        }

        alert.setUpdatedAt(LocalDateTime.now());
        FraudAlert updated = fraudAlertRepository.save(alert);

        return fraudAlertMapper.toResponseDTO(updated);
    }

    @Override
    public FraudStatisticsDTO getFraudStatistics() {
        log.info("📊 Récupération des statistiques de fraude");

        List<FraudAlert> alerts = fraudAlertRepository.findAll();

        // Statistiques par statut
        long totalAlerts = alerts.size();
        long newAlerts = alerts.stream()
                .filter(a -> !a.isReviewed())
                .count();
        long underReview = alerts.stream()
                .filter(a -> a.isReviewed() && !a.isConfirmed() && !a.isActionTaken())
                .count();
        long confirmed = alerts.stream()
                .filter(a -> a.isConfirmed())
                .count();
        long rejected = alerts.stream()
                .filter(a -> a.isReviewed() && !a.isConfirmed())
                .count();

        // Statistiques par type
        Map<String, Long> byType = alerts.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getAlertType() != null ? a.getAlertType() : "UNKNOWN",
                        Collectors.counting()
                ));

        // Statistiques par sévérité
        Map<String, Long> bySeverity = alerts.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getSeverity() != null ? a.getSeverity().toString() : "UNKNOWN",
                        Collectors.counting()
                ));

        // Tendance des 7 derniers jours
        long[] trendLastDays = new long[7];
        LocalDateTime now = LocalDateTime.now();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime day = now.minusDays(i);
            long count = alerts.stream()
                    .filter(a -> a.getCreatedAt().toLocalDate().equals(day.toLocalDate()))
                    .count();
            trendLastDays[6 - i] = count;
        }

        return FraudStatisticsDTO.builder()
                .totalAlerts(totalAlerts)
                .newAlerts(newAlerts)
                .underReview(underReview)
                .confirmed(confirmed)
                .rejected(rejected)
                .byType(byType)
                .bySeverity(bySeverity)
                .trendLastDays(trendLastDays)
                .build();
    }

    @Override
    public String generateFraudReport(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📄 Génération du rapport de fraude du {} au {}", startDate, endDate);

        List<FraudAlert> alerts = fraudAlertRepository.findAll().stream()
                .filter(a -> a.getCreatedAt().isAfter(startDate) && a.getCreatedAt().isBefore(endDate))
                .collect(Collectors.toList());

        StringBuilder report = new StringBuilder();
        report.append("═══════════════════════════════════════════════════════════════════\n");
        report.append("                  📊 RAPPORT DE DÉTECTION DE FRAUDE               \n");
        report.append("═══════════════════════════════════════════════════════════════════\n\n");

        report.append("📅 Période: ").append(startDate.toLocalDate())
                .append(" → ").append(endDate.toLocalDate()).append("\n\n");

        report.append("📈 RÉSUMÉ GLOBAL:\n");
        report.append("   ├─ Total alertes: ").append(alerts.size()).append("\n");

        long confirmed = alerts.stream()
                .filter(FraudAlert::isConfirmed)
                .count();
        report.append("   ├─ Confirmées: ").append(confirmed).append("\n");

        long rejected = alerts.stream()
                .filter(a -> a.isReviewed() && !a.isConfirmed())
                .count();
        report.append("   └─ Rejetées: ").append(rejected).append("\n\n");

        report.append("⚠️ ALERTES PAR SÉVÉRITÉ:\n");
        report.append("─────────────────────────────────────────────────────────────────\n");
        Arrays.stream(RiskLevel.values()).forEach(level -> {
            long count = alerts.stream()
                    .filter(a -> a.getSeverity() == level)
                    .count();
            report.append("   ├─ ").append(level).append(": ").append(count).append("\n");
        });

        report.append("\n═══════════════════════════════════════════════════════════════════\n");
        report.append("              ℹ️  Rapport généré le ")
                .append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .append("\n");
        report.append("═══════════════════════════════════════════════════════════════════\n");

        return report.toString();
    }

    /**
     * Déterminer le statut d'une alerte
     */
    private String getAlertStatus(FraudAlert alert) {
        if (!alert.isReviewed()) {
            return "NEW";
        } else if (alert.isConfirmed()) {
            return "CONFIRMED";
        } else if (alert.isReviewed() && !alert.isConfirmed()) {
            return "REJECTED";
        }
        return "UNDER_REVIEW";
    }
}