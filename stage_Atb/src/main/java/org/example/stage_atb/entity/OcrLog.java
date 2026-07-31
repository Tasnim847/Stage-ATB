package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ocr_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_type")
    private String documentType;

    @Column(name = "document_id")
    private Long documentId;

    @Column(nullable = false)
    private String result;

    private Integer confidence;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "extracted_data", columnDefinition = "TEXT")
    private String extractedData;  // Stocké en JSON

    private Integer duration;

    @Column(name = "user_email")
    private String userEmail;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}