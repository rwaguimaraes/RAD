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

    const exercises = db.prepare(`
      SELECT e.id, e.name, e.target_reps, COALESCE(SUM(s.reps), 0) AS reps_completed
      FROM exercises e
      LEFT JOIN sessions s ON e.id = s.exercise_id
      WHERE e.user_id = ?
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `).all(user.id);

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error('Fetch exercises error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao buscar exercícios.' },
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

    const { name, target_reps } = await request.json();

    if (!name || !target_reps || isNaN(Number(target_reps)) || Number(target_reps) <= 0) {
      return NextResponse.json(
        { error: 'Nome do exercício e meta de repetições (PTR > 0) são obrigatórios.' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    db.prepare('INSERT INTO exercises (id, user_id, name, target_reps) VALUES (?, ?, ?, ?)').run(
      id,
      user.id,
      name.trim(),
      Number(target_reps)
    );

    return NextResponse.json({ success: true, exercise: { id, name, target_reps, reps_completed: 0 } });
  } catch (error) {
    console.error('Create exercise error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao criar exercício.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id, name, target_reps } = await request.json();

    if (!id || !name || !target_reps || isNaN(Number(target_reps)) || Number(target_reps) <= 0) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos.' },
        { status: 400 }
      );
    }

    // Verify ownership
    const exercise = db.prepare('SELECT id FROM exercises WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!exercise) {
      return NextResponse.json({ error: 'Exercício não encontrado ou não pertence a este usuário.' }, { status: 404 });
    }

    db.prepare('UPDATE exercises SET name = ?, target_reps = ? WHERE id = ?').run(
      name.trim(),
      Number(target_reps),
      id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update exercise error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao editar exercício.' },
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
      return NextResponse.json({ error: 'ID do exercício é obrigatório.' }, { status: 400 });
    }

    // Verify ownership
    const exercise = db.prepare('SELECT id FROM exercises WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!exercise) {
      return NextResponse.json({ error: 'Exercício não encontrado.' }, { status: 404 });
    }

    // Deleting exercise triggers cascading delete of sessions in sqlite
    db.prepare('DELETE FROM exercises WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete exercise error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao excluir exercício.' },
      { status: 500 }
    );
  }
}
