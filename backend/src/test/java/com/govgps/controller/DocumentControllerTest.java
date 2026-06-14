package com.govgps.controller;

import com.govgps.model.Document;
import com.govgps.repository.DocumentRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.hamcrest.Matchers.hasSize;

@WebMvcTest(controllers = DocumentController.class)
public class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DocumentRepository documentRepository;

    @Test
    public void getDocuments() throws Exception {
        Document d = new Document(); d.setId(1L); d.setServiceId(1L); d.setDocumentName("Aadhaar");
        Mockito.when(documentRepository.findByServiceId(1L)).thenReturn(List.of(d));

        mockMvc.perform(get("/api/documents/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }
}
