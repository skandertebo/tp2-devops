# GitHub Actions Workflows - Explication

## Workflow Actif

Ce projet utilise **un workflow CI/CD** principal pour la solution complète avec observabilité :

### `ci-k8s.yml` - Kubernetes (Solution Complète avec Observabilité)

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

## Focus sur la Solution Complète

Ce projet se concentre sur une **solution production-ready** avec :
- 🐳 Docker pour la containerisation
- ☸️ Kubernetes pour l'orchestration
- 📊 Stack d'observabilité complète (Prometheus, Loki, Tempo)
- 🔄 Pipeline CI/CD avancé

---

## Workflow Désactivé

### `ci.yml.disabled` - GitHub Pages (Désactivé)

Le workflow de déploiement GitHub Pages a été désactivé car le projet utilise maintenant une architecture full-stack avec backend et observabilité, qui nécessite Kubernetes.

**Pour le réactiver** (si besoin) :
```bash
mv .github/workflows/ci.yml.disabled .github/workflows/ci.yml
```

---

## Résumé

| Fichier | Statut | Description |
|---------|--------|-------------|
| `ci-k8s.yml` | ✅ Actif | Pipeline complet : Docker → Kubernetes → Observabilité |
| `ci.yml.disabled` | ❌ Désactivé | Simple déploiement GitHub Pages (non utilisé) |

**Architecture actuelle** : Full-stack avec observabilité production-ready sur Kubernetes.

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

