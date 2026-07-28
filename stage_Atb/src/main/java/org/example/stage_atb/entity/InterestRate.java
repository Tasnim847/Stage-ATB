// entity/InterestRate.java
package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interest_rates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterestRate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String creditTypeId;

    @Column(name = "credit_type_name") // ✅ AJOUTER CE CHAMP
    private String creditTypeName;

    @Column(nullable = false)
    private Double rate;

    private Double minRate;
    private Double maxRate;

    @Column(nullable = false)
    private Boolean isDefault = false;

    private String clientCategory; // PREMIUM, STANDARD, RISK
    private Double rateAdjustment; // -0.5 pour premium, +1 pour risque

    @Column(nullable = false)
    private LocalDateTime effectiveDate;

    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private String createdBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}