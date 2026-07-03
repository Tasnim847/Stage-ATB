package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.TransactionType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "aml_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AMLTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(nullable = false)
    private String transactionReference;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType transactionType;

    private String senderAccount;

    private String receiverAccount;

    private String senderName;

    private String receiverName;

    private String senderBank;

    private String receiverBank;

    private String transactionDescription;

    private LocalDateTime transactionDate;

    private boolean suspicious = false;

    @Column(columnDefinition = "TEXT")
    private String suspiciousReason;

    @Column(columnDefinition = "TEXT")
    private String aiAnalysis;

    private boolean flaggedForReview = false;

    private boolean reviewed = false;

    private String reviewNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}