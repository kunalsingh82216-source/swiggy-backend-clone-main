require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const Admin = mongoose.model('Admin', adminSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swiggy');
    console.log('✅ Connected to MongoDB');
    
    const existingAdmin = await Admin.findOne({ email: 'admin@swiggy.com' });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@swiggy.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@swiggy.com');
      console.log('🔑 Password: Admin@123');
    } else {
      console.log('⚠️ Admin user already exists');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAdmin();