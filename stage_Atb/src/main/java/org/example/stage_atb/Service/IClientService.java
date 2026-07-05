package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.ClientRegisterRequest;
import org.example.stage_atb.dto.request.ClientRequestDTO;
import org.example.stage_atb.dto.response.ClientResponseDTO;
import org.example.stage_atb.entity.User;

import java.util.List;

public interface IClientService {

    ClientResponseDTO createClient(ClientRequestDTO clientRequestDTO);

    ClientResponseDTO getClientById(String id);

    ClientResponseDTO getClientByClientNumber(String clientNumber);

    ClientResponseDTO getClientByEmail(String email);

    List<ClientResponseDTO> getAllClients();

    List<ClientResponseDTO> getClientsByAdvisor(String advisorId);

    List<ClientResponseDTO> searchClients(String query);

    ClientResponseDTO updateClient(String id, ClientRequestDTO clientRequestDTO);

    void deleteClient(String id);

    void activateClient(String id);

    void deactivateClient(String id);

    long countActiveClients();

    ClientResponseDTO createClientFromUser(User user, ClientRegisterRequest request);

    // ✅ AJOUTER CETTE MÉTHODE
    ClientResponseDTO assignAdvisorToClient(String clientId, String advisorId);

    // ✅ AJOUTER CETTE MÉTHODE (affectation multiple)
    List<ClientResponseDTO> assignAdvisorToMultipleClients(List<String> clientIds, String advisorId);

    // ✅ AJOUTER CETTE MÉTHODE (réaffectation)
    ClientResponseDTO reassignAdvisor(String clientId, String newAdvisorId);

    // ✅ AJOUTER CETTE MÉTHODE (pour lister les clients sans advisor)
    List<ClientResponseDTO> getClientsWithoutAdvisor();

    // ✅ AJOUTER CETTE MÉTHODE (pour lister les clients d'un advisor)
    List<ClientResponseDTO> getClientsByAdvisorId(String advisorId);

    // Service/IClientService.java - AJOUTER
    void removeAdvisorFromClient(String clientId);
}