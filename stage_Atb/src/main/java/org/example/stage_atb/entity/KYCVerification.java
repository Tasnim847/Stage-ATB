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
@Table(name = "kyc_verifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KYCVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    @Column(nullable = false)
    private String verificationType;

    private boolean identityVerified = false;

    private boolean addressVerified = false;

    private boolean documentAuthentic = false;

    private boolean fraudDetected = false;

    @Column(columnDefinition = "TEXT")
    private String fraudDetails;

    private String verificationStatus;

    @Column(columnDefinition = "TEXT")
    private String verificationNotes;

    @Column(columnDefinition = "TEXT")
    private String aiAnalysis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    private LocalDateTime verifiedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}