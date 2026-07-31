package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.OcrDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OcrDocumentTypeRepository extends JpaRepository<OcrDocumentType, Long> {
    Optional<OcrDocumentType> findByCode(String code);

    @Query("SELECT dt FROM OcrDocumentType dt WHERE dt.ocrEnabled = true")
    List<OcrDocumentType> findAllEnabled();

    @Query("SELECT dt FROM OcrDocumentType dt WHERE dt.id IN :ids")
    List<OcrDocumentType> findAllByIdIn(@Param("ids") List<Long> ids);
}




