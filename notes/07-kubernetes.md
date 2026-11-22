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

## Topic 48 — Kubernetes Networking

### 1. Kubernetes Networking Overview

Kubernetes allows Pods to communicate across different nodes (physical or virtual machines).

Main networking components:

- **CNI:** Provides Pod networking.
- **Service:** Provides stable access to Pods.
- **Ingress:** Defines HTTP/HTTPS routing rules.
- **Ingress Controller:** Implements those routing rules.
- **NetworkPolicy:** Controls allowed network traffic.

### 2. Docker vs Kubernetes Networking

Docker Bridge:

- Connects containers on the same Docker host.
- Containers can communicate using IP addresses.
- User-defined bridges support container-name DNS.
- Regular bridge networks do not span multiple hosts.

Docker Overlay:

- Connects containers across multiple Docker hosts.
- Commonly used with Docker Swarm.

Kubernetes:

- Each Pod gets its own cluster-network IP.
- Pods can communicate across nodes.
- A CNI-based networking implementation provides connectivity.

### 3. CNI — Container Network Interface

CNI is a standard interface used by container runtimes and networking plugins to configure container networking.

Examples:

- Calico
- Cilium
- Flannel

CNI plugins can provide:

- Pod IP assignment
- Pod network connectivity
- Cross-node communication

Example:

```text
Node 1                      Node 2
API Pod                     PostgreSQL Pod
10.244.1.5                  10.244.2.8
    |                            |
    +------ Pod Network ---------+
```

The API Pod can communicate directly with PostgreSQL using its Pod IP, assuming traffic is permitted.

A Kubernetes Service is **not** required for direct Pod-to-Pod connectivity.

### 4. Overlay Networking

An overlay network connects workloads across machines using an underlying network.

Example packet flow:

```text
API Pod
   |
   v
Node 1
   |
   | Encapsulate Pod packet
   v
Underlying Network
   |
   v
Node 2
   |
   | Decapsulate packet
   v
PostgreSQL Pod
```

- **Encapsulation:** Wrapping an original network packet inside another packet.
- **Decapsulation:** Removing the outer wrapper at the destination.

Important:

> Not all Kubernetes networking plugins use overlays. Some use direct routing.

### 5. Kubernetes Service

Problem:

Pods are disposable, and their IP addresses can change.

Solution:

A Service provides a stable network endpoint.

```text
API Pod
   |
   | postgres:5432
   v
PostgreSQL Service
   |
   v
PostgreSQL Pod
```

If PostgreSQL's Pod IP changes, the API still connects through the same Service name.

A Service:

- Provides stable DNS-based access.
- Selects Pods using labels.
- Tracks eligible Pod endpoints.
- Routes traffic to available endpoints.
- Does **not** create or replace Pods.

Important distinction:

```text
CNI     = Network connectivity
Service = Stable discovery and access
```

### 6. Kubernetes Service Types

#### ClusterIP

Default Service type.

- Exposes an application inside the cluster.
- Provides a stable internal virtual IP and DNS name.
- Suitable for databases and internal APIs.

Example:

```text
API Pod → postgres:5432 → PostgreSQL Pod
```

#### NodePort

Exposes a Service through a port on cluster nodes.

Example:

```text
Client → NodeIP:30080 → Service → API Pod
```

- Useful for testing and certain infrastructure setups.
- The receiving node does not need to host the target Pod.
- External reachability depends on networking and firewall rules.

#### LoadBalancer

Requests an external load balancer from supported infrastructure, commonly a cloud provider.

Example:

```text
Internet → External LB → Service → API Pods
```

- Useful for externally accessible applications.
- Requires infrastructure support.
- May incur additional cloud costs.
- Is not automatically available in every local cluster.

### 7. Ingress

Ingress defines HTTP/HTTPS routing rules.

Example:

```text
api.example.com   → API Service
admin.example.com → Admin Service
example.com       → Frontend Service
```

Ingress is a Kubernetes configuration resource. It does **not** process requests by itself.

An Ingress Controller implements the rules.

Example:

```text
Nginx Ingress Controller
```

Architecture:

```text
Internet
   |
   v
External Load Balancer
   |
   v
Ingress Controller
   |
   +---- api.example.com
   |          |
   |          v
   |      API Service
   |          |
   |      API Pods
   |
   +---- example.com
              |
              v
        Frontend Service
              |
         Frontend Pod
```

Backend Services can remain `ClusterIP`.

### 8. Ingress vs Nginx Reverse Proxy

