from jwt.exceptions import PyJWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app import crud, schemas
from typing import Optional
from app.database import SessionLocal

SECRET_KEY = "YOUR_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db: Session, email: str, password: str):
    user = crud.get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def get_email_from_token(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    email: str = payload.get("sub")
    return email

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        user = crud.get_user_by_email(db, email)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return user
    except PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

import boto3
import base64

# Initialize the Rekognition client
rekognition = boto3.client('rekognition')

# Create a collection
def create_collection(collection_id):
    try:
        response = rekognition.create_collection(CollectionId=collection_id)
        print(f"Collection {collection_id} created. ARN: {response['CollectionArn']}")
    except rekognition.exceptions.ResourceAlreadyExistsException:
        print(f"Collection {collection_id} already exists.")

def index_face(collection_id, image_bytes, employee_id):
    response = rekognition.index_faces(
        CollectionId=collection_id,
        Image={'Bytes': image_bytes},
        ExternalImageId=employee_id,
        DetectionAttributes=['ALL']
    )
    print(f"Face indexed for employee {employee_id}")
    return response['FaceRecords'][0]['Face']['FaceId']

# Recognize a face
def recognize_face(collection_id, image_bytes):
    response = rekognition.search_faces_by_image(
        CollectionId=collection_id,
        Image={'Bytes': image_bytes},
        MaxFaces=1,
        FaceMatchThreshold=95
    )
    
    if response['FaceMatches']:
        return response['FaceMatches'][0]['Face']['ExternalImageId']
    else:
        return None
    
create_collection('StudentFaces')
