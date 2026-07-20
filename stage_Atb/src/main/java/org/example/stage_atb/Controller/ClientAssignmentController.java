// Controller/ClientAssignmentController.java - CORRIGÉ
package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IClientService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.AdvisorAssignmentDTO;
import org.example.stage_atb.dto.response.ClientResponseDTO;
import org.example.stage_atb.dto.response.UserResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clients/assignment")
@RequiredArgsConstructor
@Slf4j
public class ClientAssignmentController {

    private final IClientService clientService;
    private final IUserService userService;

    /**
     * Récupérer tous les conseillers disponibles
     */
    @GetMapping("/advisors")
    @PreAuthorize("hasRole('ADMIN')")  // ✅ Utiliser hasRole au lieu de hasAuthority
    public ResponseEntity<List<UserResponseDTO>> getAvailableAdvisors() {
        log.info("Fetching all ADVISORS");

        try {
            List<UserResponseDTO> advisors = userService.getUsersByRole("ADVISOR")
                    .stream()
                    .filter(UserResponseDTO::isActive)
                    .collect(Collectors.toList());

            log.info("Found {} active advisors", advisors.size());
            return ResponseEntity.ok(advisors);
        } catch (Exception e) {
            log.error("Error fetching advisors: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupérer les clients sans conseiller
     */
    @GetMapping("/unassigned")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClientResponseDTO>> getUnassignedClients() {
        log.info("Fetching clients without advisor");
        try {
            List<ClientResponseDTO> clients = clientService.getClientsWithoutAdvisor();
            log.info("Found {} unassigned clients", clients.size());
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            log.error("Error fetching unassigned clients: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupérer les clients d'un conseiller spécifique
     */
    @GetMapping("/advisor/{advisorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClientResponseDTO>> getClientsByAdvisor(@PathVariable String advisorId) {
        log.info("Fetching clients for advisor: {}", advisorId);
        try {
            List<ClientResponseDTO> clients = clientService.getClientsByAdvisorId(advisorId);
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            log.error("Error fetching clients for advisor: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Affecter un conseiller à un client spécifique
     */
    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClientResponseDTO> assignAdvisorToClient(
            @RequestParam String clientId,
            @RequestParam String advisorId) {
        log.info("Assigning advisor {} to client {}", advisorId, clientId);
        try {
            ClientResponseDTO updatedClient = clientService.assignAdvisorToClient(clientId, advisorId);
            return ResponseEntity.ok(updatedClient);
        } catch (Exception e) {
            log.error("Error assigning advisor: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Affecter un conseiller à plusieurs clients
     */
    @PostMapping("/assign-multiple")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClientResponseDTO>> assignAdvisorToMultipleClients(
            @RequestBody AdvisorAssignmentDTO assignment) {
        log.info("Assigning advisor {} to {} clients", assignment.getAdvisorId(), assignment.getClientIds().size());

        try {
            List<ClientResponseDTO> updatedClients = clientService.assignAdvisorToMultipleClients(
                    assignment.getClientIds(),
                    assignment.getAdvisorId()
            );
            return ResponseEntity.status(HttpStatus.OK).body(updatedClients);
        } catch (Exception e) {
            log.error("Error assigning multiple clients: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Réaffecter un client à un nouveau conseiller
     */
    @PutMapping("/reassign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClientResponseDTO> reassignAdvisor(
            @RequestParam String clientId,
            @RequestParam String newAdvisorId) {
        log.info("Reassigning client {} to advisor {}", clientId, newAdvisorId);
        try {
            ClientResponseDTO updatedClient = clientService.reassignAdvisor(clientId, newAdvisorId);
            return ResponseEntity.ok(updatedClient);
        } catch (Exception e) {
            log.error("Error reassigning advisor: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Retirer le conseiller d'un client
     */


    // Controller/ClientAssignmentController.java - AJOUTER L'ENDPOINT
    @DeleteMapping("/{clientId}/advisor")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeAdvisorFromClient(@PathVariable String clientId) {
        log.info("Removing advisor from client {}", clientId);
        clientService.removeAdvisorFromClient(clientId);
        return ResponseEntity.ok().build();
    }

    // ============================================
    // ✅ ENDPOINTS POUR ANALYSTE
    // ============================================

    /**
     * Récupérer les clients d'un analyste spécifique
     */
    @GetMapping("/analyst/{analystId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClientResponseDTO>> getClientsByAnalyst(@PathVariable String analystId) {
        log.info("Fetching clients for analyst: {}", analystId);
        try {
            List<ClientResponseDTO> clients = clientService.getClientsByAnalyst(analystId);
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            log.error("Error fetching clients for analyst: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Affecter un analyste à un client
     */
    @PostMapping("/assign-analyst")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClientResponseDTO> assignAnalystToClient(
            @RequestParam String clientId,
            @RequestParam String analystId) {
        log.info("Assigning analyst {} to client {}", analystId, clientId);
        try {
            ClientResponseDTO updatedClient = clientService.assignAnalystToClient(clientId, analystId);
            return ResponseEntity.ok(updatedClient);
        } catch (Exception e) {
            log.error("Error assigning analyst: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Retirer l'analyste d'un client
     */
    @DeleteMapping("/{clientId}/analyst")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeAnalystFromClient(@PathVariable String clientId) {
        log.info("Removing analyst from client {}", clientId);
        clientService.removeAnalystFromClient(clientId);
        return ResponseEntity.ok().build();
    }
}