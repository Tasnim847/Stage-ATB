package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.CreditRequestRepository;
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
import org.example.stage_atb.enums.UserRole;
import org.example.stage_atb.Mappers.CreditRequestMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final ICreditSimulationService creditSimulationService;

    // ============================================
    // CRUD DE BASE
    // ============================================

    @Override
    public CreditResponseDTO createCreditRequest(CreditRequestDTO creditRequestDTO) {
        log.info("Creating credit request for client: {}", creditRequestDTO.getClientId());

        User currentUser = userService.getCurrentUser();

        CreditRequest creditRequest = creditRequestMapper.toEntity(
                creditRequestDTO,
                clientRepository,
                userRepository
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

    // ============================================
    // STATISTIQUES
    // ============================================

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
        return creditRequestRepository.findByStatus(CreditStatus.PENDING_ANALYSIS)
                .stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ============================================
    // MÉTHODES POUR CLIENT (par email)
    // ============================================

    @Override
    public List<CreditResponseDTO> getCreditRequestsByClientEmail(String email) {
        log.info("Getting credit requests for client email: {}", email);

        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found with email: " + email));

        List<CreditRequest> creditRequests = creditRequestRepository.findByClientId(client.getId());

        return creditRequests.stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CreditResponseDTO> getCreditRequestsByClientEmailAndStatus(String email, CreditStatus status) {
        log.info("Getting credit requests for client email: {} and status: {}", email, status);

        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found with email: " + email));

        return creditRequestRepository.findByClientId(client.getId())
                .stream()
                .filter(cr -> cr.getStatus() == status)
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long countCreditRequestsByClientEmail(String email) {
        log.info("Counting credit requests for client email: {}", email);

        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found with email: " + email));

        return creditRequestRepository.countByClientId(client.getId());
    }

    // ============================================
    // MÉTHODES POUR CONSEILLER (ADVISOR)
    // ============================================

    @Override
    public List<CreditResponseDTO> getCreditRequestsByAdvisorEmail(String advisorEmail) {
        log.info("Getting credit requests for advisor email: {}", advisorEmail);

        // Récupérer le conseiller (User) par email
        User advisor = userRepository.findByEmail(advisorEmail)
                .orElseThrow(() -> new RuntimeException("Advisor not found with email: " + advisorEmail));

        return getCreditRequestsByAdvisorId(advisor.getId());
    }

    @Override
    public List<CreditResponseDTO> getCreditRequestsByAdvisorId(String advisorId) {
        log.info("Getting credit requests for advisor id: {}", advisorId);

        // Récupérer tous les clients de ce conseiller
        List<Client> clients = clientRepository.findByAdvisorId(advisorId);

        // Récupérer toutes les demandes de crédit des clients du conseiller
        List<CreditRequest> creditRequests = new ArrayList<>();
        for (Client client : clients) {
            creditRequests.addAll(creditRequestRepository.findByClientId(client.getId()));
        }

        // Trier par date de création (plus récent en premier)
        creditRequests.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        return creditRequests.stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CreditResponseDTO> getCreditRequestsByAdvisorAndStatus(String advisorEmail, CreditStatus status) {
        log.info("Getting credit requests for advisor email: {} and status: {}", advisorEmail, status);

        User advisor = userRepository.findByEmail(advisorEmail)
                .orElseThrow(() -> new RuntimeException("Advisor not found with email: " + advisorEmail));

        List<Client> clients = clientRepository.findByAdvisorId(advisor.getId());

        List<CreditRequest> creditRequests = new ArrayList<>();
        for (Client client : clients) {
            creditRequests.addAll(
                    creditRequestRepository.findByClientId(client.getId())
                            .stream()
                            .filter(cr -> cr.getStatus() == status)
                            .collect(Collectors.toList())
            );
        }

        return creditRequests.stream()
                .map(creditRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long countCreditRequestsByAdvisor(String advisorEmail) {
        log.info("Counting credit requests for advisor email: {}", advisorEmail);

        User advisor = userRepository.findByEmail(advisorEmail)
                .orElseThrow(() -> new RuntimeException("Advisor not found with email: " + advisorEmail));

        List<Client> clients = clientRepository.findByAdvisorId(advisor.getId());

        long count = 0;
        for (Client client : clients) {
            count += creditRequestRepository.countByClientId(client.getId());
        }

        return count;
    }

    // ============================================
    // MÉTHODES DE TRANSMISSION
    // ============================================

    @Override
    public CreditResponseDTO transmitToAnalyst(String creditRequestId, String notes) {
        return transmitToAnalyst(creditRequestId, notes, false);
    }

    @Override
    public CreditResponseDTO transmitToAnalyst(String creditRequestId, String notes, boolean forceTransmit) {
        log.info("Transmitting credit request {} to analyst. Notes: {}, Force: {}", creditRequestId, notes, forceTransmit);

        CreditRequest creditRequest = creditRequestRepository.findById(creditRequestId)
                .orElseThrow(() -> new RuntimeException("Credit request not found with id: " + creditRequestId));

        // Vérifier que la demande est en état DRAFT ou PENDING_DOCUMENTS
        if (creditRequest.getStatus() != CreditStatus.DRAFT &&
                creditRequest.getStatus() != CreditStatus.PENDING_DOCUMENTS) {
            throw new IllegalStateException(
                    "La demande doit être en état 'Brouillon' ou 'Documents manquants' pour être transmise. Statut actuel: " + creditRequest.getStatus()
            );
        }

        // Vérifier que tous les documents obligatoires sont présents (sauf si forceTransmit)
        if (!forceTransmit) {
            List<String> missingDocs = getMissingDocumentsForTransmission(creditRequestId);
            if (!missingDocs.isEmpty()) {
                throw new IllegalStateException(
                        "Tous les documents obligatoires ne sont pas présents. Documents manquants: " + String.join(", ", missingDocs)
                );
            }
        }

        // Changer le statut
        creditRequest.setStatus(CreditStatus.PENDING_ANALYSIS);
        creditRequest.setUpdatedAt(LocalDateTime.now());

        CreditRequest savedRequest = creditRequestRepository.save(creditRequest);
        log.info("Credit request {} transmitted to analyst successfully", creditRequestId);

        return creditRequestMapper.toResponseDTO(savedRequest);
    }

    @Override
    public boolean canTransmitToAnalyst(String creditRequestId) {
        try {
            CreditRequest creditRequest = creditRequestRepository.findById(creditRequestId)
                    .orElseThrow(() -> new RuntimeException("Credit request not found"));

            // Vérifier le statut
            if (creditRequest.getStatus() != CreditStatus.DRAFT &&
                    creditRequest.getStatus() != CreditStatus.PENDING_DOCUMENTS) {
                return false;
            }

            // Vérifier les documents
            List<String> missingDocs = getMissingDocumentsForTransmission(creditRequestId);
            return missingDocs.isEmpty();

        } catch (Exception e) {
            log.error("Error checking if credit request can be transmitted: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public List<String> getMissingDocumentsForTransmission(String creditRequestId) {
        // TODO: Implémenter la vérification des documents obligatoires
        // Cette méthode devrait interroger le DocumentService pour vérifier
        // si tous les documents obligatoires sont présents
        log.info("Checking missing documents for credit request: {}", creditRequestId);

        // Pour l'instant, retourner une liste vide (tous les documents sont présents)
        return new ArrayList<>();
    }

    // ============================================
    // MÉTHODES D'ANNULATION
    // ============================================

    @Override
    public CreditResponseDTO cancelCreditRequest(String id) {
        log.info("Cancelling credit request: {}", id);

        CreditRequest creditRequest = creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit request not found with id: " + id));

        // Vérifier que la demande est en attente
        if (creditRequest.getStatus() != CreditStatus.PENDING_ANALYSIS &&
                creditRequest.getStatus() != CreditStatus.UNDER_REVIEW &&
                creditRequest.getStatus() != CreditStatus.DRAFT) {
            throw new IllegalStateException(
                    "Seules les demandes en état 'Brouillon', 'En attente' ou 'En révision' peuvent être annulées. Statut actuel: " + creditRequest.getStatus()
            );
        }

        creditRequest.setStatus(CreditStatus.CANCELLED);
        creditRequest.setRejectionReason("Annulé par le client");
        creditRequest.setUpdatedAt(LocalDateTime.now());

        CreditRequest saved = creditRequestRepository.save(creditRequest);
        log.info("Credit request {} cancelled successfully", id);

        return creditRequestMapper.toResponseDTO(saved);
    }

    @Override
    public CreditResponseDTO cancelCreditRequestByAdvisor(String id, String reason) {
        log.info("Cancelling credit request {} by advisor. Reason: {}", id, reason);

        CreditRequest creditRequest = creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit request not found with id: " + id));

        // Vérifier que la demande peut être annulée
        if (creditRequest.getStatus() != CreditStatus.PENDING_ANALYSIS &&
                creditRequest.getStatus() != CreditStatus.UNDER_REVIEW &&
                creditRequest.getStatus() != CreditStatus.DRAFT) {
            throw new IllegalStateException(
                    "Seules les demandes en état 'Brouillon', 'En attente' ou 'En révision' peuvent être annulées. Statut actuel: " + creditRequest.getStatus()
            );
        }

        creditRequest.setStatus(CreditStatus.CANCELLED);
        creditRequest.setRejectionReason("Annulé par le conseiller: " + (reason != null ? reason : "Non spécifié"));
        creditRequest.setUpdatedAt(LocalDateTime.now());

        CreditRequest saved = creditRequestRepository.save(creditRequest);
        log.info("Credit request {} cancelled by advisor successfully", id);

        return creditRequestMapper.toResponseDTO(saved);
    }

    // ============================================
    // MÉTHODES UTILITAIRES
    // ============================================

    @Override
    public CreditRequest getCreditRequestEntityById(String id) {
        return creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit request not found with id: " + id));
    }

    @Override
    public boolean isAdvisorOwnerOfCreditRequest(String advisorEmail, String creditRequestId) {
        try {
            CreditRequest creditRequest = creditRequestRepository.findById(creditRequestId)
                    .orElseThrow(() -> new RuntimeException("Credit request not found"));

            Client client = creditRequest.getClient();
            if (client == null || client.getAdvisor() == null) {
                return false;
            }

            return client.getAdvisor().getEmail().equals(advisorEmail);
        } catch (Exception e) {
            log.error("Error checking advisor ownership: {}", e.getMessage());
            return false;
        }
    }
}