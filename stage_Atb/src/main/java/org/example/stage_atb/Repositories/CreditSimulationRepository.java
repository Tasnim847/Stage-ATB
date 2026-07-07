package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.CreditSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CreditSimulationRepository extends JpaRepository<CreditSimulation, String> {

    // ============ REQUÊTES EXISTANTES ============

    List<CreditSimulation> findByUserId(String userId);

    List<CreditSimulation> findByClientId(String clientId);

    @Query("SELECT cs FROM CreditSimulation cs WHERE cs.creditRequest.id = :creditRequestId")
    Optional<CreditSimulation> findByCreditRequestId(@Param("creditRequestId") String creditRequestId);

    @Query("SELECT cs FROM CreditSimulation cs WHERE cs.user.id = :userId ORDER BY cs.createdAt DESC")
    List<CreditSimulation> findLatestByUserId(@Param("userId") String userId);

    // ============ NOUVELLES REQUÊTES POUR UPDATE ============

    /**
     * Mettre à jour le montant d'une simulation
     */
    @Modifying
    @Query("UPDATE CreditSimulation cs SET cs.amount = :amount, cs.updatedAt = :updatedAt WHERE cs.id = :id")
    int updateAmount(@Param("id") String id,
                     @Param("amount") BigDecimal amount,
                     @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * Mettre à jour la durée d'une simulation
     */
    @Modifying
    @Query("UPDATE CreditSimulation cs SET cs.durationMonths = :durationMonths, cs.updatedAt = :updatedAt WHERE cs.id = :id")
    int updateDurationMonths(@Param("id") String id,
                             @Param("durationMonths") Integer durationMonths,
                             @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * Mettre à jour le taux d'intérêt d'une simulation
     */
    @Modifying
    @Query("UPDATE CreditSimulation cs SET cs.interestRate = :interestRate, cs.updatedAt = :updatedAt WHERE cs.id = :id")
    int updateInterestRate(@Param("id") String id,
                           @Param("interestRate") BigDecimal interestRate,
                           @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * Mettre à jour la mensualité d'une simulation
     */
    @Modifying
    @Query("UPDATE CreditSimulation cs SET cs.monthlyPayment = :monthlyPayment, cs.updatedAt = :updatedAt WHERE cs.id = :id")
    int updateMonthlyPayment(@Param("id") String id,
                             @Param("monthlyPayment") BigDecimal monthlyPayment,
                             @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * Mettre à jour tous les calculs financiers d'une simulation
     */
    @Modifying
    @Query("UPDATE CreditSimulation cs SET " +
            "cs.monthlyPayment = :monthlyPayment, " +
            "cs.totalInterest = :totalInterest, " +
            "cs.totalPayment = :totalPayment, " +
            "cs.borrowingCapacity = :borrowingCapacity, " +
            "cs.debtRatio = :debtRatio, " +
            "cs.solvencyScore = :solvencyScore, " +
            "cs.simulationResults = :simulationResults, " +
            "cs.updatedAt = :updatedAt " +
            "WHERE cs.id = :id")
    int updateFinancialCalculations(@Param("id") String id,
                                    @Param("monthlyPayment") BigDecimal monthlyPayment,
                                    @Param("totalInterest") BigDecimal totalInterest,
                                    @Param("totalPayment") BigDecimal totalPayment,
                                    @Param("borrowingCapacity") BigDecimal borrowingCapacity,
                                    @Param("debtRatio") BigDecimal debtRatio,
                                    @Param("solvencyScore") Integer solvencyScore,
                                    @Param("simulationResults") String simulationResults,
                                    @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * Mettre à jour le nom d'une simulation
     */
    @Modifying
    @Query("UPDATE CreditSimulation cs SET cs.simulationName = :name, cs.updatedAt = :updatedAt WHERE cs.id = :id")
    int updateSimulationName(@Param("id") String id,
                             @Param("name") String name,
                             @Param("updatedAt") LocalDateTime updatedAt);

    // ============ REQUÊTES POUR DELETE ============

    /**
     * Supprimer toutes les simulations d'un utilisateur
     */
    @Modifying
    @Query("DELETE FROM CreditSimulation cs WHERE cs.user.id = :userId")
    int deleteByUserId(@Param("userId") String userId);

    /**
     * Supprimer toutes les simulations d'un client
     */
    @Modifying
    @Query("DELETE FROM CreditSimulation cs WHERE cs.client.id = :clientId")
    int deleteByClientId(@Param("clientId") String clientId);

    /**
     * Supprimer les simulations plus anciennes qu'une date
     */
    @Modifying
    @Query("DELETE FROM CreditSimulation cs WHERE cs.createdAt < :date")
    int deleteOlderThan(@Param("date") LocalDateTime date);

    /**
     * Supprimer une simulation par ID de demande de crédit
     */
    @Modifying
    @Query("DELETE FROM CreditSimulation cs WHERE cs.creditRequest.id = :creditRequestId")
    int deleteByCreditRequestId(@Param("creditRequestId") String creditRequestId);

    // ============ REQUÊTES DE COMPTAGE ============

    /**
     * Compter les simulations d'un utilisateur
     */
    long countByUserId(String userId);

    /**
     * Compter les simulations d'un client
     */
    long countByClientId(String clientId);

    /**
     * Vérifier si une simulation existe pour une demande de crédit
     */
    boolean existsByCreditRequestId(String creditRequestId);
}