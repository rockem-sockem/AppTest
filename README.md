# AppTest
What's right?!

To create an admin, first sign up as a regular user
so we create a hashed password for the admin and 
then update its role in the mongo shell.

> use DB_NAME // name of the db where the users collection is
> db.COLLECTION_NAME.update( // collection name of the user's list
    { "username" : ADMIN_NAME },
    { $set: { "role": "admin" }}
  )