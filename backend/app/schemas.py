from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class CourseBase(BaseModel):
    name: str
    group: str
    details: str

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int

    class Config:
        orm_mode = True

class ClassBase(BaseModel):
    course_id: int
    faculty_id: int
    details: str

class ClassCreate(ClassBase):
    pass

class Class(ClassBase):
    id: int

    class Config:
        orm_mode = True

class AttendanceBase(BaseModel):
    student_id: int
    class_id: int
    date: datetime
    is_present: bool

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: int

    class Config:
        orm_mode = True

class AttendanceSummary(BaseModel):
    attended_classes: int
    total_classes: int
    attendance_percentage: float