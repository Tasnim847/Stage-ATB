package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.CreditSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreditSimulationRepository extends JpaRepository<CreditSimulation, String> {

    List<CreditSimulation> findByUserId(String userId);

    List<CreditSimulation> findByClientId(String clientId);

    @Query("SELECT cs FROM CreditSimulation cs WHERE cs.creditRequest.id = :creditRequestId")
    Optional<CreditSimulation> findByCreditRequestId(@Param("creditRequestId") String creditRequestId);

    @Query("SELECT cs FROM CreditSimulation cs WHERE cs.user.id = :userId ORDER BY cs.createdAt DESC")
    List<CreditSimulation> findLatestByUserId(@Param("userId") String userId);
}