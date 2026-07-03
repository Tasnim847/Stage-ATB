package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.KYCVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KYCVerificationRepository extends JpaRepository<KYCVerification, String> {

    List<KYCVerification> findByClientId(String clientId);

    Optional<KYCVerification> findByClientIdAndDocumentId(String clientId, String documentId);

    @Query("SELECT k FROM KYCVerification k WHERE k.identityVerified = false OR k.addressVerified = false")
    List<KYCVerification> findIncompleteVerifications();

    @Query("SELECT k FROM KYCVerification k WHERE k.fraudDetected = true")
    List<KYCVerification> findFraudDetected();

    @Query("SELECT k FROM KYCVerification k WHERE k.verifiedAt IS NULL")
    List<KYCVerification> findPendingVerifications();

    @Query("SELECT COUNT(k) FROM KYCVerification k WHERE k.client.id = :clientId AND k.identityVerified = true AND k.addressVerified = true")
    long countFullyVerifiedByClientId(@Param("clientId") String clientId);
}