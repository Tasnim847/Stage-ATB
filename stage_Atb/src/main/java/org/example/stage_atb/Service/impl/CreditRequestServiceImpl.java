package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.UserRepository;
import org.example.stage_atb.Service.ICreditRequestService;
import org.example.stage_atb.Service.ICreditSimulationService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.CreditRequestDTO;
import org.example.stage_atb.dto.response.CreditResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.CreditSimulation;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.CreditStatus;
import org.example.stage_atb.Mappers.CreditRequestMapper;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CreditRequestServiceImpl implements ICreditRequestService {

    private final CreditRequestRepository creditRequestRepository;
    private final CreditRequestMapper creditRequestMapper;
    private final IUserService userService;
    private final ClientRepository clientRepository; // ✅ AJOUTER
    private final UserRepository userRepository; // ✅ AJOUTER CETTE LIGNE

    private final ICreditSimulationService creditSimulationService; // ✅ AJOUTER

    @Override
    public CreditResponseDTO createCreditRequest(CreditRequestDTO creditRequestDTO) {
        log.info("Creating credit request for client: {}", creditRequestDTO.getClientId());

        User currentUser = userService.getCurrentUser();

        CreditRequest creditRequest = creditRequestMapper.toEntity(
                creditRequestDTO,
                clientRepository,
                userRepository // ✅ Assurez-vous d'avoir UserRepository injecté
        );
        creditRequest.setUser(currentUser);

        CreditRequest savedRequest = creditRequestRepository.save(creditRequest);
        log.info("Credit request created with number: {}", savedRequest.getRequestNumber());

        // ✅ Créer automatiquement la simulation
        try {
            CreditSimulation simulation = creditSimulationService.createSimulationFromCreditRequest(savedRequest, currentUser);
            log.info("Simulation created with id: {}", simulation.getId());
        } catch (Exception e) {
            log.error("Error creating simulation: {}", e.getMessage(), e);
        }

        return creditRequestMapper.toResponseDTO(savedRequest);
    }

    @Override
    public CreditResponseDTO getCreditRequestById(String id) {
        CreditRequest creditRequest = creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit request not found with id: " + id));
        return creditRequestMapper.toResponseDTO(creditRequest);
    }

    @Override
    public CreditResponseDTO getCreditRequestByNumber(String requestNumber) {
        CreditRequest creditRequest = creditRequestRepository.findByRequestNumber(requestNumber)
                .orElseThrow(() -> new RuntimeException("Credit request not found with number: " + requestNumber));
        return creditRequestMapper.toResponseDTO(creditRequest);
    }

    @Override
    public List<CreditResponseDTO> getCreditRequestsByClient(String clientId) {
        return creditRequestRepository.findByClientId(clientId)
                .stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CreditResponseDTO> getCreditRequestsByUser(String userId) {
        return creditRequestRepository.findByUserId(userId)
                .stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CreditResponseDTO> getCreditRequestsByStatus(CreditStatus status) {
        return creditRequestRepository.findByStatus(status)
                .stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CreditResponseDTO> getAllCreditRequests() {
        return creditRequestRepository.findAll()
                .stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CreditResponseDTO updateCreditRequest(String id, CreditRequestDTO creditRequestDTO) {
        CreditRequest creditRequest = creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit request not found with id: " + id));

        creditRequestMapper.updateEntity(creditRequest, creditRequestDTO);

        CreditRequest updatedRequest = creditRequestRepository.save(creditRequest);
        return creditRequestMapper.toResponseDTO(updatedRequest);
    }

    @Override
    public CreditResponseDTO updateCreditRequestStatus(String id, CreditStatus status, String reason) {
        CreditRequest creditRequest = creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit request not found with id: " + id));

        creditRequest.setStatus(status);

        if (status == CreditStatus.APPROVED) {
            creditRequest.setApprovalDate(LocalDate.now());
        } else if (status == CreditStatus.REJECTED) {
            creditRequest.setRejectionReason(reason);
        }

        CreditRequest updatedRequest = creditRequestRepository.save(creditRequest);
        return creditRequestMapper.toResponseDTO(updatedRequest);
    }

    @Override
    public CreditResponseDTO approveCreditRequest(String id) {
        return updateCreditRequestStatus(id, CreditStatus.APPROVED, null);
    }

    @Override
    public CreditResponseDTO rejectCreditRequest(String id, String reason) {
        return updateCreditRequestStatus(id, CreditStatus.REJECTED, reason);
    }

    @Override
    public void deleteCreditRequest(String id) {
        if (!creditRequestRepository.existsById(id)) {
            throw new RuntimeException("Credit request not found with id: " + id);
        }
        creditRequestRepository.deleteById(id);
        log.info("Credit request deleted with id: {}", id);
    }

    @Override
    public BigDecimal getTotalAmountByStatus(CreditStatus status) {
        BigDecimal total = creditRequestRepository.sumAmountByStatus(status);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public long countByStatusSince(CreditStatus status, LocalDateTime since) {
        return creditRequestRepository.countByStatusSince(status, since);
    }

    @Override
    public List<Object[]> getStatusDistribution() {
        return creditRequestRepository.countByStatusGrouped();
    }

    @Override
    public List<CreditResponseDTO> getHighRiskCreditRequests() {
        // Récupérer les demandes avec risque élevé
        // Cette méthode sera implémentée avec la logique de risque
        return creditRequestRepository.findByStatus(CreditStatus.PENDING_ANALYSIS)
                .stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }


    /**
     * ✅ Récupérer les crédits d'un client par email
     */
    @Override
    public List<CreditResponseDTO> getCreditRequestsByClientEmail(String email) {
        log.info("Getting credit requests for client email: {}", email);

        // Récupérer le client par email
        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found with email: " + email));

        // Récupérer les crédits du client
        List<CreditRequest> creditRequests = creditRequestRepository.findByClientId(client.getId());

        return creditRequests.stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * ✅ Récupérer les crédits d'un client par email et statut
     */
    @Override
    public List<CreditResponseDTO> getCreditRequestsByClientEmailAndStatus(String email, CreditStatus status) {
        log.info("Getting credit requests for client email: {} and status: {}", email, status);

        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found with email: " + email));

        // Récupérer les crédits du client avec un statut spécifique
        return creditRequestRepository.findByClientId(client.getId())
                .stream()
                .filter(cr -> cr.getStatus() == status)
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * ✅ Compter les crédits d'un client par email
     */
    @Override
    public long countCreditRequestsByClientEmail(String email) {
        log.info("Counting credit requests for client email: {}", email);

        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found with email: " + email));

        return creditRequestRepository.countByClientId(client.getId());
    }

    @Override
    public CreditRequest getCreditRequestEntityById(String id) {
        return creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit request not found with id: " + id));
    }
}