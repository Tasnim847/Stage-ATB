package org.example.stage_atb.Repositories;

import org.example.stage_atb.entity.Employee;
import org.example.stage_atb.enums.EmployeeStatus;
import org.example.stage_atb.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {

    Optional<Employee> findByEmployeeNumber(String employeeNumber);

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByUserId(String userId);

    List<Employee> findByRole(UserRole role);

    List<Employee> findByStatus(EmployeeStatus status);

    List<Employee> findByDepartment(String department);

    @Query("SELECT e FROM Employee e WHERE e.active = true")
    List<Employee> findAllActive();

    @Query("SELECT e FROM Employee e WHERE e.managerId = :managerId")
    List<Employee> findByManagerId(@Param("managerId") String managerId);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.role = :role AND e.active = true")
    long countActiveByRole(@Param("role") UserRole role);

    @Query("SELECT e.role, COUNT(e) FROM Employee e GROUP BY e.role")
    List<Object[]> countByRoleGrouped();
}