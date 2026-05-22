import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser, hashPassword, signToken } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { username, email, avatar_color, password } = await request.json();

    const updates: string[] = [];
    const params: any[] = [];
    let newUsername = user.username;
    let newEmail = user.email || '';
    let newAvatarColor = user.avatar_color;

    // 0. Handle email update
    if (email && email.trim().toLowerCase() !== (user.email || '')) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
        return NextResponse.json(
          { error: 'Por favor, informe um endereço de e-mail válido.' },
          { status: 400 }
        );
      }

      // Check if email is taken
      const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(trimmedEmail, user.id);
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Este e-mail já está em uso.' },
          { status: 400 }
        );
      }

      updates.push('email = ?');
      params.push(trimmedEmail);
      newEmail = trimmedEmail;
    }

    // 1. Handle username update
    if (username && username.trim() !== user.username) {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3) {
        return NextResponse.json(
          { error: 'O nome de usuário deve ter pelo menos 3 caracteres.' },
          { status: 400 }
        );
      }

      // Check if username is taken
      const existingUser = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(trimmedUsername, user.id);
      if (existingUser) {
        return NextResponse.json(
          { error: 'Este nome de usuário já está em uso.' },
          { status: 400 }
        );
      }

      updates.push('username = ?');
      params.push(trimmedUsername);
      newUsername = trimmedUsername;

      // Update old chat messages username cache
      db.prepare('UPDATE chat_messages SET username = ? WHERE user_id = ?').run(trimmedUsername, user.id);
    }

    // 2. Handle avatar color update
    if (avatar_color && avatar_color !== user.avatar_color) {
      updates.push('avatar_color = ?');
      params.push(avatar_color);
      newAvatarColor = avatar_color;
    }

    // 3. Handle password update
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'A nova senha deve ter pelo menos 6 caracteres.' },
          { status: 400 }
        );
      }
      const newHash = await hashPassword(password);
      updates.push('password_hash = ?');
      params.push(newHash);
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: true,
        user: { id: user.id, username: user.username, email: user.email, avatar_color: user.avatar_color },
      });
    }

    // Update database
    params.push(user.id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...params);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: newUsername, email: newEmail, avatar_color: newAvatarColor },
    });

    // Re-sign session cookie with new username snapshot
    const token = await signToken({ userId: user.id, username: newUsername, email: newEmail });
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
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Erro no servidor ao atualizar perfil.' },
      { status: 500 }
    );
  }
}
