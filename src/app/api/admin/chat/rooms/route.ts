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

    const dbRooms = db.prepare(`
      SELECT room_name, COUNT(*) as message_count
      FROM chat_messages
      GROUP BY room_name
    `).all() as { room_name: string; message_count: number }[];

    const dbExercises = db.prepare(`
      SELECT DISTINCT LOWER(name) as name FROM exercises
    `).all() as { name: string }[];

    const roomsMap = new Map<string, number>();
    
    // Add all exercises as rooms (with 0 default messages)
    dbExercises.forEach(ex => {
      if (ex.name) {
        roomsMap.set(ex.name.trim().toLowerCase(), 0);
      }
    });

    // Merge actual message counts
    dbRooms.forEach(room => {
      roomsMap.set(room.room_name, room.message_count);
    });

    const rooms = Array.from(roomsMap.entries()).map(([room_name, message_count]) => ({
      room_name,
      message_count
    })).sort((a, b) => a.room_name.localeCompare(b.room_name));

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Admin fetch chat rooms error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao buscar salas de chat.' },
      { status: 500 }
    );
  }
}
