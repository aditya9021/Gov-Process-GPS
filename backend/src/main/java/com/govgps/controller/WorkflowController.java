package com.govgps.controller;

import com.govgps.model.WorkflowStep;
import com.govgps.repository.WorkflowStepRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflow")
public class WorkflowController {
    private final WorkflowStepRepository workflowStepRepository;

    public WorkflowController(WorkflowStepRepository workflowStepRepository) {
        this.workflowStepRepository = workflowStepRepository;
    }

    @GetMapping("/{serviceId}")
    public List<WorkflowStep> getWorkflow(@PathVariable("serviceId") Long serviceId) {
        return workflowStepRepository.findByServiceIdOrderByStepOrder(serviceId);
    }

    @PostMapping
    public WorkflowStep createStep(@RequestBody WorkflowStep step) {
        // In a real app validate service exists and stepOrder uniqueness
        return workflowStepRepository.save(step);
    }
}
