package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.OcrField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OcrFieldRepository extends JpaRepository<OcrField, Long> {
    List<OcrField> findByDocumentTypeId(Long documentTypeId);
    void deleteByDocumentTypeId(Long documentTypeId);
}