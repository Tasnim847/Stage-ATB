package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.ClientRegisterRequest;
import org.example.stage_atb.dto.request.ClientRequestDTO;
import org.example.stage_atb.dto.response.ClientResponseDTO;
import org.example.stage_atb.entity.Client;
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

    ClientResponseDTO assignAnalystToClient(String clientId, String analystId);

    ClientResponseDTO removeAnalystFromClient(String clientId);

    List<ClientResponseDTO> getClientsByAnalyst(String analystId);

    /**
     * ✅ Créer un client à partir d'un utilisateur (retourne l'entité)
     */
    Client createClientEntityFromUser(User user, ClientRegisterRequest request);

    /**
     * ✅ Supprimer un client par userId
     */
    void deleteClientByUserId(String userId);

    /**
     * ✅ Activer un client par userId
     */
    void activateClientByUserId(String userId);

    /**
     * ✅ Désactiver un client par userId
     */
    void deactivateClientByUserId(String userId);

    /**
     * ✅ Récupérer un client par userId
     */
    Client getClientByUserId(String userId);
}