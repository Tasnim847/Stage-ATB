package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.Notification;
import org.example.stage_atb.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByUserId(String userId);

    List<Notification> findByUserIdAndReadFalse(String userId);

    List<Notification> findByUserIdAndType(String userId, NotificationType type);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findLatestByUserId(@Param("userId") String userId);

    @Query("SELECT n FROM Notification n WHERE n.sent = false")
    List<Notification> findUnsentNotifications();

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.read = false")
    long countUnreadByUserId(@Param("userId") String userId);

    @Query("SELECT n FROM Notification n WHERE n.type = :type AND n.read = false")
    List<Notification> findUnreadByType(@Param("type") NotificationType type);
}