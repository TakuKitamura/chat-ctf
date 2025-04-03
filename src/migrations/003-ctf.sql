CREATE TABLE Ctf (
   id INTEGER PRIMARY KEY,
   title TEXT,
   template TEXT,
   attachmentButton BOOLEAN
);

INSERT INTO Ctf (id, title, template, attachmentButton) VALUES ('0', 'WebCTF', '', 'false');

-- To add a bot, edit the following
INSERT INTO Ctf (id, title, template, attachmentButton) VALUES ('1', 'Echo Bot', '', 'false');
INSERT INTO Ctf (id, title, template, attachmentButton) VALUES ('2', 'アーティスト検索 Bot', 'search=santana<br>n=3', 'false');
INSERT INTO Ctf (id, title, template, attachmentButton) VALUES ('3', 'グレースケール変換 Bot', '', 'true');
INSERT INTO Ctf (id, title, template, attachmentButton) VALUES ('4', 'FizzBuzz Bot', 'n=20', 'false');
INSERT INTO Ctf (id, title, template, attachmentButton) VALUES ('5', 'Excel解析 Bot', 'help', 'false');
