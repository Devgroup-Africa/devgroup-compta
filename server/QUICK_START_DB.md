# 🚀 Guide Rapide - Bases de Données

## 📍 Voir quelle base est active
```bash
cd server
npm run db:status
```

## 🔄 Basculer vers Local (hors ligne)
```bash
cd server
npm run db:local
npm start
```

## ☁️ Basculer vers Atlas (cloud)
```bash
cd server
npm run db:atlas
npm start
```

## 📥 Télécharger les données (Atlas → Local)
```bash
cd server
npm run db:pull
```

## 📤 Envoyer les données (Local → Atlas)
```bash
cd server
npm run db:push
```

---

## ⚡ Workflow Hors Ligne

### Avant de partir (avec internet):
```bash
cd server
npm run db:pull      # Télécharger les données
npm run db:local     # Basculer vers local
npm start            # Redémarrer
```

### De retour (avec internet):
```bash
cd server
npm run db:push      # Envoyer vos modifications
npm run db:atlas     # Basculer vers cloud
npm start            # Redémarrer
```

---

## ⚠️ Important
- `db:push` ÉCRASE les données sur Atlas!
- Faites `db:pull` régulièrement pour avoir les dernières données
- Redémarrez toujours le serveur après avoir changé de base
