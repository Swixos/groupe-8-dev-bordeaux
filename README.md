# CarbonTrack - Calculateur d'Empreinte Carbone

Application fullstack permettant de calculer l'empreinte carbone d'un site physique (bâtiments, matériaux de construction, consommation énergétique, exploitation).

## Architecture

| Composant | Technologie | Port |
|-----------|------------|------|
| Frontend | Angular 17 | 4200 |
| Backend | NestJS + TypeORM | 3000 |
| Base de données | PostgreSQL 16 | 5432 |

## Fonctionnalités

### Palier 1 - Base fonctionnelle
- Saisie des caractéristiques d'un site (surface, parking, énergie, matériaux, employés)
- Calcul automatique de l'empreinte carbone (construction + exploitation)
- Affichage des résultats dans un dashboard Angular
- Authentification JWT

### Palier 2 - Dashboard & Visualisation
- KPIs : CO₂ total, CO₂/m², CO₂/employé
- Graphiques interactifs (Chart.js) : barres, camembert, radar
- Répartition construction vs exploitation

### Palier 3 - Fonctions avancées
- Comparaison multi-sites
- Historisation des calculs
- Design premium (dark theme, glassmorphism, animations)

## Facteurs d'émission (ADEME)

| Matériau | kgCO₂e/kg |
|----------|-----------|
| Béton | 0.13 |
| Acier | 1.37 |
| Verre | 0.85 |
| Bois | 0.04 |
| Aluminium | 6.73 |
| Cuivre | 3.81 |
| Plastique | 2.20 |
| Laine de verre | 1.54 |
| Brique | 0.23 |

- Énergie (mix France) : **51 kgCO₂e/MWh**
- Parking : **500 kgCO₂e/place/an**
- Poste de travail : **156 kgCO₂e/poste/an**

## Lancement rapide

### Avec Docker
```bash
docker-compose up -d
```
L'application est accessible sur http://localhost:4200

### En développement local

**Backend :**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend :**
```bash
cd frontend
npm install
npm start
```

## Données de référence (Capgemini Rennes)
- Surface : 11 771 m²
- Consommation énergétique : 1 840 MWh (2025)
- Nombre d'employés : ~1 800
- Postes de travail : 1 037

## Équipe
Groupe 8 - Dev Bordeaux - Capgemini
