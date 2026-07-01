require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_URI_STANDARD || '';

async function seed() {
  if (!MONGO_URI) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const usersCol = db.collection('users');

  try {
    const indexes = await usersCol.indexes();
    for (const idx of indexes) {
      if (idx.name && idx.name !== '_id_' && idx.name.includes('device')) {
        await usersCol.dropIndex(idx.name);
        console.log(`Dropped stale index: ${idx.name}`);
      }
    }
  } catch (_) {}

  const email = process.argv[2] || 'admin@admin.com';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Admin';

  const existing = await usersCol.findOne({ email });
  if (existing) {
    await usersCol.updateOne({ email }, { $set: { role: 'admin', active: true } });
    console.log(`User "${email}" updated to admin role`);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    await usersCol.insertOne({
      email,
      password: hashed,
      name,
      role: 'admin',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Admin user created: ${email} / ${password}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
