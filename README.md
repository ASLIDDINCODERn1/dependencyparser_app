# O'zbek Dependency Parser

Universal Dependencies standartida o'zbek tili uchun AI-asosidagi dependency parser.

## Deploy to Vercel

### 1. GitHub'ga yuklash

```bash
git init
git add .
git commit -m "initial commit"
gh repo create uzbek-dependency-parser --public --push
```

### 2. Vercel'ga ulash

1. [vercel.com](https://vercel.com) ga kiring
2. **Add New Project** → GitHub repo ni tanlang
3. Framework: **Vite** (avtomatik aniqlanadi)
4. **Environment Variables** bo'limiga o'ting:
   - `ANTHROPIC_API_KEY` = `sk-ant-...` (Anthropic API kalitingiz)
5. **Deploy** tugmasini bosing

### 3. Local ishga tushirish

```bash
npm install
```

`.env.local` fayl yarating:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

```bash
npm run dev
```

## Loyiha tuzilmasi

```
dep-parser/
├── api/
│   └── analyze.js        # Vercel serverless function (API proxy)
├── src/
│   ├── main.jsx          # React entry point
│   └── App.jsx           # Asosiy komponent
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

## Texnologiyalar

- **React 18** + **Vite**
- **Claude claude-sonnet-4-20250514** (Anthropic API)
- **SheetJS** (Excel eksport)
- Vercel Serverless Functions (API proxy)
