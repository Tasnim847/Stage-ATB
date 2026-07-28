// entity/CeilingConfig.java
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
@Table(name = "ceiling_configs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CeilingConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String creditTypeId;

    @Column(name = "credit_type_name") // ✅ AJOUTER CE CHAMP
    private String creditTypeName;

    @Column(nullable = false)
    private Double minAmount;

    @Column(nullable = false)
    private Double maxAmount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private String approvalLevel; // ADVISOR, ANALYST, MANAGER, DIRECTOR

    @Column(nullable = false)
    private Boolean requiresAdditionalApproval = false;

    private String additionalApprovalLevel; // MANAGER, DIRECTOR

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}