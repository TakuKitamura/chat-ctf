CREATE TABLE Chat (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   roomID INTEGER,
   userID TEXT,
   sendto TEXT,
   message TEXT,
   foreign key (userID) references User(userID),
   foreign key (sendto) references User(userID)
);

PRAGMA foreign_keys=true;
