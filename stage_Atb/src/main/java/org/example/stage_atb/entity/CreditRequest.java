// entity/CreditRequest.java
package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.CreditStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "credit_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String requestNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // entity/CreditRequest.java
    @Column(name = "credit_type_id", nullable = false)
    private String creditTypeId = ""; // ✅ Ne pas mettre d'ID fixe

    // ✅ AJOUTER CETTE RELATION
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_type_id", insertable = false, updatable = false)
    private CreditType creditType;


    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private Integer durationMonths;

    @Column(nullable = false)
    private BigDecimal monthlyPayment;

    @Column(nullable = false)
    private BigDecimal interestRate;

    private String loanPurpose;

    // Champs spécifiques selon le type de crédit
    private String salary;
    private String employer;
    private String vehicleBrand;
    private String vehicleModel;
    private BigDecimal vehiclePrice;
    private BigDecimal personalContribution;
    private String propertyType;
    private BigDecimal propertyValue;
    private String propertyAddress;
    private String companyName;
    private BigDecimal turnover;
    private String businessSector;

    private String collateralType;
    private BigDecimal collateralValue;
    private String guarantorName;
    private String guarantorPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CreditStatus status;

    private String rejectionReason;

    private LocalDate approvalDate;

    private LocalDate expectedDisbursementDate;

    @OneToMany(mappedBy = "creditRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Document> documents = new ArrayList<>();

    @OneToOne(mappedBy = "creditRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private FinancialAnalysis financialAnalysis;

    @OneToOne(mappedBy = "creditRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private RiskAnalysis riskAnalysis;

    @OneToOne(mappedBy = "creditRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CreditScore creditScore;

    @OneToOne(mappedBy = "creditRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private DecisionRecommendation decisionRecommendation;

    @OneToOne(mappedBy = "creditRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CreditSimulation creditSimulation;

    @OneToMany(mappedBy = "creditRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AuditLog> auditLogs = new ArrayList<>();

    // ✅ NOUVEAUX CHAMPS POUR LA VALIDATION MANAGER
    @Column(name = "manager_validation_required", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean managerValidationRequired = false;

    @Column(name = "manager_validation_date")
    private LocalDateTime managerValidationDate;

    @Column(name = "manager_comments", columnDefinition = "TEXT")
    private String managerComments;

    @Column(name = "validation_reason")
    private String validationReason;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}