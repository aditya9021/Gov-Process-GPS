package com.govgps.controller;

import com.govgps.model.Document;
import com.govgps.repository.DocumentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    private final DocumentRepository documentRepository;

    public DocumentController(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @GetMapping("/{serviceId}")
    public List<Document> getDocuments(@PathVariable Long serviceId) {
        return documentRepository.findByServiceId(serviceId);
    }

    @PostMapping
    public Document createDocument(@RequestBody Document document) {
        return documentRepository.save(document);
    }
}
