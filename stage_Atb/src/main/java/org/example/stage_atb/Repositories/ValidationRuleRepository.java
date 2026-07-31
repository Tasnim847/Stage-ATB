package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.ValidationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ValidationRuleRepository extends JpaRepository<ValidationRule, Long> {
    List<ValidationRule> findByDocumentTypeId(Long documentTypeId);
    void deleteByDocumentTypeId(Long documentTypeId);
}