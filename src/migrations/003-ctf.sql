CREATE TABLE Ctf (
   id INTEGER PRIMARY KEY,
   sortID INTEGER UNIQUE,
   title TEXT,
   description TEXT,
   template TEXT,
   attachmentButton BOOLEAN,
   messageInput BOOLEAN
);

INSERT INTO Ctf (id, sortID, title, description, template, attachmentButton, messageInput) VALUES ('0', '0', 'WebCTF', '', '', 'false', 'true');
INSERT INTO Ctf (id, sortID, title, description, template, attachmentButton, messageInput) VALUES ('1', '1', 'Echo Bot', '#1', '', 'false', 'true');
INSERT INTO Ctf (id, sortID, title, description, template, attachmentButton, messageInput) VALUES ('2', '2', 'アーティスト検索 Bot', '#2', 'search=santana<br>n=3', 'false', 'true');
INSERT INTO Ctf (id, sortID, title, description, template, attachmentButton, messageInput) VALUES ('3', '3', 'グレースケール変換 Bot', '#3', '', 'true', 'false');
INSERT INTO Ctf (id, sortID, title, description, template, attachmentButton, messageInput) VALUES ('4', '4','FizzBuzz Bot', '#4', 'n=20', 'false', 'true');
INSERT INTO Ctf (id, sortID, title, description, template, attachmentButton, messageInput) VALUES ('5', '5', 'Excel解析 Bot', '#5', 'help', 'true', 'true');