package com.govgps.controller;

import com.govgps.model.WorkflowStep;
import com.govgps.repository.WorkflowStepRepository;
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

@WebMvcTest(controllers = WorkflowController.class)
public class WorkflowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WorkflowStepRepository workflowStepRepository;

    @Test
    public void getWorkflow() throws Exception {
        WorkflowStep w = new WorkflowStep(); w.setId(1L); w.setServiceId(1L); w.setStepOrder(1); w.setStepName("Verification");
        Mockito.when(workflowStepRepository.findByServiceIdOrderByStepOrder(1L)).thenReturn(List.of(w));

        mockMvc.perform(get("/api/workflow/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }
}
