package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.CreditSimulationRepository;
import org.example.stage_atb.Service.ICreditSimulationService;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.CreditSimulation;
import org.example.stage_atb.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CreditSimulationServiceImpl implements ICreditSimulationService {

    private final CreditSimulationRepository creditSimulationRepository;
    private final ClientRepository clientRepository;

    @Override
    public CreditSimulation createSimulationFromCreditRequest(CreditRequest creditRequest, User user) {
        log.info("Creating simulation for credit request: {}", creditRequest.getRequestNumber());

        BigDecimal amount = creditRequest.getAmount();
        BigDecimal interestRate = creditRequest.getInterestRate();
        Integer durationMonths = creditRequest.getDurationMonths();

        // Calculs de base
        BigDecimal monthlyPayment = calculateMonthlyPayment(amount, interestRate, durationMonths);
        BigDecimal totalPayment = monthlyPayment.multiply(BigDecimal.valueOf(durationMonths));
        BigDecimal totalInterest = totalPayment.subtract(amount);

        // Récupérer le revenu mensuel du client
        BigDecimal monthlyIncome = getClientMonthlyIncome(creditRequest.getClient());

        // Indicateurs financiers
        BigDecimal borrowingCapacity = calculateBorrowingCapacity(monthlyIncome);
        BigDecimal debtRatio = calculateDebtRatio(monthlyPayment, monthlyIncome);

        // Score de solvabilité
        int solvencyScore = calculateSolvencyScore(monthlyIncome, monthlyPayment, durationMonths, null, 0);

        // Créer la simulation
        CreditSimulation simulation = CreditSimulation.builder()
                .creditRequest(creditRequest)
                .user(user)
                .client(creditRequest.getClient())
                .amount(amount)
                .durationMonths(durationMonths)
                .interestRate(interestRate)
                .monthlyPayment(monthlyPayment)
                .totalInterest(totalInterest)
                .totalPayment(totalPayment)
                .borrowingCapacity(borrowingCapacity)
                .debtRatio(debtRatio)
                .solvencyScore(solvencyScore)
                .simulationName("Simulation - " + creditRequest.getRequestNumber())
                .simulationResults(buildSimulationResults(amount, monthlyPayment, durationMonths,
                        interestRate, debtRatio, borrowingCapacity, solvencyScore, monthlyIncome))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        CreditSimulation savedSimulation = creditSimulationRepository.save(simulation);
        log.info("Simulation created with id: {}", savedSimulation.getId());

        return savedSimulation;
    }

    @Override
    public CreditSimulation createStandaloneSimulation(BigDecimal amount, Integer durationMonths,
                                                       BigDecimal interestRate, User user, String clientId) {
        log.info("Creating standalone simulation for user: {}", user.getEmail());

        BigDecimal monthlyPayment = calculateMonthlyPayment(amount, interestRate, durationMonths);
        BigDecimal totalPayment = monthlyPayment.multiply(BigDecimal.valueOf(durationMonths));
        BigDecimal totalInterest = totalPayment.subtract(amount);

        Client client = null;
        BigDecimal monthlyIncome = BigDecimal.ZERO;
        if (clientId != null) {
            client = clientRepository.findById(clientId).orElse(null);
            if (client != null) {
                monthlyIncome = getClientMonthlyIncome(client);
            }
        }

        BigDecimal borrowingCapacity = calculateBorrowingCapacity(monthlyIncome);
        BigDecimal debtRatio = calculateDebtRatio(monthlyPayment, monthlyIncome);
        int solvencyScore = calculateSolvencyScore(monthlyIncome, monthlyPayment, durationMonths, null, 0);

        CreditSimulation simulation = CreditSimulation.builder()
                .creditRequest(null)
                .user(user)
                .client(client)
                .amount(amount)
                .durationMonths(durationMonths)
                .interestRate(interestRate)
                .monthlyPayment(monthlyPayment)
                .totalInterest(totalInterest)
                .totalPayment(totalPayment)
                .borrowingCapacity(borrowingCapacity)
                .debtRatio(debtRatio)
                .solvencyScore(solvencyScore)
                .simulationName("Simulation personnalisée - " + LocalDateTime.now().toString())
                .simulationResults(buildSimulationResults(amount, monthlyPayment, durationMonths,
                        interestRate, debtRatio, borrowingCapacity, solvencyScore, monthlyIncome))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return creditSimulationRepository.save(simulation);
    }

    @Override
    public BigDecimal calculateMonthlyPayment(BigDecimal amount, BigDecimal interestRate, Integer durationMonths) {
        if (amount == null || interestRate == null || durationMonths == null || durationMonths == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal monthlyRate = interestRate.divide(new BigDecimal("1200"), 10, RoundingMode.HALF_UP);

        // Utilisation de Math.pow pour plus d'efficacité
        double power = Math.pow(1 + monthlyRate.doubleValue(), durationMonths);
        double numerator = amount.doubleValue() * monthlyRate.doubleValue() * power;
        double denominator = power - 1;

        if (denominator == 0) {
            return amount.divide(BigDecimal.valueOf(durationMonths), 2, RoundingMode.HALF_UP);
        }

        return BigDecimal.valueOf(numerator / denominator)
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateDebtRatio(BigDecimal monthlyPayment, BigDecimal monthlyIncome) {
        if (monthlyIncome == null || monthlyIncome.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return monthlyPayment.divide(monthlyIncome, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateBorrowingCapacity(BigDecimal monthlyIncome) {
        if (monthlyIncome == null || monthlyIncome.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        // Règle des 33% d'endettement maximum
        return monthlyIncome.multiply(new BigDecimal("0.33"))
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public Optional<CreditSimulation> getSimulationByCreditRequestId(String creditRequestId) {
        return creditSimulationRepository.findByCreditRequestId(creditRequestId);
    }

    @Override
    public CreditSimulation getSimulationById(String id) {
        return creditSimulationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Simulation not found with id: " + id));
    }

    @Override
    public List<CreditSimulation> getSimulationsByUser(String userId) {
        return creditSimulationRepository.findByUserId(userId);
    }

    @Override
    public List<CreditSimulation> getSimulationsByClient(String clientId) {
        return creditSimulationRepository.findByClientId(clientId);
    }

    @Override
    public List<CreditSimulation> getLatestSimulationsByUser(String userId, int limit) {
        return creditSimulationRepository.findLatestByUserId(userId)
                .stream()
                .limit(limit)
                .toList();
    }

    @Override
    public CreditSimulation updateSimulation(String id, BigDecimal amount, Integer durationMonths, BigDecimal interestRate) {
        CreditSimulation simulation = getSimulationById(id);

        simulation.setAmount(amount);
        simulation.setDurationMonths(durationMonths);
        simulation.setInterestRate(interestRate);

        // Recalculer les valeurs
        BigDecimal monthlyPayment = calculateMonthlyPayment(amount, interestRate, durationMonths);
        BigDecimal totalPayment = monthlyPayment.multiply(BigDecimal.valueOf(durationMonths));
        BigDecimal totalInterest = totalPayment.subtract(amount);

        simulation.setMonthlyPayment(monthlyPayment);
        simulation.setTotalPayment(totalPayment);
        simulation.setTotalInterest(totalInterest);

        // Recalculer les indicateurs
        BigDecimal monthlyIncome = getClientMonthlyIncome(simulation.getClient());
        simulation.setDebtRatio(calculateDebtRatio(monthlyPayment, monthlyIncome));
        simulation.setBorrowingCapacity(calculateBorrowingCapacity(monthlyIncome));
        simulation.setSolvencyScore(calculateSolvencyScore(monthlyIncome, monthlyPayment, durationMonths, null, 0));

        simulation.setUpdatedAt(LocalDateTime.now());

        return creditSimulationRepository.save(simulation);
    }

    @Override
    public void deleteSimulation(String id) {
        if (!creditSimulationRepository.existsById(id)) {
            throw new RuntimeException("Simulation not found with id: " + id);
        }
        creditSimulationRepository.deleteById(id);
        log.info("Simulation deleted with id: {}", id);
    }

    @Override
    public String compareSimulations(List<CreditSimulation> simulations) {
        if (simulations == null || simulations.size() < 2) {
            return "❌ Veuillez sélectionner au moins 2 simulations à comparer.";
        }

        StringBuilder comparison = new StringBuilder();
        comparison.append("╔══════════════════════════════════════════════════════════════════╗\n");
        comparison.append("║              📊 COMPARAISON DES SIMULATIONS                       ║\n");
        comparison.append("╚══════════════════════════════════════════════════════════════════╝\n\n");

        for (int i = 0; i < simulations.size(); i++) {
            CreditSimulation sim = simulations.get(i);
            comparison.append("📋 Simulation ").append(i + 1);
            if (sim.getSimulationName() != null) {
                comparison.append(" - ").append(sim.getSimulationName());
            }
            comparison.append("\n");
            comparison.append("  ├─ Montant: ").append(formatCurrency(sim.getAmount())).append("\n");
            comparison.append("  ├─ Durée: ").append(sim.getDurationMonths()).append(" mois\n");
            comparison.append("  ├─ Taux: ").append(sim.getInterestRate()).append("%\n");
            comparison.append("  ├─ Mensualité: ").append(formatCurrency(sim.getMonthlyPayment())).append("\n");
            comparison.append("  ├─ Total intérêts: ").append(formatCurrency(sim.getTotalInterest())).append("\n");
            comparison.append("  └─ Total à payer: ").append(formatCurrency(sim.getTotalPayment())).append("\n\n");
        }

        // Trouver la meilleure offre
        CreditSimulation best = simulations.stream()
                .min(Comparator.comparing(CreditSimulation::getTotalPayment))
                .orElse(null);

        if (best != null) {
            int bestIndex = simulations.indexOf(best);
            comparison.append("🏆 MEILLEURE OFFRE: Simulation ").append(bestIndex + 1);
            if (best.getSimulationName() != null) {
                comparison.append(" (").append(best.getSimulationName()).append(")");
            }
            comparison.append("\n");
            comparison.append("   ✅ Total le plus bas: ").append(formatCurrency(best.getTotalPayment())).append("\n");
            comparison.append("   ✅ Mensualité la plus basse: ").append(formatCurrency(best.getMonthlyPayment())).append("\n");

            // Économie réalisée
            CreditSimulation worst = simulations.stream()
                    .max(Comparator.comparing(CreditSimulation::getTotalPayment))
                    .orElse(null);
            if (worst != null && !worst.equals(best)) {
                BigDecimal savings = worst.getTotalPayment().subtract(best.getTotalPayment());
                comparison.append("   💰 Économie: ").append(formatCurrency(savings)).append("\n");
            }
        }

        return comparison.toString();
    }

    @Override
    public String generateSimulationSummary(CreditSimulation simulation) {
        if (simulation == null) {
            return "❌ Aucune simulation à résumer.";
        }

        StringBuilder summary = new StringBuilder();
        summary.append("╔══════════════════════════════════════════════════════════════════╗\n");
        summary.append("║                   📈 RÉSUMÉ DE LA SIMULATION                     ║\n");
        summary.append("╚══════════════════════════════════════════════════════════════════╝\n\n");

        summary.append("🔹 INFORMATIONS GÉNÉRALES:\n");
        summary.append("   📌 Simulation: ").append(simulation.getSimulationName()).append("\n");
        summary.append("   📅 Créée le: ").append(simulation.getCreatedAt()).append("\n");
        if (simulation.getCreditRequest() != null) {
            summary.append("   🔗 Liée à la demande: ").append(simulation.getCreditRequest().getRequestNumber()).append("\n");
        }
        summary.append("\n");

        summary.append("🔹 DÉTAILS DU CRÉDIT:\n");
        summary.append("   💰 Montant: ").append(formatCurrency(simulation.getAmount())).append("\n");
        summary.append("   📆 Durée: ").append(simulation.getDurationMonths()).append(" mois\n");
        summary.append("   📊 Taux: ").append(simulation.getInterestRate()).append("%\n");
        summary.append("   💳 Mensualité: ").append(formatCurrency(simulation.getMonthlyPayment())).append("\n");
        summary.append("   💰 Total intérêts: ").append(formatCurrency(simulation.getTotalInterest())).append("\n");
        summary.append("   💰 Total à payer: ").append(formatCurrency(simulation.getTotalPayment())).append("\n");
        summary.append("\n");

        summary.append("🔹 INDICATEURS FINANCIERS:\n");
        if (simulation.getDebtRatio() != null && simulation.getDebtRatio().compareTo(BigDecimal.ZERO) > 0) {
            summary.append("   📊 Taux d'endettement: ").append(simulation.getDebtRatio()).append("%");
            if (simulation.getDebtRatio().compareTo(new BigDecimal("35")) <= 0) {
                summary.append(" ✅ Excellent");
            } else if (simulation.getDebtRatio().compareTo(new BigDecimal("45")) <= 0) {
                summary.append(" ⚠️ Acceptable");
            } else {
                summary.append(" ❌ Élevé");
            }
            summary.append("\n");
        }
        if (simulation.getBorrowingCapacity() != null && simulation.getBorrowingCapacity().compareTo(BigDecimal.ZERO) > 0) {
            summary.append("   💰 Capacité d'emprunt: ").append(formatCurrency(simulation.getBorrowingCapacity())).append("\n");
        }
        if (simulation.getSolvencyScore() != null) {
            summary.append("   🎯 Score de solvabilité: ").append(simulation.getSolvencyScore()).append("/100");
            if (simulation.getSolvencyScore() >= 80) {
                summary.append(" ✅ Bon");
            } else if (simulation.getSolvencyScore() >= 60) {
                summary.append(" ⚠️ Moyen");
            } else {
                summary.append(" ❌ Faible");
            }
            summary.append("\n");
        }
        summary.append("\n");

        summary.append("🔹 RECOMMANDATION:\n");
        summary.append(getRecommendation(simulation)).append("\n");

        return summary.toString();
    }

    @Override
    public int calculateSolvencyScore(BigDecimal monthlyIncome, BigDecimal monthlyPayment,
                                      Integer durationMonths, String employmentContract, Integer yearsOfExperience) {
        int score = 0;

        // 1. Revenus (max 25 points)
        if (monthlyIncome != null) {
            if (monthlyIncome.compareTo(new BigDecimal("5000")) >= 0) score += 25;
            else if (monthlyIncome.compareTo(new BigDecimal("3000")) >= 0) score += 20;
            else if (monthlyIncome.compareTo(new BigDecimal("2000")) >= 0) score += 15;
            else if (monthlyIncome.compareTo(new BigDecimal("1000")) >= 0) score += 10;
            else score += 5;
        }

        // 2. Taux d'endettement (max 20 points)
        if (monthlyPayment != null && monthlyIncome != null && monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal debtRatio = calculateDebtRatio(monthlyPayment, monthlyIncome);
            if (debtRatio.compareTo(new BigDecimal("35")) <= 0) score += 20;
            else if (debtRatio.compareTo(new BigDecimal("45")) <= 0) score += 12;
            else if (debtRatio.compareTo(new BigDecimal("55")) <= 0) score += 6;
            else score += 2;
        }

        // 3. Durée du crédit (max 15 points)
        if (durationMonths != null) {
            if (durationMonths <= 36) score += 15;
            else if (durationMonths <= 60) score += 10;
            else if (durationMonths <= 84) score += 5;
            else score += 2;
        }

        // 4. Type de contrat (max 20 points)
        if (employmentContract != null) {
            if ("CDI".equals(employmentContract) || "Fonctionnaire".equals(employmentContract)) {
                score += 20;
            } else if ("CDD".equals(employmentContract)) {
                score += 12;
            } else if ("Freelance".equals(employmentContract)) {
                score += 10;
            } else {
                score += 5;
            }
        }

        // 5. Ancienneté (max 20 points)
        if (yearsOfExperience != null) {
            if (yearsOfExperience >= 10) score += 20;
            else if (yearsOfExperience >= 5) score += 15;
            else if (yearsOfExperience >= 2) score += 10;
            else score += 5;
        }

        return Math.min(score, 100);
    }

    // ============ MÉTHODES PRIVÉES ============

    private BigDecimal getClientMonthlyIncome(Client client) {
        if (client == null || client.getMonthlyIncome() == null) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(client.getMonthlyIncome());
        } catch (NumberFormatException e) {
            log.warn("Invalid monthly income format: {}", client.getMonthlyIncome());
            return BigDecimal.ZERO;
        }
    }

    private String buildSimulationResults(BigDecimal amount, BigDecimal monthlyPayment,
                                          Integer durationMonths, BigDecimal interestRate,
                                          BigDecimal debtRatio, BigDecimal borrowingCapacity,
                                          int solvencyScore, BigDecimal monthlyIncome) {
        StringBuilder results = new StringBuilder();
        results.append("═══════════════════════════════════════════════════════════════════\n");
        results.append("                     📊 RÉSULTATS DE LA SIMULATION                  \n");
        results.append("═══════════════════════════════════════════════════════════════════\n\n");

        results.append("🔹 INFORMATIONS DU CRÉDIT:\n");
        results.append("   ├─ Montant: ").append(formatCurrency(amount)).append("\n");
        results.append("   ├─ Durée: ").append(durationMonths).append(" mois\n");
        results.append("   ├─ Taux d'intérêt: ").append(interestRate).append("%\n");
        results.append("   └─ Mensualité: ").append(formatCurrency(monthlyPayment)).append("\n\n");

        results.append("🔹 INDICATEURS FINANCIERS:\n");
        if (monthlyIncome != null && monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            results.append("   ├─ Revenus mensuels: ").append(formatCurrency(monthlyIncome)).append("\n");
            results.append("   ├─ Taux d'endettement: ").append(debtRatio).append("%");
            if (debtRatio.compareTo(new BigDecimal("35")) <= 0) {
                results.append(" ✅ Excellent");
            } else if (debtRatio.compareTo(new BigDecimal("45")) <= 0) {
                results.append(" ⚠️ Acceptable");
            } else {
                results.append(" ❌ Élevé");
            }
            results.append("\n");
            results.append("   └─ Capacité d'emprunt: ").append(formatCurrency(borrowingCapacity)).append("\n\n");
        }

        results.append("🔹 SCORE DE SOLVABILITÉ:\n");
        results.append("   ├─ Score: ").append(solvencyScore).append("/100");
        if (solvencyScore >= 80) {
            results.append(" ✅ Bon");
        } else if (solvencyScore >= 60) {
            results.append(" ⚠️ Moyen");
        } else {
            results.append(" ❌ Faible");
        }
        results.append("\n");
        results.append("   └─ Niveau: ");
        if (solvencyScore >= 80) {
            results.append("🟢 Risque faible");
        } else if (solvencyScore >= 60) {
            results.append("🟡 Risque modéré");
        } else {
            results.append("🔴 Risque élevé");
        }
        results.append("\n\n");

        results.append("🔹 RECOMMANDATION:\n");
        if (solvencyScore >= 80 && debtRatio.compareTo(new BigDecimal("45")) <= 0) {
            results.append("   ✅ Crédit recommandé\n");
            results.append("   📝 Profil solide, conditions favorables.\n");
        } else if (solvencyScore >= 60 && debtRatio.compareTo(new BigDecimal("55")) <= 0) {
            results.append("   ⚠️ Crédit recommandé sous conditions\n");
            results.append("   📝 Profil acceptable, revoir certains paramètres.\n");
        } else {
            results.append("   ❌ Crédit non recommandé\n");
            results.append("   📝 Profil risqué, améliorer les indicateurs financiers.\n");
        }
        results.append("\n");

        results.append("═══════════════════════════════════════════════════════════════════\n");
        results.append("              ℹ️  Simulation réalisée le ")
                .append(LocalDateTime.now()).append("\n");
        results.append("═══════════════════════════════════════════════════════════════════\n");

        return results.toString();
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0,00 TND";
        return amount.setScale(2, RoundingMode.HALF_UP).toString().replace(".", ",") + " TND";
    }

    private String getRecommendation(CreditSimulation simulation) {
        StringBuilder recommendation = new StringBuilder();

        BigDecimal debtRatio = simulation.getDebtRatio();
        Integer solvencyScore = simulation.getSolvencyScore();

        if (debtRatio != null && solvencyScore != null) {
            if (debtRatio.compareTo(new BigDecimal("35")) <= 0 && solvencyScore >= 80) {
                recommendation.append("✅ EXCELLENTE SITUATION\n");
                recommendation.append("   Votre profil est idéal pour un crédit. Tous les indicateurs sont verts.\n");
                recommendation.append("   💡 Conseil: N'hésitez pas à demander un montant plus élevé si nécessaire.");
            } else if (debtRatio.compareTo(new BigDecimal("45")) <= 0 && solvencyScore >= 60) {
                recommendation.append("⚡ BONNE SITUATION\n");
                recommendation.append("   Votre profil est correct. Quelques points peuvent être améliorés.\n");
                recommendation.append("   💡 Conseil: Réduisez vos charges ou augmentez vos revenus pour de meilleures conditions.");
            } else if (debtRatio.compareTo(new BigDecimal("55")) <= 0 && solvencyScore >= 40) {
                recommendation.append("⚠️ SITUATION MODÉRÉE\n");
                recommendation.append("   Votre profil présente des risques modérés.\n");
                recommendation.append("   💡 Conseil: Envisagez de réduire le montant ou d'augmenter la durée.");
            } else {
                recommendation.append("❌ SITUATION DIFFICILE\n");
                recommendation.append("   Votre profil présente des risques importants.\n");
                recommendation.append("   💡 Conseil: Améliorez votre situation financière avant de faire une demande.");
            }
        } else {
            recommendation.append("ℹ️ Informations insuffisantes pour une recommandation.");
        }

        return recommendation.toString();
    }

    // ============================================================
    // 📝 NOUVELLES MÉTHODES UPDATE
    // ============================================================

    @Override
    @Transactional
    public CreditSimulation updateSimulationAmount(String id, BigDecimal newAmount) {
        log.info("Updating amount for simulation: {} to {}", id, newAmount);

        CreditSimulation simulation = getSimulationById(id);
        simulation.setAmount(newAmount);

        // Recalculer avec le nouveau montant
        recalculateSimulation(simulation);
        simulation.setUpdatedAt(LocalDateTime.now());

        return creditSimulationRepository.save(simulation);
    }

    @Override
    @Transactional
    public CreditSimulation updateSimulationDuration(String id, Integer newDurationMonths) {
        log.info("Updating duration for simulation: {} to {} months", id, newDurationMonths);

        CreditSimulation simulation = getSimulationById(id);
        simulation.setDurationMonths(newDurationMonths);

        // Recalculer avec la nouvelle durée
        recalculateSimulation(simulation);
        simulation.setUpdatedAt(LocalDateTime.now());

        return creditSimulationRepository.save(simulation);
    }

    @Override
    @Transactional
    public CreditSimulation updateSimulationInterestRate(String id, BigDecimal newInterestRate) {
        log.info("Updating interest rate for simulation: {} to {}%", id, newInterestRate);

        CreditSimulation simulation = getSimulationById(id);
        simulation.setInterestRate(newInterestRate);

        // Recalculer avec le nouveau taux
        recalculateSimulation(simulation);
        simulation.setUpdatedAt(LocalDateTime.now());

        return creditSimulationRepository.save(simulation);
    }

    @Override
    @Transactional
    public CreditSimulation updateSimulationName(String id, String newName) {
        log.info("Updating name for simulation: {} to {}", id, newName);

        CreditSimulation simulation = getSimulationById(id);
        simulation.setSimulationName(newName);
        simulation.setUpdatedAt(LocalDateTime.now());

        return creditSimulationRepository.save(simulation);
    }

    @Override
    @Transactional
    public int batchUpdateSimulations(List<String> ids, BigDecimal newInterestRate) {
        log.info("Batch updating {} simulations with interest rate: {}%", ids.size(), newInterestRate);

        int updatedCount = 0;
        for (String id : ids) {
            try {
                updateSimulationInterestRate(id, newInterestRate);
                updatedCount++;
            } catch (Exception e) {
                log.error("Failed to update simulation {}: {}", id, e.getMessage());
            }
        }

        return updatedCount;
    }

    // ============================================================
    // 🗑️ NOUVELLES MÉTHODES DELETE
    // ============================================================

    @Override
    @Transactional
    public int deleteSimulationsByUser(String userId) {
        log.info("Deleting all simulations for user: {}", userId);
        int deletedCount = creditSimulationRepository.deleteByUserId(userId);
        log.info("Deleted {} simulations for user: {}", deletedCount, userId);
        return deletedCount;
    }

    @Override
    @Transactional
    public int deleteSimulationsByClient(String clientId) {
        log.info("Deleting all simulations for client: {}", clientId);
        int deletedCount = creditSimulationRepository.deleteByClientId(clientId);
        log.info("Deleted {} simulations for client: {}", deletedCount, clientId);
        return deletedCount;
    }

    @Override
    @Transactional
    public int deleteSimulationsOlderThan(LocalDateTime date) {
        log.info("Deleting simulations older than: {}", date);
        int deletedCount = creditSimulationRepository.deleteOlderThan(date);
        log.info("Deleted {} simulations older than: {}", deletedCount, date);
        return deletedCount;
    }

    @Override
    @Transactional
    public int deleteSimulationByCreditRequestId(String creditRequestId) {
        log.info("Deleting simulation for credit request: {}", creditRequestId);
        int deletedCount = creditSimulationRepository.deleteByCreditRequestId(creditRequestId);
        log.info("Deleted {} simulation for credit request: {}", deletedCount, creditRequestId);
        return deletedCount;
    }

    @Override
    @Transactional
    public void deleteAllSimulations() {
        log.warn("Deleting ALL simulations!");
        creditSimulationRepository.deleteAll();
        log.info("All simulations deleted");
    }

    // ============================================================
    // 🔧 MÉTHODE PRIVÉE DE RECALCUL
    // ============================================================

    /**
     * Recalculer tous les indicateurs d'une simulation
     */
    private void recalculateSimulation(CreditSimulation simulation) {
        BigDecimal amount = simulation.getAmount();
        BigDecimal interestRate = simulation.getInterestRate();
        Integer durationMonths = simulation.getDurationMonths();

        // Calculer la mensualité
        BigDecimal monthlyPayment = calculateMonthlyPayment(amount, interestRate, durationMonths);
        BigDecimal totalPayment = monthlyPayment.multiply(BigDecimal.valueOf(durationMonths));
        BigDecimal totalInterest = totalPayment.subtract(amount);

        // Récupérer le revenu mensuel
        BigDecimal monthlyIncome = getClientMonthlyIncome(simulation.getClient());

        // Calculer les indicateurs financiers
        BigDecimal debtRatio = calculateDebtRatio(monthlyPayment, monthlyIncome);
        BigDecimal borrowingCapacity = calculateBorrowingCapacity(monthlyIncome);

        // Calculer le score de solvabilité
        int solvencyScore = calculateSolvencyScore(monthlyIncome, monthlyPayment, durationMonths, null, 0);

        // Mettre à jour les valeurs
        simulation.setMonthlyPayment(monthlyPayment);
        simulation.setTotalPayment(totalPayment);
        simulation.setTotalInterest(totalInterest);
        simulation.setDebtRatio(debtRatio);
        simulation.setBorrowingCapacity(borrowingCapacity);
        simulation.setSolvencyScore(solvencyScore);

        // Mettre à jour les résultats de la simulation
        simulation.setSimulationResults(buildSimulationResults(
                amount, monthlyPayment, durationMonths, interestRate,
                debtRatio, borrowingCapacity, solvencyScore, monthlyIncome
        ));
    }

}