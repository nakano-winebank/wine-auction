const nodemailer = require('nodemailer');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// SMTPトランスポート（環境変数未設定時はコンソール出力）
function getTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // 開発時: コンソールにログ出力
  return null;
}

async function sendMail({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    // 開発モード: コンソールに出力
    console.log('\n📧 ===== [DEV MAIL] =====');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html.replace(/<[^>]+>/g, ''));
    console.log('========================\n');
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"ワインオークション" <noreply@wine-auction.jp>',
    to,
    subject,
    html,
  });
}

async function sendVerificationEmail(email, username, token) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${token}`;
  await sendMail({
    to: email,
    subject: '【ワインオークション】メールアドレスの確認',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#7B2D8B">🍷 ワインオークション</h2>
        <p>${username} さん、ご登録ありがとうございます。</p>
        <p>以下のボタンからメールアドレスを確認してください。</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;background:#C0392B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          メールアドレスを確認する
        </a>
        <p style="color:#888;font-size:12px">このリンクは24時間有効です。心当たりがない場合は無視してください。</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(email, username, token) {
  const url = `${BASE_URL}/reset-password?token=${token}`;
  await sendMail({
    to: email,
    subject: '【ワインオークション】パスワードリセット',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#7B2D8B">🍷 ワインオークション</h2>
        <p>${username} さん</p>
        <p>パスワードリセットのリクエストを受け付けました。</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;background:#C0392B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          パスワードをリセットする
        </a>
        <p style="color:#888;font-size:12px">このリンクは1時間有効です。心当たりがない場合は無視してください。</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
