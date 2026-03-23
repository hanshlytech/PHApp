import bcrypt from 'bcryptjs';
import db from './db.js';

async function seed() {
  // Seed users
  const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'reception', password: 'reception123', role: 'reception' },
  ];

  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 10);
    const { error } = await db
      .from('users')
      .upsert({ username: u.username, password_hash: hash, role: u.role }, { onConflict: 'username' });

    if (error) console.error(`Error seeding user ${u.username}:`, error.message);
    else console.log(`Seeded user: ${u.username} (${u.role})`);
  }

  // Seed demo cards
  const demoCards = [
    {
      card_number: 'PH-2025-DEMO1',
      aadhaar_last4: '1234',
      issued_date: '2025-03-15',
      expiry_date: '2027-03-15',
      branch: 'Nacharam',
      members: [
        { name: 'Ravi Kumar', relation: 'primary', dob: '1980-05-10', is_primary: true },
        { name: 'Priya Kumar', relation: 'spouse', dob: '1983-08-22', is_primary: false },
        { name: 'Arjun Kumar', relation: 'child', dob: '2010-01-15', is_primary: false },
      ],
    },
    {
      card_number: 'PH-2025-DEMO2',
      aadhaar_last4: '5678',
      issued_date: '2025-01-10',
      expiry_date: '2027-01-10',
      branch: 'Pragathi Nagar',
      members: [
        { name: 'Meena Iyer', relation: 'primary', dob: '1975-11-30', is_primary: true },
        { name: 'Suresh Iyer', relation: 'spouse', dob: '1972-04-18', is_primary: false },
      ],
    },
    {
      card_number: 'PH-2024-EXPR1',
      aadhaar_last4: '9012',
      issued_date: '2024-01-01',
      expiry_date: '2025-01-01',
      branch: 'Manikonda',
      members: [
        { name: 'Suresh Nair', relation: 'primary', dob: '1968-07-04', is_primary: true },
      ],
    },
  ];

  for (const c of demoCards) {
    const { members, ...cardData } = c;

    // Upsert card
    const { data: card, error: cardError } = await db
      .from('cards')
      .upsert(cardData, { onConflict: 'card_number' })
      .select('id')
      .single();

    if (cardError || !card) {
      console.error(`Error seeding card ${c.card_number}:`, cardError?.message);
      continue;
    }

    // Delete existing members for this card (to re-seed cleanly)
    await db.from('members').delete().eq('card_id', card.id);

    // Insert members
    const memberRows = members.map((m) => ({ ...m, card_id: card.id }));
    const { error: memberError } = await db.from('members').insert(memberRows);

    if (memberError) console.error(`Error seeding members for ${c.card_number}:`, memberError.message);
    else console.log(`Seeded card: ${c.card_number} with ${members.length} members`);
  }

  console.log('Seed complete');
}

seed().catch(console.error);
