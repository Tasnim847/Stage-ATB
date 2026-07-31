package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "validation_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String condition;

    @Column(nullable = false)
    private String value;

    @Column(name = "value_2")
    private String value2;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_type_id", nullable = false)
    private OcrDocumentType documentType;
}