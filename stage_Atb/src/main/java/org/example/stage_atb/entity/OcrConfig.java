package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ocr_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false)
    private String apiKey;

    @Column(nullable = false)
    private String endpoint;

    @Column(columnDefinition = "TEXT")
    private String languages;

    @Column(name = "min_confidence")
    private Integer minConfidence = 85;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "max_retries")
    private Integer maxRetries = 3;

    private Integer timeout = 30;

    @Column(name = "auto_sync")
    private Boolean autoSync = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}