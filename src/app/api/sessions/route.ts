import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const sessions = db.prepare(`
      SELECT s.*, e.name AS exercise_name
      FROM sessions s
      JOIN exercises e ON s.exercise_id = e.id
      WHERE s.user_id = ?
      ORDER BY s.date DESC, s.start_time DESC
    `).all(user.id);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Fetch sessions error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao buscar sessões.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      exercise_id,
      date,
      start_time,
      end_time,
      reps,
      physical,
      emotional,
      weather,
      moon,
      notes,
    } = body;

    if (!exercise_id || !date || !start_time || !end_time || isNaN(Number(reps)) || Number(reps) <= 0) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos corretamente (Reps > 0).' },
        { status: 400 }
      );
    }

    // Verify exercise belongs to the user
    const exercise = db.prepare('SELECT id FROM exercises WHERE id = ? AND user_id = ?').get(exercise_id, user.id);
    if (!exercise) {
      return NextResponse.json({ error: 'Exercício inválido ou não pertence a este usuário.' }, { status: 400 });
    }

    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO sessions (
        id, user_id, exercise_id, date, start_time, end_time, reps, physical, emotional, weather, moon, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      user.id,
      exercise_id,
      date,
      start_time,
      end_time,
      Number(reps),
      physical || 'N/A',
      emotional || 'N/A',
      weather || 'N/A',
      moon || 'N/A',
      notes || ''
    );

    return NextResponse.json({ success: true, sessionId: id });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao registrar sessão.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da sessão é obrigatório.' }, { status: 400 });
    }

    // Verify ownership
    const session = db.prepare('SELECT id FROM sessions WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada ou não pertence a este usuário.' }, { status: 404 });
    }

    db.prepare('DELETE FROM sessions WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao excluir sessão.' },
      { status: 500 }
    );
  }
}
