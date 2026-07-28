// entity/DurationConfig.java
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
@Table(name = "duration_configs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DurationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String creditTypeId;

    @Column(name = "credit_type_name") // ✅ AJOUTER CE CHAMP
    private String creditTypeName;

    @Column(nullable = false)
    private Integer durationMonths;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(nullable = false)
    private Boolean isDefault = false;

    @Column(nullable = false)
    private Boolean isActive = true;

    private Double minAmount;
    private Double maxAmount;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}