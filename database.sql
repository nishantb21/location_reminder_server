﻿/*CREATE TABLE users ([email] NVARCHAR(100) PRIMARY KEY NOT NULL, [name] NVARCHAR(200) NOT NULL, [phoneno] NCHAR(10) NOT NULL, [password] NVARCHAR(100) NOT NULL);
CREATE TABLE lists ([list_id] INT PRIMARY KEY IDENTITY(1,1) NOT NULL, owner NVARCHAR(100) NOT NULL, [title] NVARCHAR(200) NOT NULL, CONSTRAINT Fk_owner FOREIGN KEY(owner) REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE);
insert into users(email,name,phoneno,password) values('nishantb21@gmail.com','Nishant Bhattacharya','9739862022','nishantb21');
insert into lists(owner, title) values ('nishantb21@gmail.com','Sample list');
CREATE TABLE circles ([src_email] NVARCHAR(100) NOT NULL, [dest_email] NVARCHAR(100) NOT NULL, label NVARCHAR(50) NOT NULL, CONSTRAINT Pk PRIMARY KEY(src_email,dest_email), CONSTRAINT Fk_1 FOREIGN KEY(src_email) REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE, CONSTRAINT Fk_2 FOREIGN KEY(dest_email) REFERENCES users(email));
CREATE TABLE lists_share ([list_id] INT NOT NULL, [email] NVARCHAR(100) NOT NULL, CONSTRAINT Pk_lists_share PRIMARY KEY(list_id,email), CONSTRAINT Fk_1_lists_share FOREIGN KEY(list_id) REFERENCES lists(list_id) ON UPDATE CASCADE ON DELETE CASCADE, CONSTRAINT Fk_2_lists_share FOREIGN KEY(email) REFERENCES users(email))
CREATE TABLE list_contents ([list_id] INT NOT NULL, [item_id] INT NOT NULL IDENTITY(1,1), [email] NVARCHAR(100) NOT NULL, [item_name] NVARCHAR(300) NOT NULL, [location_name] NVARCHAR(500), [longitude] FLOAT, [latitude] FLOAT, done BIT, CONSTRAINT Pk_list_contents PRIMARY KEY(list_id, item_id), CONSTRAINT FK_1_list_contents FOREIGN KEY(list_id) REFERENCES lists(list_id) ON UPDATE CASCADE ON DELETE CASCADE, CONSTRAINT FK_2_list_contents FOREIGN KEY(email) REFERENCES users(email))
CREATE TABLE tokens([email] NVARCHAR(100) NOT NULL PRIMARY KEY, [token] NVARCHAR(500) NOT NULL, CONSTRAINT fk_tokens FOREIGN KEY(email) REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE);
ALTER TABLE lists ADD shareable BIT NOT NULL CONSTRAINT default_value DEFAULT 0;*/