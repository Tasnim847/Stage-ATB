package org.example.stage_atb.Service;

import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.CreditSimulation;
import org.example.stage_atb.entity.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ICreditSimulationService {

    // ============ MÉTHODES EXISTANTES ============

    CreditSimulation createSimulationFromCreditRequest(CreditRequest creditRequest, User user);

    CreditSimulation createStandaloneSimulation(BigDecimal amount, Integer durationMonths,
                                                BigDecimal interestRate, User user, String clientId);

    BigDecimal calculateMonthlyPayment(BigDecimal amount, BigDecimal interestRate, Integer durationMonths);

    BigDecimal calculateDebtRatio(BigDecimal monthlyPayment, BigDecimal monthlyIncome);

    BigDecimal calculateBorrowingCapacity(BigDecimal monthlyIncome);

    Optional<CreditSimulation> getSimulationByCreditRequestId(String creditRequestId);

    CreditSimulation getSimulationById(String id);

    List<CreditSimulation> getSimulationsByUser(String userId);

    List<CreditSimulation> getSimulationsByClient(String clientId);

    List<CreditSimulation> getLatestSimulationsByUser(String userId, int limit);

    CreditSimulation updateSimulation(String id, BigDecimal amount, Integer durationMonths, BigDecimal interestRate);

    void deleteSimulation(String id);

    String compareSimulations(List<CreditSimulation> simulations);

    String generateSimulationSummary(CreditSimulation simulation);

    int calculateSolvencyScore(BigDecimal monthlyIncome, BigDecimal monthlyPayment,
                               Integer durationMonths, String employmentContract, Integer yearsOfExperience);

    // ============ 📝 NOUVELLES MÉTHODES À AJOUTER ============

    /**
     * Mettre à jour uniquement le montant
     */
    CreditSimulation updateSimulationAmount(String id, BigDecimal newAmount);

    /**
     * Mettre à jour uniquement la durée
     */
    CreditSimulation updateSimulationDuration(String id, Integer newDurationMonths);

    /**
     * Mettre à jour uniquement le taux d'intérêt
     */
    CreditSimulation updateSimulationInterestRate(String id, BigDecimal newInterestRate);

    /**
     * Mettre à jour le nom d'une simulation
     */
    CreditSimulation updateSimulationName(String id, String newName);

    /**
     * Mettre à jour plusieurs simulations en lot
     */
    int batchUpdateSimulations(List<String> ids, BigDecimal newInterestRate);

    /**
     * Supprimer toutes les simulations d'un utilisateur
     */
    int deleteSimulationsByUser(String userId);

    /**
     * Supprimer toutes les simulations d'un client
     */
    int deleteSimulationsByClient(String clientId);

    /**
     * Supprimer les simulations plus anciennes qu'une date
     */
    int deleteSimulationsOlderThan(LocalDateTime date);

    /**
     * Supprimer une simulation par ID de demande de crédit
     */
    int deleteSimulationByCreditRequestId(String creditRequestId);

    /**
     * Supprimer toutes les simulations (⚠️ Admin uniquement)
     */
    void deleteAllSimulations();
}