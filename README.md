# QUESTIONS ACTIVITÉ 1 — AIDE SOIGNANT

Application web interactive 100% frontend (React + Vite + Tailwind) avec reconnaissance vocale et envoi d'emails via **EmailJS**.

---

## ✨ Fonctionnalités

- **Étape 1** : Identification (Prénom, Nom, Email validé)
- **Étape 2** : 3 questions avec réponse vocale (Web Speech API) OU texte
  1. "Raconte-moi ta journée."
  2. "As-tu rencontré des difficultés ?"
  3. "Raconte-moi comment tu as surmonté cette difficulté."
- **Étape 3** : Relecture globale, correction individuelle, validation obligatoire
- **Étape 4** : Envoi automatique par email à 2 destinataires + téléchargements TXT/JSON

---

## 📧 Configuration EmailJS

L'application utilise EmailJS pour l'envoi côté client (aucun serveur SMTP requis).

**Identifiants configurés :**
- **Public Key** : `9d3bsPq_clwKINxP3`
- **Service ID** : `service_savoirscope`
- **Template ID** : `template_activite1`

> ℹ️ La clé publique est conçue pour être exposée dans le navigateur. Aucun mot de passe n'est stocké dans le code.

### Variables du template EmailJS

Assurez-vous que votre template `template_activite1` contient ces variables :

```
{{prenom}}
{{nom}}
{{email_utilisateur}}
{{to_email}}
{{destinataire_nom}}
{{reponse_1}}
{{reponse_2}}
{{reponse_3}}
{{question_1}}
{{question_2}}
{{question_3}}
{{date_envoi}}
{{objet}}
```

**Destinataires automatiques :**
1. `raletouletan@gmail.com` (administrateur)
2. L'email saisi par l'utilisateur (copie)

---

## 🚀 Démarrage rapide

```bash
# 1. Installer
npm install

# 2. Lancer en développement
npm run dev
# → http://localhost:5173

# 3. Builder pour production
npm run build
# → génère dist/index.html (fichier unique, 272 KB)
```

Ouvrez `dist/index.html` directement dans un navigateur — **aucun serveur requis**.

---

## 🎨 Design

- Palette claire : blanc, beige, bleu ciel (gradients sky-50 → blue-50)
- Interface responsive mobile-first
- Animations fluides (fade-in, progress bar, bounce)
- Accessibilité : labels, focus states, contrastes AA

---

## 🔐 Confidentialité

- **100% frontend** — aucune donnée envoyée vers un serveur propriétaire
- Les transcriptions restent dans le navigateur jusqu'à l'envoi EmailJS
- EmailJS est conforme RGPD (hébergement UE disponible)
- Possibilité de télécharger TXT/JSON en local comme sauvegarde

---

## 🛠️ Stack technique

- **React 18** + TypeScript
- **Vite 7** (avec vite-plugin-singlefile → build en 1 fichier HTML)
- **Tailwind CSS 3**
- **@emailjs/browser** 4.x
- **Web Speech API** (reconnaissance vocale native, fr-FR)
- **Lucide React** (icônes)

---

## 📂 Structure

```
src/
├── App.tsx                      # Orchestrateur 4 étapes
├── components/
│   ├── IdentificationForm.tsx   # Étape 1
│   ├── QuestionStep.tsx         # Étape 2 (vocal + texte)
│   ├── VoiceRecorder.tsx        # Web Speech API wrapper
│   ├── ReviewStep.tsx           # Étape 3 (validation)
│   ├── ConfirmationStep.tsx     # Étape 4 (EmailJS)
│   └── StepIndicator.tsx        # Barre de progression
├── services/
│   └── emailService.ts          # Intégration EmailJS
├── types.ts                     # Types UserInfo & QuestionData
└── index.css                    # Tailwind + animations
```

---

## ✅ Comportement attendu

| Cas | Résultat |
|-----|----------|
| Tous champs remplis + 3 réponses | ✅ Email envoyé à 2 destinataires |
| Réponse vide | ❌ Bouton bloqué + message "Vous devez répondre aux trois questions" |
| Erreur EmailJS (réseau, clé invalide) | ❌ Message d'erreur précis + boutons de téléchargement local |
| Succès | ✅ "Email envoyé avec succès à raletouletan@gmail.com et à votre adresse" |

---

## 🧪 Tester l'envoi

1. Remplir le formulaire avec votre email
2. Répondre aux 3 questions (vocal ou texte)
3. Valider
4. Vérifier votre boîte mail + celle de raletouletan@gmail.com

> Si le template EmailJS n'est pas configuré, l'application affichera l'erreur et proposera le téléchargement TXT/JSON.

---

## 📄 Licence

Usage interne SavoirScope — Activité 1 Aide Soignant