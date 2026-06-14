package com.govgps;

import com.govgps.model.GovService;
import com.govgps.model.WorkflowStep;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class BackendIntegrationTest {

    @LocalServerPort
    int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String url(String path) { return "http://localhost:" + port + path; }

    @Test
    public void testHealth() {
        ResponseEntity<String> r = restTemplate.getForEntity(url("/api/health"), String.class);
        Assertions.assertEquals(200, r.getStatusCodeValue());
        Assertions.assertEquals("OK", r.getBody());
    }

    @Test
    public void testServicesAndWorkflowAndDocuments() {
        ResponseEntity<GovService[]> r = restTemplate.getForEntity(url("/api/services"), GovService[].class);
        Assertions.assertEquals(200, r.getStatusCodeValue());
        Assertions.assertTrue(r.getBody().length >= 1);

        Long id = r.getBody()[0].getId();

        ResponseEntity<WorkflowStep[]> w = restTemplate.getForEntity(url("/api/workflow/" + id), WorkflowStep[].class);
        Assertions.assertEquals(200, w.getStatusCodeValue());

        ResponseEntity<Object[]> docs = restTemplate.getForEntity(url("/api/documents/" + id), Object[].class);
        Assertions.assertEquals(200, docs.getStatusCodeValue());
    }

    @Test
    public void testBookmarksAndProgress() {
        // create a bookmark for demo userId=1 and serviceId=1
        Map<String, Object> body = Map.of("userId", 1, "serviceId", 1);
        ResponseEntity<Map> create = restTemplate.postForEntity(url("/api/bookmarks"), body, Map.class);
        Assertions.assertEquals(200, create.getStatusCodeValue());

        ResponseEntity<Object[]> list = restTemplate.getForEntity(url("/api/bookmarks/1"), Object[].class);
        Assertions.assertTrue(list.getBody().length >= 1);

        Map<String, Object> progress = Map.of("userId", 1, "serviceId", 1, "completedStep", 1, "status", "IN_PROGRESS");
        ResponseEntity<Map> pcreate = restTemplate.postForEntity(url("/api/progress"), progress, Map.class);
        Assertions.assertEquals(200, pcreate.getStatusCodeValue());

        ResponseEntity<Object[]> plist = restTemplate.getForEntity(url("/api/progress/1"), Object[].class);
        Assertions.assertTrue(plist.getBody().length >= 1);
    }
}
