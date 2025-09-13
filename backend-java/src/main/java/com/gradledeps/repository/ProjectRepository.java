package com.gradledeps.repository;

import com.gradledeps.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    List<Project> findByNameContainingIgnoreCase(String name);
    List<Project> findByCreatedById(String createdById);
}