import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawRoomName = searchParams.get('room');

    if (!rawRoomName) {
      return NextResponse.json({ error: 'Nome da sala é obrigatório.' }, { status: 400 });
    }

    const roomName = rawRoomName.trim().toLowerCase();

    const messages = db.prepare(`
      SELECT c.id, c.room_name, c.user_id, c.username, c.message, c.created_at, u.avatar_color
      FROM chat_messages c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.room_name = ?
      ORDER BY c.created_at ASC
      LIMIT 100
    `).all(roomName);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Fetch chat messages error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao buscar mensagens.' },
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

    const { room, message } = await request.json();

    if (!room || !message || message.trim() === '') {
      return NextResponse.json({ error: 'Sala e mensagem são obrigatórias.' }, { status: 400 });
    }

    const roomName = room.trim().toLowerCase();
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO chat_messages (id, room_name, user_id, username, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, roomName, user.id, user.username, message.trim());

    const newMessage = {
      id,
      room_name: roomName,
      user_id: user.id,
      username: user.username,
      message: message.trim(),
      created_at: new Date().toISOString(),
      avatar_color: user.avatar_color,
    };

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Send chat message error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao enviar mensagem.' },
      { status: 500 }
    );
  }
}
