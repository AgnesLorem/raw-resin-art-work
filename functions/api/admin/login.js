// functions/api/admin/login.js
import { generateAdminToken } from '../../_shared/admin-auth.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const { secretKey } = body;

    const expectedSecret = (context.env && context.env.ADMIN_SECRET) ? context.env.ADMIN_SECRET : 'raw_admin_secret_su26';

    if (!secretKey || secretKey.trim() !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Khóa quản trị (Admin Key) không chính xác.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const session = await generateAdminToken(context.env);

    return new Response(
      JSON.stringify({
        success: true,
        token: session.token,
        expiresAt: session.expiresAt,
        message: 'Đăng nhập trang quản trị thành công.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
