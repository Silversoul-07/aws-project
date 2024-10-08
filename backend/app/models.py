from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import ARRAY
from uuid import uuid4

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    pic = Column(String)

    def __init__(self, username, email, hashed_password, pic):
        self.id = uuid4().time_low // 100
        self.username = username
        self.email = email
        self.hashed_password = hashed_password
        self.pic = pic

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    semester = Column(String, index=True)
    semester_type = Column(String, index=True)
    course_code = Column(String, index=True)
    course_name = Column(String, index=True)
    course_type = Column(String, index=True)    
    class_no = Column(String, index=True)
    class_venue = Column(String, index=True)
    class_slots = Column(ARRAY(String))
    faculty_name = Column(String, index=True)
    faculty_school = Column(String, index=True)

class Registration(Base):
    __tablename__ = "registrations"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), primary_key=True)

    user = relationship("User")
    course = relationship("Course")

class Attendance(Base):
    __tablename__ = "attendances"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    date = Column(String)
    day = Column(String)
    slot = Column(String)
    status = Column(Boolean, default=False)

    user = relationship("User")
    course = relationship("Course")