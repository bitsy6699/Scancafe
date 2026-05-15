# Gunakan image Node.js versi 20
FROM node:20-slim

# Install python3 dan build tools (dibutuhkan untuk better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ 

# Tentukan folder kerja
WORKDIR /app

# Salin package.json dan install dependensi
COPY package*.json ./
RUN npm install

# Salin seluruh kode backend
COPY . .

# Buat folder untuk upload jika belum ada
RUN mkdir -p uploads

# Ekspos port yang digunakan
EXPOSE 5005

# Jalankan server
CMD ["node", "src/server.js"]
