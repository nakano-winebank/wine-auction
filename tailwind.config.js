/**
 * Tailwind の設定。
 *
 * 以前は各 HTML が cdn.tailwindcss.com（Tailwind 公式が本番非推奨としている
 * ブラウザ内コンパイル版）を読み、ページごとに tailwind.config をインラインで
 * 持っていた。外部CDNに落ちると全ページが素のHTMLになるうえ、初期表示に
 * スタイル未適用のちらつきが出るため、静的な CSS をビルドして自前で配信する。
 *
 *   npm run build:css      1回ビルド
 *   npm run watch:css      変更を監視してビルド
 *
 * 生成物 public/css/tailwind.css はリポジトリにコミットしてあるので、
 * デプロイ時にビルド手順は要らない。クラスを増やしたときだけ build:css を回す。
 */
module.exports = {
  content: [
    // HTML 内のインライン <script> に書いたクラス名も走査対象に入る
    './public/**/*.html',
    './*.html',
    // サーバ側にもクラス名の実体がある。auctions.image_color に入るグラデーション
    // （'from-red-900 via-red-700 to-red-900' など）はここでしか字面が出てこないので、
    // 含めておかないとビルドから漏れて一覧のサムネイルが無色になる。
    './database.js',
    './routes/**/*.js',
    './services/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // 各ページのインライン設定を統合したもの。値は元の定義と同じ。
        gold: { DEFAULT: '#A78450', hover: '#8B6914', dim: 'rgba(167,132,80,0.15)' },
        dark: { 900: '#0A0A0A', 800: '#141414', 700: '#1C1C1C', 600: '#252525', 500: '#2F2F2F' },
      },
      fontFamily: {
        // Web フォントが読めなくても日本語が破綻しないよう、実在するフォールバックまで書く
        serif: ['"Noto Serif JP"', '"Hiragino Mincho ProN"', '"Yu Mincho"', 'serif'],
        sans: ['Inter', '"Noto Sans JP"', '"Hiragino Sans"', '"Yu Gothic"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
