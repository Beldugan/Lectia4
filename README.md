# Lecția 4 — Roata, axul și scripetele
## Aplicație Interactivă STEM

Aplicație web interactivă construită în React, pentru înțelegerea vizuală a conceptelor din Lecția 4 (angrenaje, scripete, matematică, bicicletă).

---

## Instalare și pornire

```bash
# Instalează dependențele
npm install

# Pornește serverul de dezvoltare (http://localhost:5173)
npm run dev

# Build pentru producție
npm run build
```

---

## Ghid pentru tutore

### ⚙️ Modul 1 — Angrenaje
- Apasă **Pornește** și roțile dințate SVG se vor roti sincronizat
- Modifică sliderele pentru a schimba viteza (RPM) și numărul de dinți
- Raportul se afișează live: roata mică se rotește mai repede proporțional cu nr. de dinți
- Conceptul cheie: **roata mare pune în mișcare roata mică, care se rotește mai repede dar cu mai puțină forță**

### 🪣 Modul 2 — Scripete
- Trage butonul albastru **în sus** pe ecran pentru a ridica obiectul
- Schimbă între 1, 2 sau 4 scripete pentru a vedea cum se reduce forța necesară
- Bara verde din dreapta arată progresul ridicării
- Conceptul cheie: **tragi în jos → obiectul urcă; mai multe scripete = efort mai mic**

### 🧮 Modul 3 — Quiz Matematică
- 8 întrebări în perechi: mai întâi înmulțire, apoi împărțirea inversă
- Completează răspunsul și apasă Enter sau butonul Verifică
- Dacă trec 15 secunde fără răspuns, apare un indiciu
- Conceptul cheie: **6×8=48 → 48÷6=8 (fapte inverse)**

### 🚲 Modul 4 — Bicicletă
- Selectează una din cele 3 viteze (urcuș / normal / coborâre)
- Trage sliderul "Tu pedalezi" pentru a simula rotațiile pedalelor
- Animația arată roțile și lanțul în mișcare
- Conceptul cheie: **viteză mică = efort mic la deal; viteză mare = distanță mare la coborâre**

### 📚 Recap Final
- Rezumat vizual cu toate conceptele din lecție
- Ideal de arătat la finalul orei ca recapitulare

---

## Stack tehnic
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- lucide-react
