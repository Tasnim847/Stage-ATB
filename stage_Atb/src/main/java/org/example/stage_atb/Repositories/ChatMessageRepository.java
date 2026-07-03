package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {

    List<ChatMessage> findByUserId(String userId);

    List<ChatMessage> findByCreditRequestId(String creditRequestId);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.user.id = :userId ORDER BY cm.timestamp DESC")
    List<ChatMessage> findLatestByUserId(@Param("userId") String userId);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.creditRequest.id = :creditRequestId ORDER BY cm.timestamp")
    List<ChatMessage> findByCreditRequestIdOrdered(@Param("creditRequestId") String creditRequestId);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.role = 'ASSISTANT'")
    List<ChatMessage> findAIMessages();
}