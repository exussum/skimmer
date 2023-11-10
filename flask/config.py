import os

get = lambda e: os.environ.get(e)
class Config:                                           
                                                        
    class Google:                                       
        GOOGLE_CLIENT_ID = get("GOOGLE_CLIENT_ID")
        GOOGLE_CLIENT_SECRET = get("GOOGLE_CLIENT_SECRET")
        URL_AUTH = "https://accounts.google.com/o/oauth2/v2/auth"
        GOOGLE_REDIRECT_URL =  "http://localhost:3000/auth/code" 

    class Flask:
        SECRET_KEY = get("FLASK_SECRET_KEY") or "abc123"
                                                                 
