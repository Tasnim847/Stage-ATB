package org.example.stage_atb.Service;


import org.example.stage_atb.dto.request.ClientRequestDTO;
import org.example.stage_atb.dto.response.ClientResponseDTO;

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
}