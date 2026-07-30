// EmployeeController.java
package org.example.stage_atb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IEmployeeService;
import org.example.stage_atb.dto.request.EmployeeRequestDTO;
import org.example.stage_atb.dto.response.EmployeeResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Slf4j
public class EmployeeController {

    private final IEmployeeService employeeService;

    // ============================================
    // GET - Récupération des employés
    // ============================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmployeeResponseDTO>> getAllEmployees() {
        log.info("📋 Récupération de tous les employés");
        List<EmployeeResponseDTO> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponseDTO> getEmployeeById(@PathVariable String id) {
        log.info("👤 Récupération de l'employé: {}", id);
        EmployeeResponseDTO employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(employee);
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponseDTO> getEmployeeByEmail(@PathVariable String email) {
        log.info("📧 Récupération de l'employé par email: {}", email);
        EmployeeResponseDTO employee = employeeService.getEmployeeByEmail(email);
        return ResponseEntity.ok(employee);
    }

    @GetMapping("/number/{employeeNumber}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponseDTO> getEmployeeByNumber(@PathVariable String employeeNumber) {
        log.info("🔢 Récupération de l'employé par numéro: {}", employeeNumber);
        EmployeeResponseDTO employee = employeeService.getEmployeeByEmployeeNumber(employeeNumber);
        return ResponseEntity.ok(employee);
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmployeeResponseDTO>> getEmployeesByRole(@PathVariable String role) {
        log.info("🎯 Récupération des employés par rôle: {}", role);
        List<EmployeeResponseDTO> employees = employeeService.getEmployeesByRole(role);
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmployeeResponseDTO>> getActiveEmployees() {
        log.info("✅ Récupération des employés actifs");
        List<EmployeeResponseDTO> employees = employeeService.getActiveEmployees();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/count/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> countActiveEmployees() {
        log.info("📊 Comptage des employés actifs");
        long count = employeeService.countActiveEmployees();
        return ResponseEntity.ok(count);
    }

    // ============================================
    // POST - Création d'un employé
    // ============================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponseDTO> createEmployee(@Valid @RequestBody EmployeeRequestDTO request) {
        log.info("➕ Création d'un nouvel employé: {}", request.getEmail());
        EmployeeResponseDTO response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ============================================
    // PUT - Mise à jour d'un employé
    // ============================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponseDTO> updateEmployee(
            @PathVariable String id,
            @Valid @RequestBody EmployeeRequestDTO request) {
        log.info("✏️ Mise à jour de l'employé: {}", id);
        EmployeeResponseDTO response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(response);
    }

    // ============================================
    // PATCH - Activation/Désactivation
    // ============================================

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateEmployee(@PathVariable String id) {
        log.info("🔓 Activation de l'employé: {}", id);
        employeeService.activateEmployee(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateEmployee(@PathVariable String id) {
        log.info("🔒 Désactivation de l'employé: {}", id);
        employeeService.deactivateEmployee(id);
        return ResponseEntity.ok().build();
    }

    // ============================================
    // DELETE - Suppression d'un employé
    // ============================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable String id) {
        log.info("🗑️ Suppression de l'employé: {}", id);
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}