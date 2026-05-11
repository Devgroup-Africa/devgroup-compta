# Configuration de l'Assistant IA

L'assistant IA de votre application comptable utilise **Groq** (gratuit) pour fournir des réponses intelligentes basées sur vos données financières.

## Groq - API Gratuite (Recommandé)

Groq offre une API gratuite très rapide avec le modèle Llama 3.3 70B.

### Avantages de Groq:
- ✅ **100% Gratuit** avec limites généreuses
- ✅ **Très rapide** (plus rapide que GPT)
- ✅ **Modèles puissants** (Llama 3.3, Mixtral)
- ✅ **Pas de carte bancaire** requise

### Configuration:

1. **Créer un compte Groq:**
   - Allez sur https://console.groq.com
   - Créez un compte gratuit

2. **Obtenir votre clé API:**
   - Allez dans https://console.groq.com/keys
   - Cliquez sur "Create API Key"
   - Copiez votre clé (commence par `gsk_...`)

3. **Ajouter la clé dans `.env`:**
   ```env
   GROQ_API_KEY=votre_clé_groq_ici
   ```

4. **Redémarrer le serveur:**
   ```bash
   npm start
   ```

## Alternative: OpenAI (Payant)

Si vous préférez utiliser OpenAI GPT:

1. Créez un compte sur https://platform.openai.com
2. Ajoutez du crédit (minimum 5$)
3. Obtenez votre clé API
4. Ajoutez dans `.env`:
   ```env
   OPENAI_API_KEY=votre_clé_openai_ici
   ```
5. Modifiez le code pour utiliser OpenAI au lieu de Groq

## Modèles Disponibles

### Groq (Gratuit):
- `llama-3.3-70b-versatile` (Recommandé) - Très puissant et rapide
- `llama-3.1-70b-versatile` - Alternative stable
- `mixtral-8x7b-32768` - Bon pour les longs contextes

### OpenAI (Payant):
- `gpt-4o-mini` (~0.15$/1000 messages) - Économique
- `gpt-4o` (~3$/1000 messages) - Plus puissant
- `gpt-4` (~30$/1000 messages) - Le plus avancé

## Fonctionnalités de l'Assistant

L'assistant peut:
- Analyser vos données financières en temps réel
- Répondre à des questions sur la comptabilité et la fiscalité
- Donner des conseils personnalisés basés sur votre situation
- Expliquer des concepts comptables complexes
- Suggérer des améliorations pour votre gestion

## Utilisation

Posez des questions comme:
- "Quelle est ma situation financière?"
- "Comment améliorer ma trésorerie?"
- "Explique-moi la TVA"
- "Quels sont mes conseils personnalisés?"
- "Analyse mes factures en retard"

## Sécurité

⚠️ **Important:**
- Ne partagez JAMAIS vos clés API publiquement
- Ajoutez `.env` dans votre `.gitignore`
- Révoquez immédiatement toute clé exposée
- Créez une nouvelle clé si nécessaire

## Dépannage

### L'assistant ne répond pas:
1. Vérifiez que `GROQ_API_KEY` est dans `.env`
2. Vérifiez que le serveur a redémarré
3. Consultez les logs du serveur pour les erreurs

### Quota dépassé:
- Groq: Attendez quelques minutes (limite par minute)
- OpenAI: Ajoutez du crédit sur votre compte

### Mode de base activé:
Si vous voyez "Assistant IA de base activé", cela signifie:
- La clé API n'est pas configurée
- Ou le quota est dépassé
- L'assistant fonctionne quand même avec des réponses basiques

## Support

Pour plus d'informations:
- Groq: https://console.groq.com/docs
- OpenAI: https://platform.openai.com/docs
