const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || 'WineBank オークション <noreply@wine-bank.co.jp>';

async function sendMail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    // Dev fallback: log to console
    console.log('\n📧 ===== [DEV MAIL] =====');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html.replace(/<[^>]+>/g, ''));
    console.log('========================\n');
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error ${res.status}: ${err}`);
  }
}

// メール認証
async function sendVerificationEmail(email, username, token) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${token}`;
  await sendMail({
    to: email,
    subject: '【WineBank】メールアドレスの確認',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#7B2D8B">🍷 WineBank オークション</h2>
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

// パスワードリセット
async function sendPasswordResetEmail(email, username, token) {
  const url = `${BASE_URL}/reset-password?token=${token}`;
  await sendMail({
    to: email,
    subject: '【WineBank】パスワードリセット',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#7B2D8B">🍷 WineBank オークション</h2>
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

// 管理者へ出品承認依頼通知
async function sendAdminNewListingNotification(adminEmail, sellerName, auctionTitle, auctionId) {
  const url = `${BASE_URL}/admin`;
  await sendMail({
    to: adminEmail,
    subject: `【WineBank管理】出品承認依頼：${auctionTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#7B2D8B">🍷 WineBank 管理通知</h2>
        <p>新しい出品申請が届きました。</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0">
          <tr><td style="padding:8px;background:#f5f5f5;width:100px"><b>出品者</b></td><td style="padding:8px">${sellerName}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><b>商品</b></td><td style="padding:8px">${auctionTitle}</td></tr>
        </table>
        <a href="${url}" style="display:inline-block;margin:16px 0;background:#7B2D8B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          管理画面で確認・承認する
        </a>
      </div>
    `,
  });
}

// 出品者へ承認通知
async function sendAuctionApprovedEmail(email, sellerName, auctionTitle, auctionId) {
  const url = `${BASE_URL}/detail?id=${auctionId}`;
  await sendMail({
    to: email,
    subject: `【WineBank】出品が承認されました：${auctionTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#7B2D8B">🍷 WineBank オークション</h2>
        <p>${sellerName} 様</p>
        <p>出品申請が承認され、オークションが開始されました。</p>
        <p style="font-weight:bold">${auctionTitle}</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;background:#C0392B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          出品ページを確認する
        </a>
      </div>
    `,
  });
}

// 出品者へ否認通知
async function sendAuctionRejectedEmail(email, sellerName, auctionTitle, reason) {
  await sendMail({
    to: email,
    subject: `【WineBank】出品が否認されました：${auctionTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#7B2D8B">🍷 WineBank オークション</h2>
        <p>${sellerName} 様</p>
        <p>大変申し訳ございませんが、以下の出品申請は否認となりました。</p>
        <p style="font-weight:bold">${auctionTitle}</p>
        ${reason ? `<p style="background:#FEF2F2;border:1px solid #FECACA;padding:12px;border-radius:8px;color:#991B1B">否認理由：${reason}</p>` : ''}
        <p>詳細は管理者までお問い合わせください。</p>
      </div>
    `,
  });
}

// ウォッチリスト商品に入札通知
async function sendWatchlistBidNotification(email, watcherName, auctionTitle, newAmount, auctionId) {
  const url = `${BASE_URL}/detail?id=${auctionId}`;
  await sendMail({
    to: email,
    subject: `【WineBank】ウォッチ中の商品に入札が入りました：${auctionTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#7B2D8B">🍷 WineBank オークション</h2>
        <p>${watcherName} 様</p>
        <p>ウォッチリストに登録中の商品に新しい入札が入りました。</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0">
          <tr><td style="padding:8px;background:#f5f5f5"><b>商品</b></td><td style="padding:8px">${auctionTitle}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><b>現在の最高額</b></td><td style="padding:8px;color:#c0392b;font-weight:bold">¥${newAmount.toLocaleString()}</td></tr>
        </table>
        <a href="${url}" style="display:inline-block;margin:16px 0;background:#C0392B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          入札ページへ
        </a>
      </div>
    `,
  });
}

// 落札後のメッセージ通知
async function sendNewMessageNotification(email, receiverName, senderName, auctionTitle, orderId) {
  const url = `${BASE_URL}/mypage`;
  await sendMail({
    to: email,
    subject: `【WineBank】新しいメッセージが届きました：${auctionTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#7B2D8B">🍷 WineBank オークション</h2>
        <p>${receiverName} 様</p>
        <p>${senderName} さんからメッセージが届きました。</p>
        <p style="font-weight:bold">${auctionTitle}</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;background:#C0392B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          マイページでメッセージを確認する
        </a>
      </div>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAdminNewListingNotification,
  sendAuctionApprovedEmail,
  sendAuctionRejectedEmail,
  sendWatchlistBidNotification,
  sendNewMessageNotification,
};
