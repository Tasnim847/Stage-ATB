package org.example.stage_atb.Repositories;


import org.example.stage_atb.entity.OcrConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OcrConfigRepository extends JpaRepository<OcrConfig, Long> {
}
