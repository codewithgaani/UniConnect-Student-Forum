const db = require('./db/connection');
const bcrypt = require('bcryptjs');
async function check() {
  try {
    const [users] = await db.execute('SELECT * FROM users');
    console.log("All users in DB:");
    users.forEach(u => console.log(`- id=${u.id}, username="${u.username}", role=${u.role_id}`));
    
    // Test the specific credentials
    const [krishna] = await db.execute('SELECT * FROM users WHERE username = ?', ['Krishna B.']);
    console.log("\nLookup by 'Krishna B.':", krishna);
    
    // Let's also try to find by lowercase/similar name
    const [likeKrishna] = await db.execute('SELECT * FROM users WHERE username LIKE ?', ['%Krishna%']);
    console.log("\nLookup by '%Krishna%':", likeKrishna);
    
    if (krishna && krishna.length > 0) {
        const user = krishna[0];
        const isMatch = await bcrypt.compare('kRISHNA123', user.password);
        console.log("Is the password 'kRISHNA123' a match?", isMatch);

        const isMatch2 = await bcrypt.compare('krishna123', user.password);
        console.log("Is the password 'krishna123' a match?", isMatch2);
        
        const isMatch3 = await bcrypt.compare('Krishna123', user.password);
        console.log("Is the password 'Krishna123' a match?", isMatch3);
        
        const isMatch4 = await bcrypt.compare('Shorya123', user.password);
        console.log("Is the password 'Shorya123' a match?", isMatch4);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
