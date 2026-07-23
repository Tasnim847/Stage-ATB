package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, String> {

    Optional<Client> findByClientNumber(String clientNumber);

    Optional<Client> findByEmail(String email);

    Optional<Client> findByIdentityNumber(String identityNumber);

    List<Client> findByAdvisorId(String advisorId);

    @Query("SELECT c FROM Client c WHERE c.active = true")
    List<Client> findAllActive();

    @Query("SELECT c FROM Client c WHERE c.active = true AND c.advisor.id = :advisorId")
    List<Client> findActiveByAdvisorId(@Param("advisorId") String advisorId);

    @Query("SELECT c FROM Client c WHERE c.lastName LIKE %:query% OR c.firstName LIKE %:query% OR c.email LIKE %:query% OR c.clientNumber LIKE %:query%")
    List<Client> searchClients(@Param("query") String query);

    @Query("SELECT COUNT(c) FROM Client c WHERE c.active = true")
    long countActiveClients();

    @Query("SELECT COUNT(c) FROM Client c WHERE c.advisor.id = :advisorId")
    long countByAdvisorId(@Param("advisorId") String advisorId);

    @Query("SELECT c FROM Client c WHERE c.createdAt BETWEEN :startDate AND :endDate")
    List<Client> findByCreatedDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);


    /**
     * ✅ Récupérer les clients assignés à un analyste
     */
    @Query("SELECT c FROM Client c WHERE c.analyst.id = :analystId")
    List<Client> findByAnalystId(@Param("analystId") String analystId);
}