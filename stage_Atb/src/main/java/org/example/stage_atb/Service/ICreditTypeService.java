package org.example.stage_atb.Service;

import org.example.stage_atb.dto.response.CreditTypeResponseDTO;
import org.example.stage_atb.entity.CreditType;

import java.util.List;

public interface ICreditTypeService {

    /**
     * Récupère tous les types de crédit actifs
     */
    List<CreditTypeResponseDTO> getActiveCreditTypes();

    /**
     * Récupère un type de crédit par son ID
     */
    CreditTypeResponseDTO getCreditTypeById(String id);

    /**
     * Récupère l'entité CreditType par son ID
     */
    CreditType getCreditTypeEntity(String id);

    /**
     * Récupère un type de crédit avec ses paramètres
     */
    CreditTypeResponseDTO getCreditTypeWithParams(String id);

    /**
     * Valide le montant pour un type de crédit
     */
    boolean validateAmount(String creditTypeId, Double amount);

    /**
     * Valide la durée pour un type de crédit
     */
    boolean validateDuration(String creditTypeId, Integer durationMonths);

    /**
     * Récupère les durées disponibles pour un type de crédit
     */
    List<Integer> getAvailableDurations(String creditTypeId);

    /**
     * Récupère les documents requis pour un type de crédit
     */
    List<String> getRequiredDocuments(String creditTypeId);
}