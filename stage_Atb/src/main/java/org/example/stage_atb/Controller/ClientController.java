package org.example.stage_atb.Controller;


import org.example.stage_atb.Service.IClientService;
import org.example.stage_atb.dto.request.ClientRequestDTO;
import org.example.stage_atb.dto.response.ClientResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClientController {

    private final IClientService clientService;

    @PostMapping
    public ResponseEntity<ClientResponseDTO> createClient(@Valid @RequestBody ClientRequestDTO requestDTO) {
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
        List<ClientResponseDTO> response = clientService.getAllClients();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/advisor/{advisorId}")
    public ResponseEntity<List<ClientResponseDTO>> getClientsByAdvisor(@PathVariable String advisorId) {
        List<ClientResponseDTO> response = clientService.getClientsByAdvisor(advisorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClientResponseDTO>> searchClients(@RequestParam String query) {
        List<ClientResponseDTO> response = clientService.searchClients(query);
        return ResponseEntity.ok(response);
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
}