from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime
from app.utils import pwd_context

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(email=user.email, username=user.username, hashed_password=hashed_password, pic=user.pic)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    print("User created")
    return db_user

def create_course(db: Session, **kwargs):
    db_course = models.Course(**kwargs)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    print("Course created")
    return db_course

def get_courses(db: Session, semester: str, semester_type: str, limit: int = 10):
    return db.query(models.Course).filter(models.Course.semester == semester, models.Course.semester_type == semester_type).limit(limit).all()

def get_course_by_slot(db: Session, semester: str, semester_type: str, slot: str):
    return db.query(models.Course).filter(models.Course.semester == semester, models.Course.semester_type == semester_type, models.Course.class_slots.any(slot)).first()

def create_attendance(db: Session, **kwargs):
    db_attendance = models.Attendance(**kwargs)
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def create_registration(db: Session, user_id: int, course_id: int):
    db_registration = models.Registration(user_id=user_id, course_id=course_id)
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    return db_registration

def get_registered_courses(db: Session, user_id: int):
    registrations = db.query(models.Registration).filter(models.Registration.user_id == user_id).all()
    courses = []
    for registration in registrations:
        course = db.query(models.Course).filter(models.Course.id == registration.course_id).first()
        courses.append(course)
    return courses

def get_attendance(db: Session, user_id: int):
    # Get the course registered by the user
    courses = get_registered_courses(db, user_id)
    
    result = []
    for course in courses:
        # Count the attendance
        attend_count = db.query(models.Attendance).filter(
            models.Attendance.user_id == user_id,
            models.Attendance.course_id == course.id,
            models.Attendance.status == True
        ).count()
        
        total_count = db.query(models.Attendance).filter(
            models.Attendance.user_id == user_id,
            models.Attendance.course_id == course.id
        ).count()
        
        course_info = {
            "course_id": course.id,
            "course_name": course.course_name,
            "faculty_name": course.faculty_name,
            "class_venue": course.class_venue,
            "class_slots": course.class_slots,
            "attend": attend_count,
            "total": total_count
        }
        
        result.append(course_info)
    
    return result

def get_attendance_by_user(db: Session, user_id: int):
    # Join Attendance with Course and select the required fields
    join_query = (
        db.query(
            models.Attendance.date,
            models.Course.course_name,
            models.Course.faculty_name,
            models.Course.class_venue,
            models.Course.class_slots
        )
        .join(models.Course, models.Attendance.course_id == models.Course.id)
        .filter(models.Attendance.user_id == user_id)
        .all()
    )

    # Convert the result to a list of dictionaries
    result = []
    for record in join_query:
        result.append({
            "date": record[0],
            "course_name": record[1],
            "faculty_name": record[2],
            "class_venue": record[3],
            "class_slots": record[4]
        })

    return result

def get_course_attendance(db: Session, course_id: int, user_id: int):
    # return date, slor, status from attendance
    return db.query(models.Attendance).filter(models.Attendance.course_id == course_id, models.Attendance.user_id == user_id).all()