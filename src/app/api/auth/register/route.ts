import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !username || !password || username.trim().length < 3 || password.length < 6) {
      return NextResponse.json(
        { error: 'E-mail, usuário (mínimo 3 caracteres) e senha (mínimo 6 caracteres) são obrigatórios.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();

    // Basic email format check
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return NextResponse.json(
        { error: 'Por favor, informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    // Check if email is taken
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(trimmedEmail);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Este e-mail já está em uso.' },
        { status: 400 }
      );
    }

    // Check if username is taken
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(trimmedUsername);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este nome de usuário já está em uso.' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    db.prepare('INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?)').run(
      id,
      trimmedEmail,
      trimmedUsername,
      passwordHash
    );

    // Create session token
    const token = await signToken({ userId: id, username: trimmedUsername, email: trimmedEmail });

    const response = NextResponse.json({ success: true, user: { id, email: trimmedEmail, username: trimmedUsername } });
    
    // Set token as a cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao registrar usuário.' },
      { status: 500 }
    );
  }
}
