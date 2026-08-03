---
showOnIndexPage: true
date: 2026-07-21
title: Continuous Delivery mit ArgoCD
image: Kubernetes.png
description:
tags:
  - Kubernetes
---

## References

[ArgoCD Tutorial for Beginners](https://www.youtube.com/watch?v=MeU5_k9ssrs)

## Was ist ArgoCD?

Argo CD (meist „ArgoCD“ geschrieben) ist ein Open-Source-Tool für Continuous Delivery von Anwendungen, besonders für Kubernetes.

- Was es macht: Es sorgt dafür, dass dein Kubernetes-Cluster wirklich genau den Zustand hat, der in deiner Git-Quelle definiert ist (z. B. Helm-Charts, Kustomize, Manifeste).
- Wie es arbeitet: Du beschreibst gewünschten Zustand in Git → Argo CD vergleicht regelmäßig mit dem Ist-Zustand im Cluster → bei Abweichungen kann es automatisch (oder manuell) korrigieren.
- Warum man es nutzt: Versionskontrolle, nachvollziehbarer Deploy-Prozess, „Single Source of Truth“ über Git, bessere Rollbacks (weil Änderungen in Git rückgängig gemacht werden können).
- Typische Bausteine: „Applications“ in Argo CD zeigen auf einen Git-Stand (Repo/Branch/Path) und definieren, wie daraus Kubernetes-Ressourcen gerendert werden.

