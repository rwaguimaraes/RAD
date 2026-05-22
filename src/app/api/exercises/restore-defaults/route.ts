import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const DEFAULTS = [
  { name: 'Sintonia 1', target_reps: 200 },
  { name: 'Sintonia com Testemunho', target_reps: 150 },
  { name: 'Direção do Giro', target_reps: 100 },
  { name: 'Sensibilidade Energética', target_reps: 150 },
  { name: 'Pesquisa de Objeto Oculto', target_reps: 50 },
];

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const insertStmt = db.prepare('INSERT INTO exercises (id, user_id, name, target_reps) VALUES (?, ?, ?, ?)');
    const checkStmt = db.prepare('SELECT id FROM exercises WHERE user_id = ? AND LOWER(name) = LOWER(?)');

    // Run transaction for safety and atomicity
    const runTransaction = db.transaction(() => {
      let addedCount = 0;
      for (const item of DEFAULTS) {
        const existing = checkStmt.get(user.id, item.name);
        if (!existing) {
          insertStmt.run(crypto.randomUUID(), user.id, item.name, item.target_reps);
          addedCount++;
        }
      }
      return addedCount;
    });

    const added = runTransaction();

    return NextResponse.json({ success: true, added });
  } catch (error) {
    console.error('Restore defaults error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao restaurar exercícios padrão.' },
      { status: 500 }
    );
  }
}
