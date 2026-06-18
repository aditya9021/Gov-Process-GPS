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
    public ResponseEntity<GovService> get(@PathVariable("id") Long id) {
        return govServiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(params = "query")
    public List<GovService> search(@RequestParam("query") String query) {
        String q = query.trim().toLowerCase();
        if (q.isBlank()) {
            return govServiceRepository.findAll();
        }
        
        var scored = govServiceRepository.findAll().stream()
                .map(s -> new Object() {
                    final GovService service = s;
                    final int score = calculateScore(s, q);
                })
                .sorted((a, b) -> Integer.compare(b.score, a.score))
                .toList();
        
        // If matches found (any with score > 0), return only matched results
        var matched = scored.stream()
                .filter(item -> item.score > 0)
                .map(item -> item.service)
                .toList();
        
        // Return only matched results (empty list if no matches)
        return matched;
    }

    private int calculateScore(GovService service, String query) {
        if (query.isBlank()) {
            return 0;
        }
        String name = service.getName() != null ? service.getName().toLowerCase() : "";
        String description = service.getDescription() != null ? service.getDescription().toLowerCase() : "";
        String department = service.getDepartment() != null ? service.getDepartment().toLowerCase() : "";

        int score = 0;
        
        // Exact name match
        if (name.equals(query)) {
            score += 100;
        }
        // Name starts with query
        else if (name.startsWith(query)) {
            score += 50;
        }
        // Query contains as whole word in name
        else if (matchesWord(name, query)) {
            score += 40;
        }
        // Name contains query as substring
        else if (name.contains(query)) {
            score += 20;
        }
        
        // Word-based matching: check if any word in query matches any word in name
        String[] queryWords = query.split("\\s+");
        for (String word : queryWords) {
            if (name.contains(word)) {
                score += 15;
            }
            if (description.contains(word)) {
                score += 8;
            }
            if (department.contains(word)) {
                score += 3;
            }
        }
        
        // Description contains query
        if (description.contains(query)) {
            score += 10;
        }
        
        // Department contains query
        if (department.contains(query)) {
            score += 5;
        }
        
        return score;
    }
    
    private boolean matchesWord(String text, String word) {
        String[] words = text.split("\\s+");
        for (String w : words) {
            if (w.equals(word) || w.startsWith(word)) {
                return true;
            }
        }
        return false;
    }

    @PostMapping
    public GovService create(@RequestBody GovService service) {
        return govServiceRepository.save(service);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GovService> update(@PathVariable("id") Long id, @RequestBody GovService svc) {
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
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        if (!govServiceRepository.existsById(id)) return ResponseEntity.notFound().build();
        govServiceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
