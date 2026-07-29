package org.example.stage_atb.Service;

import org.example.stage_atb.entity.CreditType;
import org.example.stage_atb.dto.response.CreditTypeResponseDTO;

import java.util.List;

public interface ICreditTypeService {

    List<CreditTypeResponseDTO> getActiveCreditTypes();

    CreditTypeResponseDTO getCreditTypeById(String id);

    CreditType getCreditTypeEntity(String id);

    CreditTypeResponseDTO getCreditTypeWithParams(String id);

    boolean validateAmount(String creditTypeId, Double amount);

    boolean validateDuration(String creditTypeId, Integer durationMonths);

    List<Integer> getAvailableDurations(String creditTypeId);

    List<String> getRequiredDocuments(String creditTypeId);
}