package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findByRole(UserRole role);

    @Query("SELECT u FROM User u WHERE u.active = true AND u.role = :role")
    List<User> findActiveUsersByRole(@Param("role") UserRole role);

    @Query("SELECT u FROM User u WHERE u.active = true AND u.locked = false")
    List<User> findAllActiveAndUnlocked();

    @Query("SELECT COUNT(u) FROM User u WHERE u.active = true")
    long countActiveUsers();

    @Query("SELECT u FROM User u WHERE u.lastName LIKE %:query% OR u.firstName LIKE %:query% OR u.email LIKE %:query%")
    List<User> searchUsers(@Param("query") String query);

    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countByRole();
}