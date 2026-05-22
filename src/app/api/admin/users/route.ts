import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Helper to double-check admin permission in endpoint logic
async function verifyAdmin() {
  const user = await getCurrentUser();
  return user && user.email === 'rwaguimaraes@gmail.com';
}

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: 'Acesso proibido.' }, { status: 403 });
    }

    const users = db.prepare(`
      SELECT id, username, email, avatar_color, created_at,
             (SELECT COUNT(*) FROM exercises WHERE user_id = users.id) as exercise_count,
             (SELECT COUNT(*) FROM sessions WHERE user_id = users.id) as session_count
      FROM users
      ORDER BY created_at DESC
    `).all();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin fetch users error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao buscar usuários.' },
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
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 });
    }

    // Double check that we are not deleting the admin user
    const targetUser = db.prepare('SELECT email FROM users WHERE id = ?').get(userId) as { email: string } | undefined;
    if (targetUser?.email === 'rwaguimaraes@gmail.com') {
      return NextResponse.json({ error: 'Não é permitido deletar o administrador principal.' }, { status: 400 });
    }

    // Cascade deletes exercises, sessions, messages automatically due to ON DELETE CASCADE
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao deletar usuário.' },
      { status: 500 }
    );
  }
}
