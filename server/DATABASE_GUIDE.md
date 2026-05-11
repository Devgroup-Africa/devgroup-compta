# Guide de Gestion des Bases de Données

Ce guide explique comment basculer entre MongoDB Atlas (cloud) et MongoDB local, et comment synchroniser les données.

---

## 🎯 Cas d'Usage

### Utiliser MongoDB Atlas (Cloud)
- ✅ Quand vous avez une connexion internet
- ✅ Pour travailler en équipe (données partagées)
- ✅ Pour la production
- ✅ Sauvegardes automatiques

### Utiliser MongoDB Local
- ✅ Quand vous n'avez pas de connexion internet
- ✅ Pour le développement hors ligne
- ✅ Pour des tests sans affecter les données cloud
- ✅ Performance maximale (pas de latence réseau)

---

## 🔧 Installation de MongoDB Local

### Windows
1. Téléchargez MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Installez avec les options par défaut
3. MongoDB démarre automatiquement comme service Windows

### Vérifier que MongoDB fonctionne
```bash
# Ouvrir MongoDB Compass
# Connecter à: mongodb://localhost:27017
```

---

## 🔄 Basculer entre les Bases de Données

### Voir la base de données actuelle
```bash
cd server
npm run db:status
```

### Basculer vers MongoDB Local
```bash
cd server
npm run db:local
```

Puis redémarrez le serveur:
```bash
npm start
```

### Basculer vers MongoDB Atlas (Cloud)
```bash
cd server
npm run db:atlas
```

Puis redémarrez le serveur:
```bash
npm start
```

---

## 📥 Synchroniser les Données

### Télécharger les données d'Atlas vers Local
Utilisez cette commande quand vous voulez travailler hors ligne avec les dernières données:

```bash
cd server
npm run db:pull
```

Cette commande va:
1. Se connecter à MongoDB Atlas
2. Télécharger toutes les données
3. Les copier dans votre MongoDB local
4. ⚠️ **Attention:** Cela écrase les données locales existantes!

### Envoyer les données de Local vers Atlas
Utilisez cette commande quand vous avez travaillé hors ligne et voulez synchroniser:

```bash
cd server
npm run db:push
```

Cette commande va:
1. Se connecter à votre MongoDB local
2. Envoyer toutes les données vers Atlas
3. ⚠️ **ATTENTION:** Cela écrase les données sur Atlas!
4. ⚠️ **Assurez-vous d'avoir une sauvegarde avant!**

---

## 📋 Workflow Recommandé

### Scénario 1: Travailler Hors Ligne

1. **Avant de partir (avec internet):**
   ```bash
   cd server
   npm run db:pull        # Télécharger les dernières données
   npm run db:local       # Basculer vers local
   npm start              # Redémarrer le serveur
   ```

2. **Travailler hors ligne:**
   - Toutes vos modifications sont sauvegardées localement
   - L'application fonctionne normalement

3. **De retour avec internet:**
   ```bash
   cd server
   npm run db:push        # Envoyer vos modifications vers Atlas
   npm run db:atlas       # Basculer vers Atlas
   npm start              # Redémarrer le serveur
   ```

### Scénario 2: Développement Normal (avec internet)

1. **Utiliser Atlas directement:**
   ```bash
   cd server
   npm run db:atlas       # S'assurer qu'on est sur Atlas
   npm start              # Démarrer le serveur
   ```

2. **Pas besoin de synchronisation**
   - Toutes les modifications vont directement sur Atlas
   - Accessible par toute l'équipe

---

## ⚠️ Précautions Importantes

### Avant de faire `npm run db:push`
1. ✅ Vérifiez que vos données locales sont à jour
2. ✅ Assurez-vous que personne d'autre ne travaille sur Atlas
3. ✅ Faites une sauvegarde si nécessaire
4. ⚠️ Cette commande ÉCRASE les données sur Atlas!

### Éviter les Conflits
- Si vous travaillez en équipe, coordonnez-vous avant de faire `db:push`
- Utilisez `db:pull` régulièrement pour avoir les dernières données
- En cas de doute, faites une sauvegarde manuelle

---

## 🔍 Vérification

### Vérifier la connexion actuelle
```bash
cd server
npm run db:status
```

### Vérifier MongoDB local avec Compass
1. Ouvrir MongoDB Compass
2. Connecter à: `mongodb://localhost:27017`
3. Sélectionner la base `devgroup_compta`
4. Voir les collections et les données

### Vérifier MongoDB Atlas avec Compass
1. Ouvrir MongoDB Compass
2. Connecter avec l'URI Atlas (déjà configuré dans Compass)
3. Sélectionner la base `devgroup_compta`
4. Voir les collections et les données

---

## 🐛 Dépannage

### Erreur: "Cannot connect to MongoDB"
- **Local:** Vérifiez que MongoDB est démarré (service Windows)
- **Atlas:** Vérifiez votre connexion internet

### Erreur: "Collection not found"
- Exécutez `npm run db:pull` pour télécharger les données
- Ou initialisez la base avec `node src/scripts/initChartOfAccounts.js`

### Les données ne se synchronisent pas
- Vérifiez que vous êtes sur la bonne base avec `npm run db:status`
- Redémarrez le serveur après avoir changé de base
- Vérifiez les logs de la console pour les erreurs

---

## 📊 Collections Synchronisées

Les collections suivantes sont synchronisées:
- ✅ users (Utilisateurs)
- ✅ accounts (Plan comptable)
- ✅ journalentries (Écritures comptables)
- ✅ clients (Clients)
- ✅ suppliers (Fournisseurs)
- ✅ invoices (Factures)
- ✅ payments (Paiements)
- ✅ purchases (Achats)
- ✅ bankaccounts (Comptes bancaires)
- ✅ transactions (Transactions)
- ✅ companysettings (Paramètres)
- ✅ auditlogs (Logs d'audit)

---

## 💡 Conseils

1. **Travail quotidien avec internet:** Utilisez Atlas directement
2. **Déplacements/Hors ligne:** Faites `db:pull` avant de partir
3. **Tests:** Utilisez Local pour ne pas affecter les données de production
4. **Sauvegardes:** Faites `db:pull` régulièrement comme sauvegarde locale

---

## 🆘 Support

En cas de problème:
1. Vérifiez ce guide
2. Consultez les logs du serveur
3. Vérifiez MongoDB Compass
4. Contactez le support technique
