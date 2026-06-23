package com.govgps.config;

import com.govgps.model.*;
import com.govgps.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class DataLoader {
    @Bean
    @Profile("dev")
    CommandLineRunner loadData(GovServiceRepository serviceRepo,
                               WorkflowStepRepository workflowRepo,
                               DocumentRepository documentRepo,
                               RejectionReasonRepository rejectionRepo,
                               UserRepository userRepo) {
        return args -> {
            // Clean up existing default services and users to prevent duplicates
            serviceRepo.deleteDefaultServices();
            userRepo.deleteAdminUser();
            
            // sample service: Income Certificate
            if (serviceRepo.findAllByName("Income Certificate").isEmpty()) {
                GovService income = new GovService();
                income.setName("Income Certificate");
                income.setDescription("Apply for an income certificate for various needs.");
                income.setEstimatedDays(6);
                income.setDepartment("Revenue Department");
                serviceRepo.save(income);

                WorkflowStep s1 = new WorkflowStep();
                s1.setServiceId(income.getId());
                s1.setStepOrder(1);
                s1.setStepName("Verification");
                s1.setDepartment("Revenue Office");
                s1.setExpectedDays(2);
                s1.setDescription("Verify identity and address.");
                workflowRepo.save(s1);

                WorkflowStep s2 = new WorkflowStep();
                s2.setServiceId(income.getId());
                s2.setStepOrder(2);
                s2.setStepName("Approval");
                s2.setDepartment("Revenue Department");
                s2.setExpectedDays(3);
                s2.setDescription("Approve income statement.");
                workflowRepo.save(s2);

                Document d1 = new Document();
                d1.setServiceId(income.getId());
                d1.setDocumentName("Aadhaar");
                d1.setMandatory(true);
                documentRepo.save(d1);

                Document d2 = new Document();
                d2.setServiceId(income.getId());
                d2.setDocumentName("Salary Proof");
                d2.setMandatory(false);
                documentRepo.save(d2);

                RejectionReason r1 = new RejectionReason();
                r1.setServiceId(income.getId());
                r1.setReason("Missing Address Proof");
                rejectionRepo.save(r1);
            }

            // sample service: Shop License
            if (serviceRepo.findAllByName("Shop License").isEmpty()) {
                GovService shop = new GovService();
                shop.setName("Shop License");
                shop.setDescription("License to operate a shop in municipal limits.");
                shop.setEstimatedDays(10);
                shop.setDepartment("Municipal Office");
                serviceRepo.save(shop);

                WorkflowStep ss1 = new WorkflowStep();
                ss1.setServiceId(shop.getId());
                ss1.setStepOrder(1);
                ss1.setStepName("Application");
                ss1.setDepartment("Municipal Office");
                ss1.setExpectedDays(2);
                workflowRepo.save(ss1);

                Document sd1 = new Document();
                sd1.setServiceId(shop.getId());
                sd1.setDocumentName("Address Proof");
                sd1.setMandatory(true);
                documentRepo.save(sd1);
            }

            // admin user
            if (userRepo.findByEmail("admin@govgps.local").isEmpty()) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@govgps.local");
                admin.setPassword("admin");
                admin.setRole("ADMIN");
                userRepo.save(admin);
            }
        };
    }
}
