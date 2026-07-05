package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Service.ICreditSimulationService;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.CreditSimulation;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.Repositories.CreditSimulationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CreditSimulationServiceImpl implements ICreditSimulationService {

    private final CreditSimulationRepository creditSimulationRepository;

    @Override
    public CreditSimulation createSimulationFromCreditRequest(CreditRequest creditRequest, User user) {
        log.info("Creating simulation for credit request: {}", creditRequest.getRequestNumber());

        // Récupérer les données
        BigDecimal amount = creditRequest.getAmount();
        BigDecimal interestRate = creditRequest.getInterestRate();
        Integer durationMonths = creditRequest.getDurationMonths();

        // Calculer la mensualité
        BigDecimal monthlyPayment = calculateMonthlyPayment(amount, interestRate, durationMonths);

        // Calculer le total des intérêts et le total à payer
        BigDecimal totalPayment = monthlyPayment.multiply(BigDecimal.valueOf(durationMonths));
        BigDecimal totalInterest = totalPayment.subtract(amount);

        // Récupérer le revenu mensuel (si disponible)
        BigDecimal monthlyIncome = BigDecimal.ZERO;
        if (creditRequest.getClient() != null && creditRequest.getClient().getMonthlyIncome() != null) {
            try {
                monthlyIncome = new BigDecimal(creditRequest.getClient().getMonthlyIncome());
            } catch (NumberFormatException e) {
                log.warn("Invalid monthly income format: {}", creditRequest.getClient().getMonthlyIncome());
            }
        }

        // Calculer la capacité d'emprunt
        BigDecimal borrowingCapacity = calculateBorrowingCapacity(monthlyIncome);

        // Calculer le taux d'endettement
        BigDecimal debtRatio = calculateDebtRatio(monthlyPayment, monthlyIncome);

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
                .simulationName("Simulation - " + creditRequest.getRequestNumber())
                .simulationResults(buildSimulationResults(amount, monthlyPayment, durationMonths,
                        interestRate, debtRatio, borrowingCapacity))
                .createdAt(LocalDateTime.now())
                .build();

        CreditSimulation savedSimulation = creditSimulationRepository.save(simulation);
        log.info("Simulation created with id: {}", savedSimulation.getId());

        return savedSimulation;
    }

    @Override
    public BigDecimal calculateMonthlyPayment(BigDecimal amount, BigDecimal interestRate, Integer durationMonths) {
        if (amount == null || interestRate == null || durationMonths == null || durationMonths == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal monthlyRate = interestRate.divide(new BigDecimal("1200"), 10, RoundingMode.HALF_UP);
        BigDecimal power = BigDecimal.ONE;
        for (int i = 0; i < durationMonths; i++) {
            power = power.multiply(monthlyRate.add(BigDecimal.ONE));
        }

        BigDecimal numerator = amount.multiply(monthlyRate).multiply(power);
        BigDecimal denominator = power.subtract(BigDecimal.ONE);

        if (denominator.compareTo(BigDecimal.ZERO) == 0) {
            return amount.divide(BigDecimal.valueOf(durationMonths), 2, RoundingMode.HALF_UP);
        }

        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateDebtRatio(BigDecimal monthlyPayment, BigDecimal monthlyIncome) {
        if (monthlyIncome == null || monthlyIncome.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return monthlyPayment.divide(monthlyIncome, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }

    @Override
    public BigDecimal calculateBorrowingCapacity(BigDecimal monthlyIncome) {
        if (monthlyIncome == null || monthlyIncome.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        // Règle des 33% d'endettement maximum
        return monthlyIncome.multiply(new BigDecimal("0.33"));
    }

    private String buildSimulationResults(BigDecimal amount, BigDecimal monthlyPayment,
                                          Integer durationMonths, BigDecimal interestRate,
                                          BigDecimal debtRatio, BigDecimal borrowingCapacity) {
        StringBuilder results = new StringBuilder();
        results.append("=== RÉSULTATS DE LA SIMULATION ===\n\n");
        results.append("📊 Informations du crédit:\n");
        results.append("  - Montant: ").append(amount).append(" TND\n");
        results.append("  - Durée: ").append(durationMonths).append(" mois\n");
        results.append("  - Taux d'intérêt: ").append(interestRate).append("%\n");
        results.append("  - Mensualité: ").append(monthlyPayment).append(" TND\n\n");
        results.append("📈 Indicateurs financiers:\n");
        results.append("  - Taux d'endettement: ").append(debtRatio).append("%\n");
        results.append("  - Capacité d'emprunt: ").append(borrowingCapacity).append(" TND\n\n");

        // Interprétation
        results.append("📝 Interprétation:\n");
        if (debtRatio.compareTo(new BigDecimal("35")) < 0) {
            results.append("  ✅ Taux d'endettement très bon (< 35%)\n");
        } else if (debtRatio.compareTo(new BigDecimal("45")) < 0) {
            results.append("  ⚠️ Taux d'endettement acceptable (35-45%)\n");
        } else {
            results.append("  ❌ Taux d'endettement élevé (> 45%)\n");
        }

        if (borrowingCapacity.compareTo(BigDecimal.ZERO) > 0) {
            results.append("  💰 Capacité d'emprunt: ").append(borrowingCapacity).append(" TND\n");
        }

        return results.toString();
    }

    @Override
    public Optional<CreditSimulation> getSimulationByCreditRequestId(String creditRequestId) {
        return creditSimulationRepository.findByCreditRequestId(creditRequestId);
    }
}