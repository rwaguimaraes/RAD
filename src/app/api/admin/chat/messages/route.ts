import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

async function verifyAdmin() {
  const user = await getCurrentUser();
  return user && user.email === 'rwaguimaraes@gmail.com';
}

export async function GET(request: Request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: 'Acesso proibido.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const room = searchParams.get('room');

    if (!room) {
      return NextResponse.json({ error: 'Sala é obrigatória.' }, { status: 400 });
    }

    const roomName = room.trim().toLowerCase();

    const messages = db.prepare(`
      SELECT c.id, c.room_name, c.user_id, c.username, c.message, c.created_at, u.avatar_color, u.email
      FROM chat_messages c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.room_name = ?
      ORDER BY c.created_at ASC
      LIMIT 100
    `).all(roomName);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Admin fetch chat messages error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao buscar mensagens.' },
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
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json({ error: 'ID da mensagem é obrigatório.' }, { status: 400 });
    }

    db.prepare('DELETE FROM chat_messages WHERE id = ?').run(messageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete chat message error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao deletar mensagem.' },
      { status: 500 }
    );
  }
}
