package com.govgps.controller;

import com.govgps.model.GovService;
import com.govgps.repository.GovServiceRepository;
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

@WebMvcTest(controllers = ServiceController.class)
public class ServiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GovServiceRepository govServiceRepository;

    @Test
    public void listServices() throws Exception {
        GovService s = new GovService(); s.setId(1L); s.setName("Income Certificate");
        Mockito.when(govServiceRepository.findAll()).thenReturn(List.of(s));

        mockMvc.perform(get("/api/services").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }
}
