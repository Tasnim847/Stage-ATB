package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.ElectronicSignature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ElectronicSignatureRepository extends JpaRepository<ElectronicSignature, String> {

    List<ElectronicSignature> findBySignerId(String signerId);

    List<ElectronicSignature> findByCreditRequestId(String creditRequestId);

    Optional<ElectronicSignature> findBySignatureHash(String signatureHash);

    @Query("SELECT es FROM ElectronicSignature es WHERE es.signedAt IS NOT NULL")
    List<ElectronicSignature> findSignedDocuments();

    @Query("SELECT es FROM ElectronicSignature es WHERE es.signedAt IS NULL")
    List<ElectronicSignature> findPendingSignatures();

    @Query("SELECT COUNT(es) FROM ElectronicSignature es WHERE es.creditRequest.id = :creditRequestId")
    long countByCreditRequestId(@Param("creditRequestId") String creditRequestId);
}