# Location Based Reminder API Documentation
The URL for the API is locationreminder.azurewebsites.net 

1. /signup
	* Input : name, email, phoneno, password, secret
	* Output : 
	``` 
		{
			status : 200
		}
		OR 
		{
			status : 405 
			error : "Uauthorized Access"
		}
		OR 
		{
			status : 400
			error : "Not enough parameters passed"
		}
		OR
		{
			status : 500
			error : "Some database error"
		}
	```

2. /login
	* Input : email, password, secret
	* Output :
	``` 
		{
			status : 200
		}
		OR 
		{
			status : 404
			error : "Either username or password is incorrect"
		}
		OR 
		{
			status : 405 
			error : "Uauthorized Access"
		}
		OR 
		{
			status : 400
			error : "Not enough parameters passed"
		}
		OR
		{
			status : 500
			error : "Some database error"
		}
	```

3. /getalllists 
	* Input : email, secret
	* Output : 
	``` 
		{
			status : 200
			rows : [This will be an array of all lists for the given user]
		}
		OR 
		{
			status : 405 
			error : "Uauthorized Access"
		}
		OR 
		{
			status : 400
			error : "Not enough parameters passed"
		}
		OR
		{
			status : 500
			error : "Some database error"
		}
	```

4. /getlistcontents 
	* Input : list_id, secret
	* Output :
	``` 
		{
			status : 200
			rows : [List contents of the supplied list ID]
		}
		OR 
		{
			status : 405 
			error : "Uauthorized Access"
		}
		OR 
		{
			status : 400
			error : "Not enough parameters passed"
		}
		OR
		{
			status : 500
			error : "Some database error"
		}
	```

5. /additem
	* Input : list_id, email, item_name, location_name, latitude, logitude and secret
	* Notes : Atleast list_id, email, item_name and secret should be there. Email here refers to the user who adds the item
	* Output :
	``` 
		{
			status : 200
			item_id : item id of the newly added item - store this to support deletion operation
		}
		OR 
		{
			status : 405 
			error : "Uauthorized Access"
		}
		OR 
		{
			status : 400
			error : "Not enough parameters passed"
		}
		OR
		{
			status : 500
			error : "Some database error"
		}
	```

6. /deleteitem
	* Input : list_id, item_id and secret
	* Output : 
	``` 
		{
			status : 200
		}
		OR 
		{
			status : 405 
			error : "Uauthorized Access"
		}
		OR 
		{
			status : 400
			error : "Not enough parameters passed"
		}
		OR
		{
			status : 500
			error : "Some database error"
		}
	```

7. /markdone 
	* Input : list_id, item_id and secret 
	* Output :
	``` 
		{
			status : 200
		}
		OR 
		{
			status : 405 
			error : "Uauthorized Access"
		}
		OR 
		{
			status : 400
			error : "Not enough parameters passed"
		}
		OR
		{
			status : 500
			error : "Some database error"
		}
	```

8. /share 
	* Input : list_id, src_email and label
	* Output :
	```
		{
			status : 200
		}
		OR 
		{
			status : 405 
			error : "Uauthorized Access"
		}
		OR 
		{
			status : 400
			error : "Not enough parameters passed"
		}
		OR
		{
			status : 500
			error : "Some database error"
		}
	```

9. /unshare
	* Input : list_id, src_email and label
	* Output :
	```
		{
			status : 200
		}
		OR 
		{
			status : 405 
			error : "Uauthorized Access"
		}
		OR 
		{
			status : 400
			error : "Not enough parameters passed"
		}
		OR
		{
			status : 500
			error : "Some database error"
		}
	```
	
10. /createlist
	* Input : list_name, email and secret
	* Output :
	```
		{
			status : 200
			list_id : list id will be returned here - save for further insertions and deletions
		}
		OR 
		{
			status : 405 
			error : "Uauthorized Access"
		}
		OR 
		{
			status : 400
			error : "Not enough parameters passed"
		}
		OR
		{
			status : 500
			error : "Some database error"
		}
	```

11. /deletelist
	* Input : list_id, src_email and label
	* Output :
	```
		{
			status : 200
			list_id : list_id goes here - store this to support deletion
		}
		OR 
		{
			status : 405 
			error : "Uauthorized Access"
		}
		OR 
		{
			status : 400
			error : "Not enough parameters passed"
		}
		OR
		{
			status : 500
			error : "Some database error"
		}
	```