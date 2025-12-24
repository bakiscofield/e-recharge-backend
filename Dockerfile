FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Build l'application
RUN npm run build

# Exposer le port
EXPOSE 3001

# Démarrer l'application
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start:prod"]
