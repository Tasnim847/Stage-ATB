package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Service.IClientService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.ClientRegisterRequest;
import org.example.stage_atb.dto.request.ClientRequestDTO;
import org.example.stage_atb.dto.response.ClientResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.UserRole;
import org.example.stage_atb.Mappers.ClientMapper;
import org.example.stage_atb.Repositories.ClientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final PasswordEncoder passwordEncoder; // ✅ Ajouter PasswordEncoder

    @Override
    public ClientResponseDTO createClient(ClientRequestDTO clientRequestDTO) {
        log.info("Creating client: {}", clientRequestDTO.getEmail());

        // ✅ Vérifier si le client existe déjà
        if (clientRepository.findByEmail(clientRequestDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Client already exists with email: " + clientRequestDTO.getEmail());
        }

        // ✅ Vérifier si l'utilisateur existe déjà
        if (userService.existsByEmail(clientRequestDTO.getEmail())) {
            throw new RuntimeException("User already exists with email: " + clientRequestDTO.getEmail());
        }

        // ✅ 1. Créer l'utilisateur avec le rôle CLIENT
        User newUser = new User();
        newUser.setUsername(generateUsername(clientRequestDTO.getFirstName(), clientRequestDTO.getLastName()));
        newUser.setEmail(clientRequestDTO.getEmail());
        newUser.setPassword(passwordEncoder.encode("default123")); // Mot de passe par défaut
        newUser.setFirstName(clientRequestDTO.getFirstName());
        newUser.setLastName(clientRequestDTO.getLastName());
        newUser.setPhoneNumber(clientRequestDTO.getPhoneNumber());
        newUser.setRole(UserRole.CLIENT);
        newUser.setActive(true);
        newUser.setLocked(false);

        User savedUser = userService.createUser(newUser);
        log.info("User created with id: {}", savedUser.getId());

        // ✅ 2. Créer le client avec l'ID de l'utilisateur
        Client client = clientMapper.toEntity(clientRequestDTO);

        if (clientRequestDTO.getAdvisorId() != null && !clientRequestDTO.getAdvisorId().isEmpty()) {
            User advisor = userService.getUserEntityById(clientRequestDTO.getAdvisorId());
            client.setAdvisor(advisor);
        }

        Client savedClient = clientRepository.save(client);
        log.info("Client created with id: {}", savedClient.getId());

        return clientMapper.toResponseDTO(savedClient);
    }

    private String generateUsername(String firstName, String lastName) {
        String base = firstName.toLowerCase() + "." + lastName.toLowerCase();
        String username = base;
        int counter = 1;
        while (userService.existsByUsername(username)) {
            username = base + counter;
            counter++;
        }
        return username;
    }

    // ... autres méthodes
    @Override
    public ClientResponseDTO createClientFromUser(User user, ClientRegisterRequest request) {
        log.info("Creating client from user registration: {}", user.getEmail());

        if (clientRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Client already exists with email: " + user.getEmail());
        }

        Client client = Client.builder()
                .clientNumber(generateClientNumber())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .placeOfBirth(request.getPlaceOfBirth())
                .nationality(request.getNationality())
                .maritalStatus(request.getMaritalStatus())
                .gender(request.getGender())
                .identityNumber(request.getIdentityNumber())
                .identityType(request.getIdentityType())
                .profession(request.getProfession())
                .employer(request.getEmployer())
                .monthlyIncome(request.getMonthlyIncome())
                .postalCode(request.getPostalCode())
                .notes(request.getNotes())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        Client savedClient = clientRepository.save(client);
        log.info("Client created from user registration with id: {}", savedClient.getId());

        return clientMapper.toResponseDTO(savedClient);
    }

    private String generateClientNumber() {
        return "CLT-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
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

        if (clientRequestDTO.getAdvisorId() != null && !clientRequestDTO.getAdvisorId().isEmpty()) {
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

    // Service/impl/ClientServiceImpl.java - MODIFIER ACTIVATE
    @Override
    public void activateClient(String id) {
        log.info("Activating client with id: {}", id);

        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));

        // ✅ Activer le client
        client.setActive(true);
        clientRepository.save(client);

        // ✅ Activer également l'utilisateur associé
        if (client.getEmail() != null) {
            try {
                User user = userService.getUserByEmailEntity(client.getEmail());
                if (user != null) {
                    user.setActive(true);
                    userService.createUser(user); // Mettre à jour l'utilisateur
                    log.info("User {} also activated", user.getEmail());
                }
            } catch (Exception e) {
                log.warn("Could not activate user for client: {}", e.getMessage());
            }
        }

        log.info("Client {} activated successfully", id);
    }

    // Service/impl/ClientServiceImpl.java - MODIFIER DEACTIVATE
    @Override
    public void deactivateClient(String id) {
        log.info("Deactivating client with id: {}", id);

        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));

        // ✅ Désactiver le client
        client.setActive(false);
        clientRepository.save(client);

        // ✅ Désactiver également l'utilisateur associé
        if (client.getEmail() != null) {
            try {
                User user = userService.getUserByEmailEntity(client.getEmail());
                if (user != null) {
                    user.setActive(false);
                    userService.createUser(user); // Mettre à jour l'utilisateur
                    log.info("User {} also deactivated", user.getEmail());
                }
            } catch (Exception e) {
                log.warn("Could not deactivate user for client: {}", e.getMessage());
            }
        }

        log.info("Client {} deactivated successfully", id);
    }

    @Override
    public long countActiveClients() {
        return clientRepository.countActiveClients();
    }

    @Override
    public ClientResponseDTO assignAdvisorToClient(String clientId, String advisorId) {
        log.info("Assigning advisor {} to client {}", advisorId, clientId);

        // Récupérer le client
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        // Vérifier que l'advisor existe et a le rôle ADVISOR
        User advisor = userService.getUserEntityById(advisorId);
        if (advisor.getRole() != UserRole.ADVISOR) {
            throw new RuntimeException("User is not an ADVISOR");
        }

        // Affecter l'advisor
        client.setAdvisor(advisor);
        Client updatedClient = clientRepository.save(client);

        log.info("Advisor {} assigned to client {}", advisorId, clientId);
        return clientMapper.toResponseDTO(updatedClient);
    }

    @Override
    public List<ClientResponseDTO> assignAdvisorToMultipleClients(List<String> clientIds, String advisorId) {
        log.info("Assigning advisor {} to {} clients", advisorId, clientIds.size());

        // Vérifier que l'advisor existe et a le rôle ADVISOR
        User advisor = userService.getUserEntityById(advisorId);
        if (advisor.getRole() != UserRole.ADVISOR) {
            throw new RuntimeException("User is not an ADVISOR");
        }

        List<ClientResponseDTO> updatedClients = new ArrayList<>();

        for (String clientId : clientIds) {
            try {
                Client client = clientRepository.findById(clientId)
                        .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

                client.setAdvisor(advisor);
                Client updatedClient = clientRepository.save(client);
                updatedClients.add(clientMapper.toResponseDTO(updatedClient));
            } catch (Exception e) {
                log.error("Error assigning advisor to client {}: {}", clientId, e.getMessage());
            }
        }

        log.info("Advisor {} assigned to {} clients successfully", advisorId, updatedClients.size());
        return updatedClients;
    }

    @Override
    public ClientResponseDTO reassignAdvisor(String clientId, String newAdvisorId) {
        log.info("Reassigning client {} to advisor {}", clientId, newAdvisorId);

        // Récupérer le client
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        // Vérifier que le nouvel advisor existe et a le rôle ADVISOR
        User newAdvisor = userService.getUserEntityById(newAdvisorId);
        if (newAdvisor.getRole() != UserRole.ADVISOR) {
            throw new RuntimeException("User is not an ADVISOR");
        }

        // Vérifier que ce n'est pas le même advisor
        if (client.getAdvisor() != null && client.getAdvisor().getId().equals(newAdvisorId)) {
            throw new RuntimeException("Client is already assigned to this advisor");
        }

        // Réaffecter
        client.setAdvisor(newAdvisor);
        Client updatedClient = clientRepository.save(client);

        log.info("Client {} reassigned to advisor {}", clientId, newAdvisorId);
        return clientMapper.toResponseDTO(updatedClient);
    }

    @Override
    public List<ClientResponseDTO> getClientsWithoutAdvisor() {
        log.info("Fetching clients without advisor");

        // Récupérer tous les clients
        List<Client> allClients = clientRepository.findAll();

        // Filtrer ceux qui n'ont pas d'advisor
        List<Client> clientsWithoutAdvisor = allClients.stream()
                .filter(client -> client.getAdvisor() == null)
                .collect(Collectors.toList());

        log.info("Found {} clients without advisor", clientsWithoutAdvisor.size());

        return clientsWithoutAdvisor.stream()
                .map(clientMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClientResponseDTO> getClientsByAdvisorId(String advisorId) {
        log.info("Fetching clients for advisor {}", advisorId);

        // Vérifier que l'advisor existe
        userService.getUserEntityById(advisorId);

        List<Client> clients = clientRepository.findByAdvisorId(advisorId);

        log.info("Found {} clients for advisor {}", clients.size(), advisorId);

        return clients.stream()
                .map(clientMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // Service/impl/ClientServiceImpl.java - IMPLÉMENTER
    @Override
    public void removeAdvisorFromClient(String clientId) {
        log.info("Removing advisor from client {}", clientId);

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        client.setAdvisor(null);
        clientRepository.save(client);

        log.info("Advisor removed from client {}", clientId);
    }


    // Service/impl/ClientServiceImpl.java - AJOUTER LES MÉTHODES POUR ANALYSTE

    @Override
    public ClientResponseDTO assignAnalystToClient(String clientId, String analystId) {
        log.info("Assigning analyst {} to client {}", analystId, clientId);

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        User analyst = userService.getUserEntityById(analystId);
        if (analyst.getRole() != UserRole.ANALYST) {
            throw new RuntimeException("User is not an ANALYST");
        }

        client.setAnalyst(analyst);
        Client updatedClient = clientRepository.save(client);

        log.info("Analyst {} assigned to client {}", analystId, clientId);
        return clientMapper.toResponseDTO(updatedClient);
    }

    @Override
    public ClientResponseDTO removeAnalystFromClient(String clientId) {
        log.info("Removing analyst from client {}", clientId);

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        client.setAnalyst(null);
        Client updatedClient = clientRepository.save(client);

        log.info("Analyst removed from client {}", clientId);
        return clientMapper.toResponseDTO(updatedClient);
    }

    @Override
    public List<ClientResponseDTO> getClientsByAnalyst(String analystId) {
        log.info("Fetching clients for analyst {}", analystId);

        userService.getUserEntityById(analystId);

        // Récupérer tous les clients et filtrer par analystId
        List<Client> allClients = clientRepository.findAll();
        List<Client> clients = allClients.stream()
                .filter(c -> c.getAnalyst() != null && c.getAnalyst().getId().equals(analystId))
                .collect(Collectors.toList());

        log.info("Found {} clients for analyst {}", clients.size(), analystId);
        return clients.stream()
                .map(clientMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}