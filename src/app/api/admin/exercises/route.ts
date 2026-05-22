import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

async function verifyAdmin() {
  const user = await getCurrentUser();
  return user && user.email === 'rwaguimaraes@gmail.com';
}

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: 'Acesso proibido.' }, { status: 403 });
    }

    const exercises = db.prepare(`
      SELECT e.id, e.name, e.target_reps, e.created_at, e.user_id, u.username as creator_name, u.email as creator_email
      FROM exercises e
      JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
    `).all();

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error('Admin fetch exercises error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao buscar exercícios.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: 'Acesso proibido.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('id');

    if (!exerciseId) {
      return NextResponse.json({ error: 'ID do exercício é obrigatório.' }, { status: 400 });
    }

    db.prepare('DELETE FROM exercises WHERE id = ?').run(exerciseId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete exercise error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao deletar exercício.' },
      { status: 500 }
    );
  }
}
