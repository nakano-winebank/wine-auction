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

// 発送通知メール（購入者へ）
async function sendShippingNotification(email, buyerName, auctionTitle, trackingNumber, carrier, orderId) {
  const url = `${BASE_URL}/mypage`;
  const trackingInfo = trackingNumber
    ? `<tr><td style="padding:8px;background:#f5f5f5"><b>追跡番号</b></td><td style="padding:8px">${trackingNumber}${carrier ? ` (${carrier})` : ''}</td></tr>`
    : '';
  await sendMail({
    to: email,
    subject: `【WineBank】商品が発送されました：${auctionTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#6B1A1A">🍷 WineBank オークション</h2>
        <p>${buyerName} 様</p>
        <p>ご落札いただいた商品が発送されました。</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0">
          <tr><td style="padding:8px;background:#f5f5f5"><b>商品</b></td><td style="padding:8px">${auctionTitle}</td></tr>
          ${trackingInfo}
        </table>
        <p>商品到着後、マイページから受取確認をお願いいたします。</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;background:#6B1A1A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          マイページで確認する
        </a>
      </div>
    `,
  });
}

// ───────────────────────────────── 会員向け（マイ・セラー）

// 会員向けメールは銘柄名など DB 由来の文字列を差し込むので、HTML に落とす前にエスケープする。
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const yen = (n) => '¥' + Math.round(Number(n) || 0).toLocaleString();
const num = (n) => Math.round(Number(n) || 0).toLocaleString();
const day = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—'
    : `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

// 会員向けメールの共通の枠。ダーク×ゴールドではなく、メールクライアントで崩れない明色にしている。
function memberLayout(title, name, body, cta) {
  return `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
        <div style="border-bottom:2px solid #A78450;padding-bottom:12px;margin-bottom:20px">
          <span style="color:#A78450;font-size:20px;font-weight:bold;letter-spacing:.05em">WineBank</span>
          <span style="color:#888;font-size:13px;margin-left:8px">マイ・セラー</span>
        </div>
        <h2 style="font-size:17px;margin:0 0 16px">${esc(title)}</h2>
        <p style="margin:0 0 16px">${esc(name)} 様</p>
        ${body}
        ${cta ? `<p style="margin:24px 0 8px">
          <a href="${BASE_URL}${cta.href}" style="display:inline-block;background:#A78450;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">${esc(cta.label)}</a>
        </p>` : ''}
        <p style="color:#999;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">
          このメールは WineBank 会員の方にお送りしています。<br>
          ご不明な点は担当コンシェルジュまでお問い合わせください。
        </p>
      </div>`;
}

/**
 * マイル失効30日前の予告。
 * @param {object} m { email, name, amount, expiresAt, balance, lots: [{amount, expiresAt, kind}] }
 */
async function sendMileExpiryWarning(m) {
  const rows = (m.lots || []).map(l => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${day(l.expiresAt)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${num(l.amount)} マイル</td>
      </tr>`).join('');

  await sendMail({
    to: m.email,
    subject: `【WineBank】${num(m.amount)}マイルの有効期限が近づいています`,
    html: memberLayout('まもなく失効するワインマイルがあります', m.name, `
        <p style="margin:0 0 16px">
          <b style="color:#B45309;font-size:18px">${num(m.amount)} マイル</b>
          が <b>${day(m.expiresAt)}</b> までに失効します。
        </p>
        <table style="border-collapse:collapse;width:100%;margin:0 0 20px;font-size:14px">
          <tr style="background:#faf7f2">
            <th style="padding:8px;text-align:left;color:#666;font-weight:normal">失効日</th>
            <th style="padding:8px;text-align:right;color:#666;font-weight:normal">マイル</th>
          </tr>
          ${rows}
        </table>
        <p style="margin:0 0 8px;font-size:14px;color:#555">ワインマイルは、ワインのご購入のほか下記でもご利用いただけます。</p>
        <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#555;line-height:1.9">
          <li>系列レストラン・提携グランメゾンでのお支払い</li>
          <li>ワインスクールの受講料</li>
          <li>会員交流イベントの参加費</li>
          <li>オークション落札代金・CLUB年会費への充当</li>
        </ul>
        <p style="font-size:14px;color:#555">現在のマイル残高：<b>${num(m.balance)} マイル</b></p>`,
      { href: '/member', label: 'マイ・セラーでマイルを使う' }),
  });
}

/**
 * 年次還元マイルの付与通知。
 * @param {object} m { email, name, amount, expiresAt, balance, rankName, mileRate, bookValue }
 */
