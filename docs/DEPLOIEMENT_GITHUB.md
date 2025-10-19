# Guide de Déploiement sur GitHub

## ⚠️ Problème Courant : GitHub Pages Non Configuré

Si vous rencontrez cette erreur dans GitHub Actions :
```
Error: Get Pages site failed. Please verify that the repository has Pages enabled
```

C'est normal ! Suivez ces étapes pour résoudre le problème.

---

## 📋 Étapes de Déploiement Complet

### 1. Créer le Repository sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur le bouton **"+"** → **"New repository"**
3. Nom du repository : **`tp2devops`**
4. Description : *"Application Todo avec CI/CD et Observabilité"*
5. Visibilité : **Public** (requis pour GitHub Pages gratuit)
6. **NE PAS** initialiser avec README, .gitignore ou license
7. Cliquez sur **"Create repository"**

### 2. Pousser le Code Existant

Dans votre terminal :

```bash
cd /Users/theysaid/work/tp2devops

# Ajouter le remote (remplacez YOUR-USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/YOUR-USERNAME/tp2devops.git

# Vérifier que le remote est configuré
git remote -v

# Pousser le code
git push -u origin main
```

### 3. Activer GitHub Pages

Une fois le code poussé :

1. Allez sur votre repository : `https://github.com/YOUR-USERNAME/tp2devops`
2. Cliquez sur **Settings** (⚙️)
3. Dans le menu de gauche, cliquez sur **Pages**
4. Sous **"Build and deployment"** :
   - **Source** : Sélectionnez **"GitHub Actions"**
   - (Pas besoin de sélectionner une branche)
5. Cliquez sur **Save** si demandé

### 4. Re-déclencher le Workflow

Le workflow devrait se déclencher automatiquement après activation de Pages, mais vous pouvez aussi :

1. Allez dans l'onglet **Actions**
2. Cliquez sur le workflow **"CI/CD Pipeline"**
3. Cliquez sur **"Re-run all jobs"**

OU faites un petit changement et push :

```bash
# Faire un changement mineur
echo "" >> README.md
git add README.md
git commit -m "chore: trigger deployment"
git push
```

### 5. Vérifier le Déploiement

Après quelques minutes :

1. Retournez dans **Settings** → **Pages**
2. Vous verrez un message : **"Your site is live at https://YOUR-USERNAME.github.io/tp2devops/"**
3. Cliquez sur le lien pour voir votre application !

---

## 🔧 Solution Alternative : Désactiver Temporairement le Deploy

Si vous voulez tester le pipeline sans déployer, modifiez `.github/workflows/ci.yml` :

```yaml
deploy:
  name: Deploy to GitHub Pages
  runs-on: ubuntu-latest
  needs: build
  # Désactiver temporairement en changeant la condition
  if: false  # Changé de: github.ref == 'refs/heads/main' && github.event_name == 'push'
  
  # ... reste du job
```

Ou commentez complètement le job deploy :

```yaml
# deploy:
#   name: Deploy to GitHub Pages
#   runs-on: ubuntu-latest
#   ...
```

---

## 📊 Vérifier le Pipeline

### Statut des Jobs

Le pipeline devrait afficher :

```
✓ test     - Tests et linting (1-2 min)
✓ build    - Build de production (1 min)
✓ deploy   - Déploiement Pages (30 sec)
```

### Logs à Vérifier

**Job Test :**
```
✓ src/observability/logger.test.js (6 tests) 3ms
✓ src/components/TodoList.test.jsx (9 tests) 269ms

Test Files  2 passed (2)
     Tests  15 passed (15)
```

**Job Build :**
```
dist/index.html                   0.49 kB │ gzip:  0.30 kB
dist/assets/index-*.css           2.24 kB │ gzip:  0.94 kB
dist/assets/index-*.js          284.11 kB │ gzip: 90.23 kB
✓ built in 504ms
```

**Job Deploy :**
```
✓ Setup Pages
✓ Upload artifact
✓ Deploy to GitHub Pages
```

---

## 🎯 Checklist Complète

- [ ] Repository créé sur GitHub (public)
- [ ] Code poussé sur GitHub (`git push`)
- [ ] GitHub Pages activé (Settings → Pages → Source: GitHub Actions)
- [ ] Workflow CI/CD exécuté avec succès
- [ ] Les 3 jobs (test, build, deploy) sont verts ✓
- [ ] Site accessible sur `https://YOUR-USERNAME.github.io/tp2devops/`

---

## 🐛 Dépannage

### Erreur : "remote origin already exists"

```bash
# Supprimer le remote existant
git remote remove origin

# Ajouter le bon remote
git remote add origin https://github.com/YOUR-USERNAME/tp2devops.git
```

### Erreur : "permission denied"

Vous devez peut-être vous authentifier :

```bash
# Utiliser GitHub CLI
gh auth login

# OU utiliser SSH
git remote set-url origin git@github.com:YOUR-USERNAME/tp2devops.git
```

### Le Site Affiche une Page 404

Vérifiez que :
1. Le workflow de déploiement s'est terminé avec succès
2. Dans `vite.config.js`, `base` correspond au nom de votre repository
3. Attendez 2-3 minutes après le déploiement

### Le Job Deploy est Grisé (Skipped)

Normal si :
- Vous n'êtes pas sur la branche `main`
- C'est une Pull Request
- La condition `if` du job n'est pas satisfaite

---

## 🚀 URL Finale

Une fois déployé, votre application sera accessible sur :

```
https://YOUR-USERNAME.github.io/tp2devops/
```

Remplacez `YOUR-USERNAME` par votre nom d'utilisateur GitHub.

---

## 📝 Notes

- GitHub Pages gratuit nécessite un repository **public**
- Le déploiement prend généralement 2-5 minutes
- Les mises à jour sont automatiques à chaque push sur `main`
- Le site est servi via HTTPS (sécurisé)
- Le CDN de GitHub assure une bonne performance mondiale

