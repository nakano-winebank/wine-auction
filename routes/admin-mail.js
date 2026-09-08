/**
 * 管理者向け メール送信設定の確認（/api/admin/mail）
 *
 * 会員宛メールを本番で流す前に、送信元ドメインの認証状況と各テンプレートの
 * 実際の見え方を確認するための画面。テスト送信の宛先は必ず操作した管理者本人に固定し、
 * 任意の宛先へは送れないようにしている。
 */
const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const mailer = require('../utils/mailer');
const notifications = require('../services/notifications');

async function requireAdmin(req, res, next) {
  const user = await db.prepare('SELECT is_admin, email, display_name, full_name FROM users WHERE id = ?')
    .get(req.user.id);
  if (!user || !user.is_admin) return res.status(403).json({ error: '管理者権限が必要です' });
  req.admin = user;
  next();
}

router.use(authenticateToken, requireAdmin);

const handle = (fn) => async (req, res) => {
  try { await fn(req, res); } catch (e) { res.status(400).json({ error: e.message }); }
};

/** 差出人表記からメールアドレス部分を取り出す（"名前 <a@b>" → "a@b"）。 */
function addressOf(from) {
  const m = String(from || '').match(/<([^>]+)>/);
  return (m ? m[1] : String(from || '')).trim();
}

/**
 * 送信の事前チェック。APIキー・送信元・バッチの有効化状態に加え、
 * Resend 側でドメインが認証済みかどうかも問い合わせる。
 */
router.get('/status', handle(async (req, res) => {
  const config = mailer.mailConfig();
  const memberDomain = (addressOf(config.memberFrom).split('@')[1] || '').toLowerCase();

  const checks = [];
  checks.push({
    key: 'api_key', label: 'Resend APIキー',
    ok: config.hasApiKey,
    detail: config.hasApiKey ? '設定済み' : 'RESEND_API_KEY が未設定です（メールは送信されず、コンソールに出力されます）',
  });
  checks.push({
    key: 'member_from', label: '会員向けメールの送信元',
    ok: !!memberDomain,
    detail: config.memberFrom,
  });
  checks.push({
    key: 'reply_to', label: '返信先',
    ok: !!config.memberReplyTo,
    detail: config.memberReplyTo || 'MEMBER_EMAIL_REPLY_TO が未設定です（返信先なしで送信されます）',
    severity: 'warn',
  });
  checks.push({
    key: 'batch', label: '通知バッチ',
    ok: notifications.isBatchEnabled(),
    detail: notifications.isBatchEnabled()
      ? '有効（1日1回送信します）'
      : 'MEMBER_MAIL_BATCH が未設定です。失効30日前の予告は失効条項の有効性を支えるため、本番では必須です',
  });
  checks.push({
    key: 'base_url', label: 'メール内リンクの宛先',
    ok: !/localhost/.test(config.baseUrl),
    detail: config.baseUrl,
    severity: /localhost/.test(config.baseUrl) ? 'warn' : null,
  });

  // Resend にドメインの認証状況を問い合わせる（APIキーがあるときだけ）
  let domains = null;
  let domainError = null;
  if (config.hasApiKey) {
    try {
      const r = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      if (r.ok) {
        const body = await r.json();
        domains = (body.data || []).map(d => ({ name: d.name, status: d.status, region: d.region }));
      } else {
        domainError = `Resend API error ${r.status}`;
      }
    } catch (e) {
      domainError = e.message;
    }
  }

  if (domains) {
    const hit = domains.find(d => String(d.name).toLowerCase() === memberDomain);
    checks.push({
      key: 'domain', label: `送信ドメインの認証（${memberDomain || '—'}）`,
      ok: !!hit && hit.status === 'verified',
      detail: hit
        ? `Resend 上の状態: ${hit.status}`
        : `${memberDomain} が Resend に登録されていません。DNS レコード（SPF / DKIM）の設定が必要です`,
    });
  }

  res.json({
    config: { ...config, memberDomain },
    checks,
    domains,
    domainError,
    ready: checks.filter(c => c.severity !== 'warn').every(c => c.ok),
  });
}));

/** 送る予定の内容を、送信せずに確認する。 */
router.get('/preview', handle(async (req, res) => {
  const { results } = await notifications.runAll({ dryRun: true, force: true });
  res.json({ results });
}));

/**
 * テンプレートのテスト送信。宛先は操作した管理者本人のメールアドレスに固定する
 * （任意の宛先を受け取らないことで、この画面が送信の踏み台にならないようにする）。
 */
const SAMPLES = {
  mile_expiry: (to, name) => mailer.sendMileExpiryWarning({
    email: to, name, amount: 53000, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    balance: 233000,
    lots: [
      { amount: 3000, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(), kind: 'bonus' },
      { amount: 50000, expiresAt: new Date(Date.now() + 44 * 86400000).toISOString(), kind: 'reward' },
    ],
  }),
  annual_reward: (to, name) => mailer.sendAnnualRewardNotice({
    email: to, name, amount: 180000,
    expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
    balance: 180000, rankName: 'GOLD', mileRate: 0.045, bookValue: 4000000,
  }),
  quarterly_report: (to, name) => mailer.sendQuarterlyReport({
    email: to, name, quarterLabel: '2026年 第3四半期',
    bottles: 16, bookValue: 4000000, marketValue: 4320000,
    unrealizedGain: 320000, unrealizedGainRate: 0.08,
    rankName: 'GOLD', mileRate: 0.045,
    nextRank: { name: 'SIGNATURE', remaining: 6000000, mile_rate: 0.055 },
    balance: 180000,
  }),
};

router.post('/test-send', handle(async (req, res) => {
  const type = req.body.type;
  const send = SAMPLES[type];
  if (!send) throw new Error(`不明なテンプレートです: ${Object.keys(SAMPLES).join(' / ')}`);
  if (!req.admin.email) throw new Error('ご自身のメールアドレスが登録されていません');

  await send(req.admin.email, req.admin.full_name || req.admin.display_name || '管理者');
  res.json({
    sent: true,
    to: req.admin.email,
    note: mailer.mailConfig().hasApiKey
      ? null : 'RESEND_API_KEY が未設定のため、実際には送信せずサーバのコンソールに出力しました',
  });
}));

module.exports = router;