async function sendAnnualRewardNotice(m) {
  await sendMail({
    to: m.email,
    subject: `【WineBank】年次還元マイル ${num(m.amount)} を進呈しました`,
    html: memberLayout('年次還元マイルを進呈しました', m.name, `
        <p style="margin:0 0 16px">平素より WineBank をご利用いただきありがとうございます。</p>
        <p style="margin:0 0 16px">
          本年度の還元として <b style="color:#A78450;font-size:20px">${num(m.amount)} マイル</b> を進呈しました。
        </p>
        <table style="border-collapse:collapse;width:100%;margin:0 0 20px;font-size:14px">
          <tr><td style="padding:8px;background:#faf7f2;width:45%">会員ランク</td><td style="padding:8px"><b>${esc(m.rankName)}</b></td></tr>
          <tr><td style="padding:8px;background:#faf7f2">還元率</td><td style="padding:8px">${(Number(m.mileRate) * 100).toFixed(1)}%</td></tr>
          <tr><td style="padding:8px;background:#faf7f2">対象預かり資産（簿価）</td><td style="padding:8px">${yen(m.bookValue)}</td></tr>
          <tr><td style="padding:8px;background:#faf7f2">有効期限</td><td style="padding:8px">${m.expiresAt ? day(m.expiresAt) : '無期限'}</td></tr>
          <tr><td style="padding:8px;background:#faf7f2">現在のマイル残高</td><td style="padding:8px"><b>${num(m.balance)} マイル</b></td></tr>
        </table>`,
      { href: '/member', label: 'マイ・セラーで確認する' }),
  });
}

/**
 * 四半期の評価額レポート。
 * @param {object} m { email, name, quarterLabel, bookValue, marketValue, unrealizedGain,
 *                     unrealizedGainRate, bottles, rankName, mileRate, nextRank, balance }
 */
async function sendQuarterlyReport(m) {
  const gainPositive = Number(m.unrealizedGain) >= 0;
  const gainColor = gainPositive ? '#047857' : '#B91C1C';
  const gainSign = gainPositive ? '+' : '−';

  const nextRankBlock = m.nextRank ? `
        <div style="background:#faf7f2;border-left:3px solid #A78450;padding:12px 16px;margin:0 0 20px;font-size:14px">
          次のランク <b>${esc(m.nextRank.name)}</b> まであと <b>${yen(m.nextRank.remaining)}</b> です。<br>
          <span style="color:#666">${esc(m.nextRank.name)} になるとマイル還元率が ${(Number(m.nextRank.mile_rate) * 100).toFixed(1)}% になります。</span>
        </div>` : `
        <div style="background:#faf7f2;border-left:3px solid #A78450;padding:12px 16px;margin:0 0 20px;font-size:14px">
          最上位ランクをご維持いただいています。
        </div>`;

  await sendMail({
    to: m.email,
    subject: `【WineBank】${m.quarterLabel} 保有ワイン評価額レポート`,
    html: memberLayout(`${m.quarterLabel} 保有ワイン評価額レポート`, m.name, `
        <p style="margin:0 0 20px">${esc(m.quarterLabel)}時点の、お預かりしているワインの状況をお知らせします。</p>
        <table style="border-collapse:collapse;width:100%;margin:0 0 20px;font-size:14px">
          <tr><td style="padding:10px;background:#faf7f2;width:45%">保有本数</td><td style="padding:10px">${num(m.bottles)} 本</td></tr>
          <tr><td style="padding:10px;background:#faf7f2">簿価（取得価額）</td><td style="padding:10px">${yen(m.bookValue)}</td></tr>
          <tr><td style="padding:10px;background:#faf7f2">時価評価額</td><td style="padding:10px;font-size:17px"><b>${yen(m.marketValue)}</b></td></tr>
          <tr><td style="padding:10px;background:#faf7f2">含み損益</td>
              <td style="padding:10px;color:${gainColor};font-weight:bold">
                ${gainSign}${yen(Math.abs(Number(m.unrealizedGain))).slice(1)}
                （${(Number(m.unrealizedGainRate) * 100).toFixed(1)}%）
              </td></tr>
          <tr><td style="padding:10px;background:#faf7f2">会員ランク</td><td style="padding:10px"><b>${esc(m.rankName)}</b>（マイル還元 ${(Number(m.mileRate) * 100).toFixed(1)}%）</td></tr>
          <tr><td style="padding:10px;background:#faf7f2">ワインマイル残高</td><td style="padding:10px">${num(m.balance)} マイル</td></tr>
        </table>
        ${nextRankBlock}
        <p style="color:#999;font-size:12px">
          ※ 時価は市場データおよび当社査定に基づく参考値です。売却を保証するものではありません。
        </p>`,
      { href: '/member', label: 'マイ・セラーで明細を見る' }),
  });
}

module.exports = {
  sendMileExpiryWarning,
  sendAnnualRewardNotice,
  sendQuarterlyReport,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAdminNewListingNotification,
  sendAuctionApprovedEmail,
  sendAuctionRejectedEmail,
  sendWatchlistBidNotification,
  sendNewMessageNotification,
  sendShippingNotification,
};
