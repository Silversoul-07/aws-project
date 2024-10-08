from pydantic import BaseModel
from datetime import datetime
from typing import List

class UserBase(BaseModel):
    username: str
    email: str
    pic: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class AuthForm(BaseModel):
    email:str
    password:str

class CourseBase(BaseModel):
    id: int
    semester: str
    semester_type: str
    course_code: str
    course_name: str
    course_type: str
    class_no: str
    class_venue: str
    class_slots: List[str]
    faculty_name: str
    faculty_school: str

class CourseRegister(CourseBase):
    registered: bool
    
class CourseCreate(CourseBase):
    pass

class Attendance(BaseModel):
    user_id: int
    course_id: int
    date: datetime
    day: str
    slot: str
    status: bool    

class AttendanceView(BaseModel):
    user_id: int
    course_id: int
    date: datetime
    day: str
    slot: str
    status: bool
    course: CourseBase
    user: UserBase
    class Config:
        form_attribute = True

class Registration(BaseModel):
    user_id: int
    course_id: int