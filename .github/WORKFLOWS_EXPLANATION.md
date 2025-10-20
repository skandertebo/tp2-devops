# GitHub Actions Workflows - Explication

## Deux Workflows Différents

Ce projet contient **deux workflows CI/CD** avec des objectifs différents :

### 1. `ci.yml` - GitHub Pages (Demo Simple)

**Objectif** : Déploiement du frontend React comme site statique

**Pipeline** :
```
Test Frontend → Build Frontend → Deploy sur GitHub Pages
```

**Quand il se déclenche** :
- Push sur `main` avec modifications dans `src/`, `public/`, ou `package.json`
- Pull requests vers `main`

**Résultat** :
- Site accessible sur : `https://username.github.io/tp2devops/`
- Frontend uniquement (pas de backend)
- Pas d'observabilité

**Utilisation** :
- ✅ Démo rapide de l'application frontend
- ✅ Test du pipeline CI/CD de base
- ✅ Hébergement gratuit sur GitHub Pages

---

### 2. `ci-k8s.yml` - Kubernetes (Solution Complète)

**Objectif** : Déploiement full-stack avec observabilité sur Kubernetes

**Pipeline** :
```
Test (Frontend + Backend)
    ↓
Build Docker Images (Frontend + Backend)
    ↓
Deploy sur Kubernetes (avec Prometheus, Loki, Tempo, Grafana)
```

**Quand il se déclenche** :
- Push sur `main` ou `develop` avec modifications dans `backend/`, `k8s/`, ou fichiers Docker
- Pull requests vers `main`

**Résultat** :
- Application full-stack avec API backend
- Stack d'observabilité complète
- Déploiement sur cluster Kubernetes

**Utilisation** :
- ✅ Démo de la solution complète avec observabilité
- ✅ Production-ready avec métriques/logs/traces
- ✅ Showcase des compétences DevOps avancées

---

## Quelle Workflow Utiliser ?

### Pour votre Présentation TP2 DevOps

**Recommandation** : Montrez les **deux approches** !

#### Partie 1 : CI/CD Basique (ci.yml)
- Montrer le pipeline simple GitHub Pages
- Expliquer les étapes : test → build → deploy
- Montrer le site déployé

#### Partie 2 : CI/CD + Observabilité (ci-k8s.yml)
- Montrer le pipeline avancé avec Docker
- Expliquer l'orchestration Kubernetes
- Montrer le stack d'observabilité (Grafana, Prometheus, etc.)

---

## Configuration des Workflows

### Désactiver un Workflow

Si vous voulez désactiver temporairement un workflow :

**Option 1** : Renommer le fichier
```bash
mv .github/workflows/ci.yml .github/workflows/ci.yml.disabled
```

**Option 2** : Ajouter une condition qui ne sera jamais vraie
```yaml
on:
  push:
    branches: [never-trigger]
```

### Éviter les Doublons

Les workflows sont configurés pour se déclencher sur des **paths différents** :

- `ci.yml` : Changements frontend uniquement
- `ci-k8s.yml` : Changements backend/infra uniquement

Donc ils ne devraient **pas se déclencher en même temps** !

---

## Résumé

| Workflow | Type | Déploiement | Observabilité | Quand l'utiliser |
|----------|------|-------------|---------------|------------------|
| `ci.yml` | Simple | GitHub Pages | ❌ Non | Démo rapide, test CI/CD basique |
| `ci-k8s.yml` | Avancé | Kubernetes | ✅ Complète | Démo production-ready, showcase DevOps |

**Conclusion** : **Gardez les deux !** Ils montrent votre maîtrise de différentes approches de déploiement.

---

## Pour Aller Plus Loin

### Fusionner les Workflows (Avancé)

Si vous voulez vraiment avoir un seul workflow :

```yaml
name: CI/CD Unified

jobs:
  test:
    # Test frontend et backend
    
  build:
    # Build pour les deux types de déploiement
    
  deploy-pages:
    if: github.event_name == 'push' && contains(github.event.head_commit.modified, 'src/')
    # Deploy sur GitHub Pages
    
  deploy-k8s:
    if: github.event_name == 'push' && contains(github.event.head_commit.modified, 'backend/')
    # Deploy sur Kubernetes
```

Mais ce n'est **pas nécessaire** pour votre TP !

