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
@Table(name = "credit_simulations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // ✅ Ajouter la relation avec CreditRequest
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_request_id")
    private CreditRequest creditRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private Integer durationMonths;

    @Column(nullable = false)
    private BigDecimal interestRate;

    @Column(nullable = false)
    private BigDecimal monthlyPayment;

    private BigDecimal totalInterest;

    private BigDecimal totalPayment;

    private BigDecimal borrowingCapacity;

    @Column(columnDefinition = "TEXT")
    private String simulationResults;

    @Column(columnDefinition = "TEXT")
    private String comparisonResults;

    private String simulationName;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}