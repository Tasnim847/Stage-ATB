package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Service.IClientService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.ClientRequestDTO;
import org.example.stage_atb.dto.response.ClientResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.Mappers.ClientMapper;
import org.example.stage_atb.Repositories.ClientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ClientServiceImpl implements IClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;
    private final IUserService userService;

    @Override
    public ClientResponseDTO createClient(ClientRequestDTO clientRequestDTO) {
        log.info("Creating client: {}", clientRequestDTO.getEmail());

        // Vérifier si le client existe déjà
        if (clientRepository.findByEmail(clientRequestDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Client already exists with email: " + clientRequestDTO.getEmail());
        }

        Client client = clientMapper.toEntity(clientRequestDTO);

        // Si un conseiller est spécifié
        if (clientRequestDTO.getAdvisorId() != null && !clientRequestDTO.getAdvisorId().isEmpty()) {
            // Utiliser la nouvelle méthode pour récupérer l'entity User
            User advisor = userService.getUserEntityById(clientRequestDTO.getAdvisorId());
            client.setAdvisor(advisor);
        }

        Client savedClient = clientRepository.save(client);
        log.info("Client created with id: {}", savedClient.getId());

        return clientMapper.toResponseDTO(savedClient);
    }

    @Override
    public ClientResponseDTO getClientById(String id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        return clientMapper.toResponseDTO(client);
    }

    @Override
    public ClientResponseDTO getClientByClientNumber(String clientNumber) {
        Client client = clientRepository.findByClientNumber(clientNumber)
                .orElseThrow(() -> new RuntimeException("Client not found with number: " + clientNumber));
        return clientMapper.toResponseDTO(client);
    }

    @Override
    public ClientResponseDTO getClientByEmail(String email) {
        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found with email: " + email));
        return clientMapper.toResponseDTO(client);
    }

    @Override
    public List<ClientResponseDTO> getAllClients() {
        return clientRepository.findAll()
                .stream()
                .map(clientMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClientResponseDTO> getClientsByAdvisor(String advisorId) {
        return clientRepository.findByAdvisorId(advisorId)
                .stream()
                .map(clientMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClientResponseDTO> searchClients(String query) {
        return clientRepository.searchClients(query)
                .stream()
                .map(clientMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ClientResponseDTO updateClient(String id, ClientRequestDTO clientRequestDTO) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));

        clientMapper.updateEntity(client, clientRequestDTO);

        // Mettre à jour le conseiller si spécifié
        if (clientRequestDTO.getAdvisorId() != null && !clientRequestDTO.getAdvisorId().isEmpty()) {
            // Utiliser la nouvelle méthode pour récupérer l'entity User
            User advisor = userService.getUserEntityById(clientRequestDTO.getAdvisorId());
            client.setAdvisor(advisor);
        }

        Client updatedClient = clientRepository.save(client);
        return clientMapper.toResponseDTO(updatedClient);
    }

    @Override
    public void deleteClient(String id) {
        if (!clientRepository.existsById(id)) {
            throw new RuntimeException("Client not found with id: " + id);
        }
        clientRepository.deleteById(id);
        log.info("Client deleted with id: {}", id);
    }

    @Override
    public void activateClient(String id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        client.setActive(true);
        clientRepository.save(client);
        log.info("Client activated: {}", id);
    }

    @Override
    public void deactivateClient(String id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        client.setActive(false);
        clientRepository.save(client);
        log.info("Client deactivated: {}", id);
    }

    @Override
    public long countActiveClients() {
        return clientRepository.countActiveClients();
    }
}