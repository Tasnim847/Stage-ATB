package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "electronic_signatures")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ElectronicSignature {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_request_id", nullable = false)
    private CreditRequest creditRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signer_id", nullable = false)
    private User signer;

    @Column(nullable = false)
    private String documentName;

    @Column(nullable = false)
    private String signatureHash;

    private String signatureType;

    private LocalDateTime signedAt;

    private String ipAddress;

    private String userAgent;

    private boolean verified = false;

    private String verificationMethod;

    @Column(columnDefinition = "TEXT")
    private String signatureData;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Version
    private Long version;
}