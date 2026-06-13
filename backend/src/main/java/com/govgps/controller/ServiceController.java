package com.govgps.controller;

import com.govgps.model.GovService;
import com.govgps.repository.GovServiceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {
    private final GovServiceRepository govServiceRepository;

    public ServiceController(GovServiceRepository govServiceRepository) {
        this.govServiceRepository = govServiceRepository;
    }

    @GetMapping
    public List<GovService> list() {
        return govServiceRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GovService> get(@PathVariable Long id) {
        return govServiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(params = "query")
    public List<GovService> search(@RequestParam String query) {
        // simple case-insensitive name contains search
        return govServiceRepository.findAll().stream()
                .filter(s -> s.getName() != null && s.getName().toLowerCase().contains(query.toLowerCase()))
                .toList();
    }

    @PostMapping
    public GovService create(@RequestBody GovService service) {
        return govServiceRepository.save(service);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GovService> update(@PathVariable Long id, @RequestBody GovService svc) {
        return govServiceRepository.findById(id).map(existing -> {
            existing.setName(svc.getName());
            existing.setDescription(svc.getDescription());
            existing.setEstimatedDays(svc.getEstimatedDays());
            existing.setDepartment(svc.getDepartment());
            govServiceRepository.save(existing);
            return ResponseEntity.ok(existing);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!govServiceRepository.existsById(id)) return ResponseEntity.notFound().build();
        govServiceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
