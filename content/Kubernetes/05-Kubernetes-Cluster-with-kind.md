---
showOnIndexPage: true
draft: true
date: 2025-12-10
title: Kubernetes Cluster with kind
image: Kubernetes.png
description: Create a Kubernetes cluster with kind
tags:
  - Kubernetes
---

## References

[kind](https://kind.sigs.k8s.io/)

## Create Cluster

~~~
> kind.exe create cluster --name mycluster --config kind-cluster.yaml
Creating cluster "mycluster" ...
 ✓ Ensuring node image (kindest/node:v1.34.0) 🖼
 ✓ Preparing nodes 📦 📦 📦 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
 ✓ Joining worker nodes 🚜
Set kubectl context to "kind-mycluster"
You can now use your cluster with:

kubectl cluster-info --context kind-mycluster

Have a question, bug, or feature request? Let us know! https://kind.sigs.k8s.io/#community 🙂
~~~

### Cluster configuration file kind-cluster.yaml

~~~yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 9090
  - role: worker
  - role: worker
  - role: worker
~~~

### Verify cluster was created

~~~
> kubectl cluster-info --context kind-mycluster
Kubernetes control plane is running at https://127.0.0.1:63811
CoreDNS is running at https://127.0.0.1:63811/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
~~~

### Verify nodes were created

~~~
> kubectl get nodes -o wide
NAME                      STATUS   ROLES           AGE   VERSION   INTERNAL-IP   EXTERNAL-IP   OS-IMAGE                         KERNEL-VERSION                     CONTAINER-RUNTIME
mycluster-control-plane   Ready    control-plane   95s   v1.34.0   172.20.0.3    <none>        Debian GNU/Linux 12 (bookworm)   6.6.87.2-microsoft-standard-WSL2   containerd://2.1.3
mycluster-worker          Ready    <none>          77s   v1.34.0   172.20.0.5    <none>        Debian GNU/Linux 12 (bookworm)   6.6.87.2-microsoft-standard-WSL2   containerd://2.1.3
mycluster-worker2         Ready    <none>          77s   v1.34.0   172.20.0.2    <none>        Debian GNU/Linux 12 (bookworm)   6.6.87.2-microsoft-standard-WSL2   containerd://2.1.3
mycluster-worker3         Ready    <none>          77s   v1.34.0   172.20.0.4    <none>        Debian GNU/Linux 12 (bookworm)   6.6.87.2-microsoft-standard-WSL2   containerd://2.1.3
~~~


## Create deployment

~~~
> kubectl apply -f nginx-deployment.yaml
deployment.apps/nginx-deployment created
~~~

### Deployment configuration file

~~~yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx-deployment # Label of the Deployment
spec:
  replicas: 4
  selector:
    matchLabels:
      app: nginx-pods # Which Pods should be handled by this ReplicaSet
  template:
    metadata:
      labels:
        app: nginx-pods # Label of the Pods which is used by ReplicaSet and ClusterIP Service
    spec:
      containers:
      - name: nginx-container # Name of the container
        image: nginx:latest # Image name and version
        ports:
        - containerPort: 80 # Exposed port from the container
        volumeMounts:
        - name: local-volume # Name of the volumeMount to use in the container
          mountPath: /usr/share/nginx/html # The mountpoint inside the container
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
      - name: netshoot-container # SideCar container for network analyzes
        image: nicolaka/netshoot
        volumeMounts:
        - name: local-volume
          mountPath: /html
        command: [ "sleep" ] # Sleep infinite, because only shell access
                             # should be possible
        args: [ "infinity" ]
        resources:
          requests:
            memory: "32Mi"
            cpu: "100m"
          limits:
            memory: "64Mi"
            cpu: "200m"
      initContainers:
      - name: init-container # InitContainer for creating /html/index.html
        image: busybox
        volumeMounts:
        - name: local-volume
          mountPath: /html
        command: ["/bin/sh", "-c"]
        args:
          - hostname > /html/index.html; sleep 5;
      volumes:
      - name: local-volume # for each Pod local volumne, is initialized by InitContainer
        emptyDir: {}  # Empty directory within each Pod;
                      # shared directory over all containers within the same pod
~~~

### Verify pods were created

~~~
> kubectl get pods -o wide
NAME                                READY   STATUS    RESTARTS   AGE   IP           NODE                NOMINATED NODE   READINESS GATES
nginx-deployment-6dc9cb9b49-8b565   2/2     Running   0          86s   10.244.1.2   mycluster-worker3   <none>           <none>
nginx-deployment-6dc9cb9b49-98v24   2/2     Running   0          86s   10.244.4.3   mycluster-worker2   <none>           <none>
nginx-deployment-6dc9cb9b49-kf9cf   2/2     Running   0          86s   10.244.3.2   mycluster-worker    <none>           <none>
nginx-deployment-6dc9cb9b49-lqxt2   2/2     Running   0          86s   10.244.4.2   mycluster-worker2   <none>           <none>
~~~

## Create Nodeport Service

~~~
> kubectl apply -f nginx-nodeport-service.yaml
service/nginx-nodeport-service created
~~~

### Nodeport service configuration  file

~~~ yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport-service
spec:
  selector:
    app: nginx-pods # Which Pods should be selected by this Service
  type: NodePort
  ports:
  - name: http
    port: 80 # Exposed Port by ClusterIP
    targetPort: 80 # Port in Pod which should be exposed
    nodePort: 30080 # Port on each Node to expose the Service
    protocol: TCP
~~~

### Verify Nodeport service was created

~~~
> kubectl get services -o wide
NAME                     TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE     SELECTOR
kubernetes               ClusterIP   10.96.0.1      <none>        443/TCP        8m36s   <none>
nginx-nodeport-service   NodePort    10.96.11.144   <none>        80:30080/TCP   2m56s   app=nginx-pods
~~~

### Describe NodePort service

~~~
> kubectl describe service nginx-nodeport-service
Name:                     nginx-nodeport-service
Namespace:                default
Labels:                   <none>
Annotations:              <none>
Selector:                 app=nginx-pods
Type:                     NodePort
IP Family Policy:         SingleStack
IP Families:              IPv4
IP:                       10.96.11.144
IPs:                      10.96.11.144
Port:                     http  80/TCP
TargetPort:               80/TCP
NodePort:                 http  30080/TCP
Endpoints:                10.244.4.3:80,10.244.1.2:80,10.244.4.2:80 + 1 more...
Session Affinity:         None
External Traffic Policy:  Cluster
Internal Traffic Policy:  Cluster
Events:                   <none>
~~~

### Check for NodePort service endpoints

~~~
> kubectl describe endpoints nginx-nodeport-service
Name:         nginx-nodeport-service
Namespace:    default
Labels:       endpoints.kubernetes.io/managed-by=endpoint-controller
Annotations:  endpoints.kubernetes.io/last-change-trigger-time: 2025-12-10T16:43:56Z
Subsets:
  Addresses:          10.244.1.2,10.244.3.2,10.244.4.2,10.244.4.3
  NotReadyAddresses:  <none>
  Ports:
    Name  Port  Protocol
    ----  ----  --------
    http  80    TCP
~~~

### Check NodePort service with port mapping

~~~
> curl http://localhost:9090
nginx-deployment-6dc9cb9b49-98v24
~~~

### Delete NodePort service

~~~
> kubectl delete service nginx-nodeport-service
service "nginx-nodeport-service" deleted from default namespace
~~~

## Create ClusterIP Service

~~~
> kubectl apply -f nginx-clusterip-service.yaml
service/nginx-clusterip-service created
~~~

### ClusterIP service configuration file

~~~yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-clusterip-service
spec:
  selector:
    app: nginx-pods # Which Pods should be selected by this Service
  type: ClusterIP
  ports:
  - name: http
    port: 80 # Exposed Port by ClusterIP
    targetPort: 80 # Port in Pod which should be exposed
    protocol: TCP
~~~

### Verify ClusterIP service was created

~~~
> kubectl get services -o wide
NAME                      TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE   SELECTOR
kubernetes                ClusterIP   10.96.0.1      <none>        443/TCP   20m   <none>
nginx-clusterip-service   ClusterIP   10.96.134.73   <none>        80/TCP    25s   app=nginx-pods
~~~

### Describe ClusterIP service

~~~
> kubectl describe service nginx-clusterip-service
Name:                     nginx-clusterip-service
Namespace:                default
Labels:                   <none>
Annotations:              <none>
Selector:                 app=nginx-pods
Type:                     ClusterIP
IP Family Policy:         SingleStack
IP Families:              IPv4
IP:                       10.96.134.73
IPs:                      10.96.134.73
Port:                     http  80/TCP
TargetPort:               80/TCP
Endpoints:                10.244.3.2:80,10.244.1.2:80,10.244.4.3:80 + 1 more...
Session Affinity:         None
Internal Traffic Policy:  Cluster
Events:                   <none>
~~~

### Check for ClusterIP service endpoints

~~~
> kubectl describe endpoints nginx-clusterip-service
Warning: v1 Endpoints is deprecated in v1.33+; use discovery.k8s.io/v1 EndpointSlice
Name:         nginx-clusterip-service
Namespace:    default
Labels:       endpoints.kubernetes.io/managed-by=endpoint-controller
Annotations:  endpoints.kubernetes.io/last-change-trigger-time: 2025-12-10T16:58:15Z
Subsets:
  Addresses:          10.244.1.2,10.244.3.2,10.244.4.2,10.244.4.3
  NotReadyAddresses:  <none>
  Ports:
    Name  Port  Protocol
    ----  ----  --------
    http  80    TCP

Events:  <none>
~~~

### Create port forwarding for ClusterIP service

~~~
> kubectl port-forward svc/nginx-clusterip-service 8081:80
Forwarding from 127.0.0.1:8081 -> 80
Forwarding from [::1]:8081 -> 80
Handling connection for 8081
~~~

### Check port forwarding is working

~~~
> curl http://localhost:8081
nginx-deployment-6dc9cb9b49-8b565
~~~

### Delete ClusterIP service

~~~
> kubectl delete service nginx-clusterip-service
service "nginx-clusterip-service" deleted from default namespace
~~~

