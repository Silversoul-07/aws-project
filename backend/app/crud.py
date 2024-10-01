from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(email=user.email, username=user.username, hashed_password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_courses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Course).offset(skip).limit(limit).all()

def create_course(db: Session, course: schemas.CourseCreate):
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def get_classes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Class).offset(skip).limit(limit).all()

def create_class(db: Session, class_: schemas.ClassCreate):
    db_class = models.Class(**class_.dict())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

def create_attendance(db: Session, attendance: schemas.AttendanceCreate):
    db_attendance = models.Attendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_attendance_summary(db: Session, student_id: int, class_id: int):
    total_classes = db.query(models.Class).filter(models.Class.id == class_id).count()
    attended_classes = db.query(models.Attendance).filter(
        models.Attendance.student_id == student_id,
        models.Attendance.class_id == class_id,
        models.Attendance.is_present == True
    ).count()
    attendance_percentage = (attended_classes / total_classes) * 100 if total_classes > 0 else 0

    return schemas.AttendanceSummary(
        attended_classes=attended_classes,
        total_classes=total_classes,
        attendance_percentage=attendance_percentage
    )