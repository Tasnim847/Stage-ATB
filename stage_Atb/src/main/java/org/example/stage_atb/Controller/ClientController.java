package org.example.stage_atb.Controller;

import org.example.stage_atb.Service.IClientService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.ClientRequestDTO;
import org.example.stage_atb.dto.response.ClientResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@Slf4j
// ✅ SUPPRIMER @CrossOrigin - La configuration CORS est gérée dans SecurityConfig
public class ClientController {

    private final IClientService clientService;
    private final IUserService userService;

    @PostMapping
    public ResponseEntity<ClientResponseDTO> createClient(@Valid @RequestBody ClientRequestDTO requestDTO) {
        log.info("Création d'un nouveau client: {}", requestDTO.getEmail());

        // ✅ Récupérer l'utilisateur connecté
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        var user = userService.getUserEntityById(userService.getUserByEmail(userEmail).getId());

        // ✅ Si l'utilisateur est ADVISOR, ajouter automatiquement son ID
        boolean isAdvisor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADVISOR"));

        if (isAdvisor) {
            requestDTO.setAdvisorId(user.getId());
            log.info("ADVISOR {} crée un client", userEmail);
        }

        ClientResponseDTO response = clientService.createClient(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponseDTO> getClientById(@PathVariable String id) {
        ClientResponseDTO response = clientService.getClientById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/number/{clientNumber}")
    public ResponseEntity<ClientResponseDTO> getClientByNumber(@PathVariable String clientNumber) {
        ClientResponseDTO response = clientService.getClientByClientNumber(clientNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ClientResponseDTO> getClientByEmail(@PathVariable String email) {
        ClientResponseDTO response = clientService.getClientByEmail(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ClientResponseDTO>> getAllClients() {
        // ✅ Récupérer l'utilisateur connecté
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdvisor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADVISOR"));

        if (isAdvisor) {
            // ✅ L'advisor voit uniquement ses clients
            String userEmail = authentication.getName();
            var user = userService.getUserEntityById(userService.getUserByEmail(userEmail).getId());
            List<ClientResponseDTO> clients = clientService.getClientsByAdvisor(user.getId());
            log.info("ADVISOR {} voit ses {} clients", userEmail, clients.size());
            return ResponseEntity.ok(clients);
        }

        // ✅ Admin, Analyst, Manager voient tous les clients
        List<ClientResponseDTO> clients = clientService.getAllClients();
        log.info("Tous les clients: {} clients", clients.size());
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/advisor/{advisorId}")
    public ResponseEntity<List<ClientResponseDTO>> getClientsByAdvisor(@PathVariable String advisorId) {
        // ✅ Vérifier que l'utilisateur a le droit d'accéder à cette ressource
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        var user = userService.getUserEntityById(userService.getUserByEmail(userEmail).getId());

        // ✅ Seul l'ADVISOR peut voir ses propres clients, ou ADMIN/ANALYST/MANAGER peuvent voir tous
        boolean isAdvisor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADVISOR"));

        if (isAdvisor && !user.getId().equals(advisorId)) {
            // ✅ Un advisor ne peut voir que ses propres clients
            log.warn("ADVISOR {} tente d'accéder aux clients d'un autre advisor", userEmail);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<ClientResponseDTO> clients = clientService.getClientsByAdvisor(advisorId);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClientResponseDTO>> searchClients(@RequestParam String query) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdvisor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADVISOR"));

        List<ClientResponseDTO> clients;
        if (isAdvisor) {
            // ✅ L'advisor ne cherche que dans ses clients
            String userEmail = authentication.getName();
            var user = userService.getUserEntityById(userService.getUserByEmail(userEmail).getId());
            // Implémenter une méthode searchClientsByAdvisor si nécessaire
            clients = clientService.searchClients(query);
            clients = clients.stream()
                    .filter(c -> c.getAdvisorId().equals(user.getId()))
                    .toList();
        } else {
            clients = clientService.searchClients(query);
        }
        return ResponseEntity.ok(clients);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponseDTO> updateClient(
            @PathVariable String id,
            @Valid @RequestBody ClientRequestDTO requestDTO) {
        ClientResponseDTO response = clientService.updateClient(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable String id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateClient(@PathVariable String id) {
        clientService.activateClient(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateClient(@PathVariable String id) {
        clientService.deactivateClient(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/count/active")
    public ResponseEntity<Long> countActiveClients() {
        long count = clientService.countActiveClients();
        return ResponseEntity.ok(count);
    }

    /**
     * ✅ Récupérer le client connecté (pour le rôle CLIENT)
     */
    @GetMapping("/me")
    public ResponseEntity<ClientResponseDTO> getCurrentClient() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Récupération du client connecté: {}", email);
        ClientResponseDTO client = clientService.getClientByEmail(email);
        return ResponseEntity.ok(client);
    }
}