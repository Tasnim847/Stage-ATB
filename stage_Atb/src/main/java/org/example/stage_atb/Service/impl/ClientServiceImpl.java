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