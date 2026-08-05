package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "kyc_aml_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycAmlConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean required = false;

    @Column(nullable = false)
    private Integer priority;

    @Column(name = "auto_check", nullable = false)
    private Boolean autoCheck = false;

    @OneToMany(mappedBy = "kycAmlConfig", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<KycAmlCheck> checks = new ArrayList<>();
}