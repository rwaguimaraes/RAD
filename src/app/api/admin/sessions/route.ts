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

    const sessions = db.prepare(`
      SELECT s.id, s.date, s.start_time, s.end_time, s.reps, s.physical, s.emotional, s.weather, s.moon, s.notes, s.created_at,
             u.username as practitioner_name, u.email as practitioner_email,
             e.name as exercise_name
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      JOIN exercises e ON s.exercise_id = e.id
      ORDER BY s.created_at DESC
    `).all();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Admin fetch sessions error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao buscar sessões.' },
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
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ error: 'ID da sessão é obrigatório.' }, { status: 400 });
    }

    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete session error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao deletar sessão.' },
      { status: 500 }
    );
  }
}
