rm -rf mydb.sqlite
sqlite3 mydb.sqlite < migrations/001-user.sql
sqlite3 mydb.sqlite < migrations/002-chat.sql
sqlite3 mydb.sqlite < migrations/003-ctf.sql