## Topic:

## Topic 46 — Kubernetes Fundamentals

### 1. What Is Kubernetes?

Kubernetes (K8s) is a container orchestration platform.

It manages containerized applications across one or more machines.

- **Docker:** Runs containers.
- **Docker Compose:** Manages multiple containers, primarily on one machine.
- **Kubernetes:** Manages application workloads across a cluster of machines.

Why Kubernetes?

- Container orchestration
- Self-healing
- Multi-node deployment
- Service discovery
- Load balancing
- Rolling updates
- Horizontal scaling
- Desired-state management

Kubernetes is not always necessary. Docker Compose may be sufficient for small applications.

### 2. Kubernetes Architecture

```text
Cluster
│
├── Control Plane
│   └── Manages the cluster
│
├── Worker Node 1
│   ├── Pod 1 → API container
│   └── Pod 2 → API container
│
└── Worker Node 2
    ├── Pod 3 → API container
    └── Pod 4 → PostgreSQL container
```

- **Cluster:** A group of physical or virtual machines managed by Kubernetes. A cluster can also have only one node.
- **Node:** A physical or virtual machine participating in the cluster. One node can run multiple Pods.
- **Pod:** The smallest deployable unit in Kubernetes. It contains one or more tightly coupled containers.
- **Container:** Runs an application process.

Hierarchy:

```text
Cluster → Node → Pod → Container
```

### 3. Pods vs Containers

A Pod is **not** the same thing as a container.

A container runs an application. A Pod provides the shared environment in which its containers run.

Most Pods contain one application container:

```text
Pod 1
└── Node.js API container
```

A Pod can contain multiple containers:

```text
Pod 2
├── Node.js API container
└── Logging sidecar container
```

Containers inside the same Pod:

- Share a network namespace and IP address.
- Can communicate through `localhost`.
- Can share configured storage volumes.
- Are scheduled together on the same node.

A Pod can contain different programs, but they should be tightly coupled. Independent services should normally use separate Pods.

### 4. Application Replicas

Suppose we need three Node.js API replicas.

Correct:

```text
Pod 1 → Node.js API
Pod 2 → Node.js API
Pod 3 → Node.js API
```

Each Pod runs the same application image.

Incorrect for ordinary API scaling:

```text
Pod 1
├── Node.js API 1
├── Node.js API 2
└── Node.js API 3
```

Why?

Pods are the unit of scheduling and scaling.

If a Pod template contains three containers and we request three Pod replicas:

```text
3 Pods × 3 containers = 9 containers
```

Important:

> A Pod replica is a separate Pod instance created from the same template. One Pod instance cannot run on two nodes simultaneously.

### 5. Desired State and Reconciliation

Kubernetes follows a declarative model. Instead of manually managing every container, we declare the desired state.

Example:

```yaml
replicas: 3
```

This means we want three API Pods.

Kubernetes continuously compares:

```text
Desired state vs Actual state
```

Example:

```text
Desired: 3 Pods
Actual: 2 Pods
```

Kubernetes detects the difference and attempts to create a replacement Pod.

This process is called reconciliation. Controllers maintain desired state. A Deployment is commonly used to maintain stateless application replicas.

### 6. Container Failure vs Node Failure

#### Scenario A — Container crashes

```text
Node 1
└── Pod 1
    └── API container crashes
```

The kubelet normally restarts the container inside the existing Pod, according to its restart policy. A new Pod is not necessarily required.

#### Scenario B — Entire node fails

Before:

```text
Node 1 → Pod 1
Node 2 → Pod 2
Node 3 → Pod 3
```

Node 2 fails. Now only two API replicas are available.

A Deployment controller can create a replacement Pod, which Kubernetes schedules onto a healthy node. The old Pod is not physically moved; a new Pod is created from the Pod template.

Recovery is not necessarily instantaneous.

### 7. What If All Healthy Nodes Are Full?

```text
Desired replicas: 3
Available replicas: 2

Node 1 → Full
Node 2 → Failed
Node 3 → Full
```

Kubernetes attempts to create another Pod, but the scheduler cannot find a node with sufficient available resources.

Result:

