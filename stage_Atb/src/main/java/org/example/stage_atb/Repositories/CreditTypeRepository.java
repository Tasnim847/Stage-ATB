package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.CreditType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreditTypeRepository extends JpaRepository<CreditType, String> {

    // ✅ EntityGraph pour charger les documents requis
    @EntityGraph(attributePaths = {"requiredDocuments"})
    Optional<CreditType> findByCode(String code);

    // ✅ EntityGraph pour charger les documents requis
    @EntityGraph(attributePaths = {"requiredDocuments"})
    List<CreditType> findByIsActiveTrue();

    // ✅ EntityGraph pour charger les documents requis
    @EntityGraph(attributePaths = {"requiredDocuments"})
    @Query("SELECT c FROM CreditType c WHERE c.isActive = true ORDER BY c.name ASC")
    List<CreditType> findActiveOrderByName();

    // ✅ EntityGraph pour charger les documents requis
    @EntityGraph(attributePaths = {"requiredDocuments"})
    Optional<CreditType> findById(String id);

    // ✅ EntityGraph pour charger les documents requis
    @EntityGraph(attributePaths = {"requiredDocuments"})
    List<CreditType> findAll();

    boolean existsByCode(String code);

    @Query("SELECT c.category, COUNT(c) FROM CreditType c GROUP BY c.category")
    List<Object[]> countByCategory();
}