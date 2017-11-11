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
			"lists": [
				{
					"list_id": 12,
					"empty": false,
					"items": [
						{
							"item_id": 15,
							"email": "nishantb21@gmail.com",
							"item_name": "laptop",
							"location_name": "cr road",
							"longitude": 77.89123,
							"latitude": 12.76878,
							"done": false
						},
						{
							"item_id": 16,
							"email": "nishantb21@gmail.com",
							"item_name": "Milk and Eggs",
							"location_name": null,
							"longitude": null,
							"latitude": null,
							"done": false
						}
					],
					"title": "testing_3"
				},
				{
					"list_id": 13,
					"empty": true,
					"items": [],
					"title": "testing_4"
				}
			],
			"status": 200
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

4. /additem
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

5. /deleteitem
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

6. /markdone 
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

7. /share 
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

8. /unshare
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
	
9. /createlist
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

10. /deletelist
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