> The replacement Pod remains `Pending`.

`Pending` means the Pod exists but is not yet running.

Possible solutions:

- Add worker nodes.
- Free resources.
- Increase node capacity.
- Use Cluster Autoscaler where supported.

Important:

> Kubernetes cannot create CPU or RAM out of nothing.

### 8. Kubernetes vs Docker Compose

Docker Compose:

- Manages multi-container applications.
- Supports restart policies.
- Supports service discovery and networking.
- Supports manually configured replicas.
- Primarily operates on a single Docker host.

Kubernetes:

- Manages workloads across multiple nodes.
- Maintains desired replica counts.
- Replaces failed Pods.
- Reschedules workloads after node failures.
- Supports rolling deployments and autoscaling.
- Provides cluster-wide service discovery.

### 9. Key Terms

- **Cluster:** Group of machines managed by Kubernetes.
- **Control Plane:** Components responsible for cluster management.
- **Worker Node:** Machine that runs application Pods.
- **Pod:** Smallest deployable unit containing one or more containers.
- **Replica:** An independent Pod created from the same template.
- **Deployment:** Controller that manages application Pods and their replicas.
- **Kubelet:** Node agent responsible for managing Pods and containers.
- **Scheduler:** Selects suitable nodes for unscheduled Pods.
- **Desired State:** The configuration we want Kubernetes to maintain.
- **Reconciliation:** Continuously correcting differences between desired and actual state.
- **Pending:** Pod is not yet running; one possible reason is insufficient scheduling capacity.

### 10. Interview-Ready Summary

Kubernetes is a container orchestration platform that manages applications across a cluster of machines.

A cluster contains nodes, nodes run Pods, and Pods contain one or more containers.

Kubernetes uses a declarative desired-state model. Controllers continuously reconcile actual state with the requested configuration.

If a container crashes, the kubelet can restart it. If a node fails, Kubernetes can create replacement Pods on healthy nodes, provided sufficient resources are available.

This enables self-healing, scaling, and more reliable application deployment.

Next:

> Topic 47 — Pods, Deployments, and Services.

## Topic 47 — Pods, Deployments, ReplicaSets & Services

### 1. Pod

- Smallest deployable unit in Kubernetes.
- Contains one or more containers.
- Each Pod runs on one node at a time.
- Pods are disposable; replacements may have different IPs.

### 2. Deployment

- Declares the desired application configuration.
- Manages ReplicaSets.
- Supports scaling, rolling updates, and rollbacks.
- Example: `replicas: 3` means maintain three API Pods.

### 3. ReplicaSet

- Maintains the desired number of matching Pods.
- If a Pod is deleted, creates a replacement.
- Managed by a Deployment in normal applications.

```text
Deployment → ReplicaSet → Pods → Containers
```

### 4. Rolling Updates

- Deployment gradually replaces old Pods with new ones.
- Readiness checks help determine whether new Pods are ready to receive traffic.
- A failed rollout may stall.
- Automatic rollback is not guaranteed.

### 5. Kubernetes Service

- Provides a stable DNS name and network endpoint.
- Routes traffic to matching, ready Pod endpoints.
- Automatically tracks Pods as they are replaced.
- Does not create Pods or manage replicas.

```text
Nginx → Service → API Pods
```

### 6. Scaling

```text
Deployment replicas: 3 → 5
```

- ReplicaSet creates two additional Pods.
- Scheduler assigns Pods to suitable nodes.
- Insufficient capacity → Pods remain `Pending`.
- Available capacity → Pods can start running.
- Service automatically includes new ready Pods.
- No manual Nginx IP configuration is needed.

### 7. Responsibilities

- **Deployment:** Application updates and desired configuration.
- **ReplicaSet:** Maintains Pod count.
- **Scheduler:** Assigns Pods to nodes.
- **Kubelet:** Runs and monitors Pods on nodes.
- **Service:** Provides stable network access to Pods.

### Interview Summary

A Deployment manages application rollout and scaling through ReplicaSets, which maintain the desired number of Pods. A Kubernetes Service provides stable networking and routes traffic to available Pod endpoints, even when Pods are replaced or scaled.

### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
