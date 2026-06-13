package com.govgps.controller;

import com.govgps.model.RejectionReason;
import com.govgps.repository.RejectionReasonRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rejections")
public class RejectionReasonController {
    private final RejectionReasonRepository rejectionReasonRepository;

    public RejectionReasonController(RejectionReasonRepository rejectionReasonRepository) {
        this.rejectionReasonRepository = rejectionReasonRepository;
    }

    @GetMapping("/{serviceId}")
    public List<RejectionReason> getReasons(@PathVariable Long serviceId) {
        return rejectionReasonRepository.findByServiceId(serviceId);
    }
}
