
CREATE TABLE User (
   userID TEXT UNIQUE,
   password TEXT,
   iconURL TEXT
);

INSERT INTO USER (userID, password, iconURL) VALUES ('Admin', '$2b$10$1GNO.cR/ESlkw3SQwj7wXeC3QUfY/fSvvU2p7xjya.Bv80afl4w/K', 'https://3.bp.blogspot.com/-ZEj-e9GaKXI/Uxa-0yAvBeI/AAAAAAAAdzQ/OZTXL4JjFvw/s800/character_apple.png');

INSERT INTO USER (userID, password, iconURL) VALUES ('bot', '', '/1f916.png');
