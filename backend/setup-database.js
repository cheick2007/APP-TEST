require('dotenv').config();
const mysql = require('mysql2/promise');

// Script pour créer la base de données et les tables

async function setupDatabase() {
  console.log('🔧 Configuration de la base de données...');
  
  try {
    // Connexion à MySQL (sans spécifier la base de données)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    console.log('✅ Connexion à MySQL réussie');

    // Créer la base de données si elle n'existe pas
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Base de données ${process.env.DB_NAME} créée`);

    // Se connecter à la base de données
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Créer la table users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        motDePasse VARCHAR(255) NOT NULL,
        telephone VARCHAR(20),
        role ENUM('commercant', 'fournisseur') NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table users créée');

    // Créer la table clients
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        telephone VARCHAR(20),
        adresse TEXT,
        userId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table clients créée');

    // Créer la table factures
    await connection.query(`
      CREATE TABLE IF NOT EXISTS factures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero VARCHAR(50) UNIQUE NOT NULL,
        montant DECIMAL(10, 2) NOT NULL,
        dateEmission DATE NOT NULL,
        dateEcheance DATE NOT NULL,
        description TEXT,
        statut ENUM('en_attente', 'payee', 'partiellement_payee') DEFAULT 'en_attente',
        fournisseurId INT NOT NULL,
        commercantId INT NOT NULL,
        montantPaye DECIMAL(10, 2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (fournisseurId) REFERENCES users(id),
        FOREIGN KEY (commercantId) REFERENCES users(id)
      )
    `);
    console.log('✅ Table factures créée');

    // Créer la table paiements
    await connection.query(`
      CREATE TABLE IF NOT EXISTS paiements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        montant DECIMAL(10, 2) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mode VARCHAR(50) DEFAULT 'mobile_money',
        reference VARCHAR(100) UNIQUE NOT NULL,
        telephone VARCHAR(20),
        factureId INT NOT NULL,
        statut ENUM('succes', 'echec', 'en_cours') DEFAULT 'succes',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (factureId) REFERENCES factures(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table paiements créée');

    // Créer la table notifications
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        contenu TEXT NOT NULL,
        lu BOOLEAN DEFAULT FALSE,
        userId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table notifications créée');

    console.log('\n🎉 Base de données configurée avec succès!');
    console.log('Vous pouvez maintenant lancer le serveur avec: npm run dev\n');

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

setupDatabase();
