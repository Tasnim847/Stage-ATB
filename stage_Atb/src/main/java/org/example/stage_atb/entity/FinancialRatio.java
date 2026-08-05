package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(name = "`key`", nullable = false)
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
}