Docker Compose:

We manually configured Nginx reverse proxy rules.

Example:

```nginx
proxy_pass http://api:3000;
```

Kubernetes:

We declare routing rules through Ingress resources.

The Ingress Controller reads those rules and configures the underlying proxy or traffic-routing implementation.

```text
Ingress            = Routing configuration
Ingress Controller = Traffic-routing implementation
```

Note:

> Gateway API is a newer Kubernetes networking API. Ingress is still supported, but its API is frozen.

### 9. HTTPS and TLS Termination

Example request:

```text
GET https://api.example.com/users
```

Flow:

```text
Browser
   |
   | HTTPS
   v
External Load Balancer
   |
   v
Ingress Controller
   |
   | TLS termination (in this example)
   v
API Service
   |
   | HTTP
   v
Node.js API Pod
```

The Ingress Controller:

- Uses a TLS certificate and private key.
- Handles the TLS connection.
- Decrypts incoming HTTPS traffic.
- Routes requests to the appropriate backend Service.

TLS certificates can be configured through Kubernetes TLS Secrets.

Internal traffic can use HTTP or HTTPS depending on the architecture and security requirements. TLS termination can also happen at other components depending on infrastructure configuration.

### 10. Frontend Deployment

Frontend applications can also run inside Kubernetes.

Example:

```text
Frontend Pod
   |
   └── Nginx Container
        └── Serves React build files
```

Typical architecture:

```text
Internet
   |
   v
Ingress Controller
   |
   +---- Frontend Service → Frontend Pod
   |
   +---- API Service → API Pods
```

Alternatives:

- Static React frontend hosted on a CDN.
- Frontend hosted on a static hosting platform.
- Server-rendered frontend deployed in Kubernetes.

A frontend does not have to run inside Kubernetes.

### 11. Pod Distribution Across Nodes

Three API replicas do **not** automatically mean three different nodes.

Possible:

```text
Node 1:
- API Pod 1
- API Pod 2
- API Pod 3
```

Also possible:

```text
Node 1 → API Pod 1
Node 2 → API Pod 2
Node 3 → API Pod 3
```

The Kubernetes Scheduler decides Pod placement based on resources and scheduling constraints.

For high availability, spreading replicas across different nodes is generally preferable.

Useful scheduling features:

- Pod anti-affinity
- Topology spread constraints

Without appropriate rules, Kubernetes does not guarantee one replica per node.

### 12. Node Failure and Network Recovery

Initial state:

```text
Node 1 → API Pod 1
Node 2 → API Pod 2
Node 3 → API Pod 3

Desired replicas: 3
```

Node 2 fails.

Kubernetes eventually detects the node failure.

Then:

1. The failed Pod stops being an eligible Service endpoint.
2. The Service continues routing to available ready Pods.
3. The ReplicaSet maintains the desired replica count.
4. A replacement Pod is created when appropriate.
5. The Scheduler chooses a healthy node with capacity.
6. The Kubelet starts the replacement Pod.
7. The Service includes the new Pod when it becomes ready.

No manual changes to Ingress or Service are needed.

Important:

- Readiness probes check application readiness.
- Node health detection identifies node failures.
- Service handles network traffic.
- ReplicaSet maintains Pod count.
- Scheduler chooses the node.
- Kubelet manages containers on that node.

Recovery may take time.

### 13. Complete Production Request Flow

```text
Browser
   |
   | HTTPS
   v
External Load Balancer
   |
   v
Ingress Controller
   |
   | TLS termination + HTTP routing
   v
marathon-api Service (ClusterIP)
   |
   +---- API Pod 1
   +---- API Pod 2
   +---- API Pod 3
             |
             v
      postgres Service
         (ClusterIP)
             |
             v
       PostgreSQL Pod
             |
             v
      Persistent Storage
```

The actual Pods may run on different nodes.

### 14. Interview-Ready Summary

Kubernetes networking enables communication between Pods across nodes using a networking implementation configured through CNI.

Each Pod receives an IP address, but Pod IPs are ephemeral. Kubernetes Services provide stable network endpoints and route traffic to eligible Pods.

ClusterIP provides internal access, NodePort exposes a port on cluster nodes, and LoadBalancer integrates with external load-balancing infrastructure.

Ingress defines HTTP/HTTPS routing rules, while an Ingress Controller implements those rules and can perform TLS termination.

Kubernetes can automatically update Service endpoints as Pods are created, replaced, or removed.

### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
