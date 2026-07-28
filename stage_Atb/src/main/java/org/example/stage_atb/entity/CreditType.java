package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "credit_types")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false, length = 10)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private String category; // PERSONAL, AUTO, MORTGAGE, BUSINESS, STUDENT, CONSUMER

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Integer minDurationMonths;

    @Column(nullable = false)
    private Integer maxDurationMonths;

    @Column(nullable = false)
    private Double minAmount;

    @Column(nullable = false)
    private Double maxAmount;

    @Column(nullable = false)
    private Double baseInterestRate;

    @Column(nullable = false)
    private Boolean requiresCollateral = false;

    @Column(nullable = false)
    private Boolean requiresGuarantor = false;

    @ElementCollection
    @CollectionTable(name = "credit_type_required_documents", joinColumns = @JoinColumn(name = "credit_type_id"))
    @Column(name = "document_type")
    private List<String> requiredDocuments = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}