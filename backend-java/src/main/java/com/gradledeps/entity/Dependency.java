package com.gradledeps.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "dependencies")
@EntityListeners(AuditingEntityListener.class)
public class Dependency {
    
    @Id
    @Column(name = "id")
    private String id;
    
    @Column(name = "component_id", nullable = false)
    private String componentId;
    
    @Column(name = "group_id", nullable = false, columnDefinition = "TEXT")
    private String groupId;
    
    @Column(name = "artifact_id", nullable = false, columnDefinition = "TEXT")
    private String artifactId;
    
    @Column(name = "version", nullable = false, columnDefinition = "TEXT")
    private String version;
    
    @Column(name = "scope", nullable = false, columnDefinition = "TEXT")
    private String scope;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "added_by", nullable = false)
    private String addedById;
    
    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id", insertable = false, updatable = false)
    private Component component;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by", insertable = false, updatable = false)
    private User addedBy;
    
    // Constructors
    public Dependency() {}
    
    public Dependency(String componentId, String groupId, String artifactId, 
                     String version, String scope, String description, String addedById) {
        this.componentId = componentId;
        this.groupId = groupId;
        this.artifactId = artifactId;
        this.version = version;
        this.scope = scope;
        this.description = description;
        this.addedById = addedById;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getComponentId() { return componentId; }
    public void setComponentId(String componentId) { this.componentId = componentId; }
    
    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }
    
    public String getArtifactId() { return artifactId; }
    public void setArtifactId(String artifactId) { this.artifactId = artifactId; }
    
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    
    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getAddedById() { return addedById; }
    public void setAddedById(String addedById) { this.addedById = addedById; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Component getComponent() { return component; }
    public void setComponent(Component component) { this.component = component; }
    
    public User getAddedBy() { return addedBy; }
    public void setAddedBy(User addedBy) { this.addedBy = addedBy; }
}