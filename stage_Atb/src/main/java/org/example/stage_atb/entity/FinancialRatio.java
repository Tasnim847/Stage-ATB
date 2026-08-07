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
@Table(name = "financial_ratios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialRatio {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ✅ CHANGER nullable = false en nullable = true
    @Column(name = "`key`", nullable = true)
    private String key;

    @Column(name = "min_value")
    private Double minValue;

    @Column(name = "max_value", nullable = false)
    private Double maxValue;

    @Column(name = "critical_min")
    private Double criticalMin;

    @Column(name = "critical_max")
    private Double criticalMax;

    @Column(nullable = false)
    private String unit;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Integer priority;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}