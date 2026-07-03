package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.Document;
import org.example.stage_atb.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {

    List<Document> findByClientId(String clientId);

    List<Document> findByCreditRequestId(String creditRequestId);

    List<Document> findByDocumentType(DocumentType documentType);

    List<Document> findByClientIdAndDocumentType(String clientId, DocumentType documentType);

    @Query("SELECT d FROM Document d WHERE d.client.id = :clientId AND d.verified = true")
    List<Document> findVerifiedByClientId(@Param("clientId") String clientId);

    @Query("SELECT d FROM Document d WHERE d.verified = false")
    List<Document> findUnverifiedDocuments();

    @Query("SELECT d FROM Document d WHERE d.complete = false")
    List<Document> findIncompleteDocuments();

    @Query("SELECT COUNT(d) FROM Document d WHERE d.client.id = :clientId")
    long countByClientId(@Param("clientId") String clientId);

    @Query("SELECT d FROM Document d WHERE d.uploadedBy.id = :userId")
    List<Document> findByUploadedById(@Param("userId") String userId);
}