# 🔧 Résolution de l'Erreur GitHub Pages

## ❌ Erreur Rencontrée

```
Run actions/configure-pages@v4
Error: Get Pages site failed. Please verify that the repository has Pages enabled 
and configured to build using GitHub Actions, or consider exploring the 
`enablement` parameter for this action.
Error: HttpError: Not Found
```

## ✅ Solution : 3 Étapes Simples

Cette erreur est **normale** et se produit parce que GitHub Pages n'est pas encore activé. Voici comment la résoudre :

---

## 📋 Étape 1 : Pousser le Code sur GitHub

### A. Créer le Repository

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **"+"** → **"New repository"**
3. Nom : **`tp2devops`**
4. Visibilité : **Public** ⚠️ (requis pour Pages gratuit)
5. Ne cochez RIEN d'autre
6. Cliquez sur **"Create repository"**

### B. Pousser le Code Local

```bash
cd /Users/theysaid/work/tp2devops

# Ajouter le remote (CHANGEZ YOUR-USERNAME !)
git remote add origin https://github.com/YOUR-USERNAME/tp2devops.git

# Pousser le code
git push -u origin main
```

**Exemple avec un vrai username :**
```bash
git remote add origin https://github.com/johndoe/tp2devops.git
git push -u origin main
```

---

## 📋 Étape 2 : Activer GitHub Pages

1. Sur GitHub, allez sur votre repository
2. Cliquez sur **Settings** (⚙️ en haut)
3. Dans le menu de gauche, cliquez sur **Pages**
4. Sous **"Build and deployment"** :
   - **Source** : Sélectionnez **"GitHub Actions"** dans le menu déroulant
5. C'est tout ! Pas besoin de sauvegarder

**Capture d'écran de référence :**
```
Settings → Pages → Source: [GitHub Actions ▼]
```

---

## 📋 Étape 3 : Vérifier le Déploiement

### A. Relancer le Workflow (Optionnel)

Le workflow devrait se relancer automatiquement, mais vous pouvez forcer :

```bash
# Option 1 : Via l'interface GitHub
# Aller dans Actions → CI/CD Pipeline → Re-run all jobs

# Option 2 : Via un nouveau commit
echo "" >> README.md
git add README.md
git commit -m "chore: trigger deployment"
git push
```

### B. Suivre le Déploiement

1. Allez dans l'onglet **Actions**
2. Cliquez sur le workflow en cours
3. Vous devriez voir 3 jobs :
   - ✅ **test** - Tests et linting
   - ✅ **build** - Build de production
   - ✅ **deploy** - Déploiement Pages (uniquement si branche main)

### C. Accéder au Site

Après 2-3 minutes :

1. Retournez dans **Settings** → **Pages**
2. Vous verrez : **"Your site is live at https://YOUR-USERNAME.github.io/tp2devops/"**
3. Cliquez sur le lien !

---

## 🎉 C'est Fait !

Votre application Todo List est maintenant en ligne !

### URLs Importantes

| Type | URL |
|------|-----|
| **Repository** | `https://github.com/YOUR-USERNAME/tp2devops` |
| **Actions** | `https://github.com/YOUR-USERNAME/tp2devops/actions` |
| **Site Web** | `https://YOUR-USERNAME.github.io/tp2devops/` |

---

## 🔍 Vérifications

### Le Pipeline Fonctionne ?

```
✓ Job test   : Tests passent (15/15)
✓ Job build  : Build réussit
✓ Job deploy : Déploie sur Pages (seulement sur main)
```

### Le Site Est Accessible ?

Ouvrez : `https://YOUR-USERNAME.github.io/tp2devops/`

Vous devriez voir :
- 📝 Titre "Liste de Tâches"
- Champ de saisie
- Bouton "Ajouter"
- Design avec gradient violet/bleu

### L'Observabilité Fonctionne ?

Ouvrez la console du navigateur (F12) et vous verrez :
- Logs JSON structurés
- Métriques [METRIC]
- Web Vitals [WEB VITAL]
- Traces OpenTelemetry

---

## 🐛 Problèmes Courants

### "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/tp2devops.git
```

### "Permission denied"

Authentifiez-vous avec GitHub :

```bash
# Option 1 : GitHub CLI
gh auth login

# Option 2 : SSH
git remote set-url origin git@github.com:YOUR-USERNAME/tp2devops.git
```

### Le Job Deploy est Grisé (Skipped)

**Normal si :**
- Vous n'êtes pas sur la branche `main`
- C'est une Pull Request
- Pages n'est pas encore activé

**Solution :**
- Vérifiez que vous êtes sur `main` : `git branch`
- Activez GitHub Pages (Étape 2 ci-dessus)

### Page 404 sur le Site

**Causes possibles :**
1. Le déploiement n'est pas terminé (attendez 2-3 min)
2. Dans `vite.config.js`, vérifiez `base: '/tp2devops/'`
3. Le workflow de déploiement a échoué (vérifiez Actions)

**Solution :**
```bash
# Vérifier vite.config.js
cat vite.config.js | grep base

# Devrait afficher :
# base: '/tp2devops/',
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

- **Guide de déploiement complet** : [docs/DEPLOIEMENT_GITHUB.md](./docs/DEPLOIEMENT_GITHUB.md)
- **Rapport technique** : [RAPPORT.md](./RAPPORT.md)
- **Documentation principale** : [README.md](./README.md)

---

## ✅ Checklist Finale

- [ ] Repository créé sur GitHub (public)
- [ ] Remote ajouté : `git remote -v` montre origin
- [ ] Code poussé : `git push -u origin main`
- [ ] GitHub Pages activé : Settings → Pages → Source: GitHub Actions
- [ ] Workflow exécuté : Actions → CI/CD Pipeline → ✓
- [ ] Site accessible : `https://YOUR-USERNAME.github.io/tp2devops/`

---

**Une fois ces 3 étapes complétées, l'erreur sera résolue et votre site sera en ligne ! 🚀**

