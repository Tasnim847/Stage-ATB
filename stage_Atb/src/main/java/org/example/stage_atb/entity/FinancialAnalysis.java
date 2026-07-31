// FinancialAnalysis.java - CORRIGÉ
package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_analyses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // ✅ CHANGER EN @OneToOne pour être cohérent avec CreditRequest
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_request_id", nullable = false)
    private CreditRequest creditRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analyst_id")
    private User analyst;

    // Revenus
    private BigDecimal monthlyNetIncome;
    private BigDecimal otherMonthlyIncome;
    private BigDecimal totalMonthlyIncome;
    private BigDecimal annualIncome;

    // Charges
    private BigDecimal monthlyCharges;
    private BigDecimal existingCreditPayments;
    private BigDecimal newMonthlyPayment;

    // Ratios - Particulier
    private BigDecimal debtRatio;
    private BigDecimal repaymentCapacity;
    private BigDecimal residualIncome;
    private BigDecimal monthlyPaymentRatio;
    private BigDecimal chargesToIncomeRatio;
    private BigDecimal lti;
    private BigDecimal ltv;
    private BigDecimal coverageRatio;
    private BigDecimal incomeToPaymentRatio;

    // Ratios - Professionnel
    private BigDecimal currentRatio;
    private BigDecimal solvencyRatio;
    private BigDecimal financialAutonomyRatio;
    private BigDecimal financialDebtRatio;
    private BigDecimal debtToAssetRatio;
    private BigDecimal interestCoverageRatio;
    private BigDecimal dscr;

    // Analyse crédit
    private BigDecimal totalCost;
    private BigDecimal totalInterest;

    // Score global
    private BigDecimal overallScore;
    private String riskLevel;
    private String recommendation;
    private String financialHealthScore;

    // Statut de l'analyse
    private String status;
    private boolean approvedByAnalyst;

    // Métadonnées
    private String analyzedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}