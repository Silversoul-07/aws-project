from fastapi import  Depends, HTTPException, status, APIRouter, Form, File, UploadFile
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.utils import get_current_user, create_access_token, authenticate_user, get_db, get_email_from_token, index_face
from datetime import timedelta
import base64

slot_map = {
    "Monday": {
        "08:00 AM - 08:50 AM": "A1",
        "09:00 AM - 09:50 AM": "F1",
        "10:00 AM - 10:50 AM": "D1",
        "11:00 AM - 11:50 AM": "TB1",
        "12:00 PM - 12:50 PM": "TG1",
        "02:00 PM - 02:50 PM": "A2",
        "03:00 PM - 03:50 PM": "F2",
        "04:00 PM - 04:50 PM": "D2",
        "05:00 PM - 05:50 PM": "TB2",
        "06:00 PM - 06:50 PM": "TG2"
    },
    "Tuesday": {
        "08:00 AM - 08:50 AM": "B1",
        "09:00 AM - 09:50 AM": "G1",
        "10:00 AM - 10:50 AM": "E1",
        "11:00 AM - 11:50 AM": "TC1",
        "12:00 PM - 12:50 PM": "TAA1",
        "02:00 PM - 02:50 PM": "B2",
        "03:00 PM - 03:50 PM": "G2",
        "04:00 PM - 04:50 PM": "E2",
        "05:00 PM - 05:50 PM": "TC2",
        "06:00 PM - 06:50 PM": "TAA2"
    },
    "Wednesday": {
        "08:00 AM - 08:50 AM": "C1",
        "09:00 AM - 09:50 AM": "A1",
        "10:00 AM - 10:50 AM": "F1",
        "11:00 AM - 11:50 AM": "V2",
        "12:00 PM - 12:50 PM": "V2",
        "02:00 PM - 02:50 PM": "C2",
        "03:00 PM - 03:50 PM": "G2",
        "04:00 PM - 04:50 PM": "F2",
        "05:00 PM - 05:50 PM": "TD2",
        "06:00 PM - 06:50 PM": "TBB2"
    },
    "Thursday": {
        "08:00 AM - 08:50 AM": "D1",
        "09:00 AM - 09:50 AM": "B1",
        "10:00 AM - 10:50 AM": "C1",
        "11:00 AM - 11:50 AM": "TCC1",
        "12:00 PM - 12:50 PM": "TCC1",
        "02:00 PM - 02:50 PM": "D2",
        "03:00 PM - 03:50 PM": "A2",
        "04:00 PM - 04:50 PM": "B2",
        "05:00 PM - 05:50 PM": "TA2",
        "06:00 PM - 06:50 PM": "TCC2"
    },
    "Friday": {
        "08:00 AM - 08:50 AM": "E1",
        "09:00 AM - 09:50 AM": "C1",
        "10:00 AM - 10:50 AM": "B1",
        "11:00 AM - 11:50 AM": "TD1",
        "12:00 PM - 12:50 PM": "TD1",
        "02:00 PM - 02:50 PM": "E2",
        "03:00 PM - 03:50 PM": "D2",
        "04:00 PM - 04:50 PM": "F2",
        "05:00 PM - 05:50 PM": "TA2",
        "06:00 PM - 06:50 PM": "TDD2"
    }
}

def find_slot(day, time):
    if day in slot_map:
        for slot_time, slot in slot_map[day].items():
            start_time, end_time = slot_time.split(" - ")
            if start_time <= time <= end_time:
                return slot
    return None

# Example usage
day = "Monday"
time = "09:30 AM"
slot = find_slot(day, time)
print(f"The slot for {day} at {time} is {slot}")


router = APIRouter(prefix="/api")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/users", response_model=schemas.User, tags=["users"])
def create_user(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    pic: UploadFile = File(...),
    db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Read the file and encode it in base64
    pic_data = pic.file.read()
    pic_base64 = base64.b64encode(pic_data).decode('utf-8')
    pic_base64 = f"data:image/jpeg;base64,{pic_base64}"
    
    user = schemas.UserCreate(username=username, email=email, password=password, pic=pic_base64)
    new_user = crud.create_user(db=db, user=user)
    face_id = index_face('StudentFaces', pic_data, str(new_user.id))
    print(face_id)
    return new_user

@router.post("/auth", response_model=schemas.Token, tags=["auth"])
async def login_for_access_token(form_data: schemas.AuthForm, db: Session = Depends(get_db) ):
    user = authenticate_user(db, form_data.email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/session", response_model=schemas.User, tags=["auth"])
async def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    email = get_email_from_token(token)
    user = crud.get_user_by_email(db, email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user



@router.post("/courses", response_model=schemas.CourseBase)
def create_course_endpoint(
    db: Session = Depends(get_db),
    semester: str = Form(...),
    semester_type: str = Form(...),
    course_code: str = Form(...),
    course_name: str = Form(...),
    course_type: str = Form(...),
    class_no: str = Form(...),
    class_venue: str = Form(...),
    class_slots: str = Form(...),
    faculty_name: str = Form(...),
    faculty_school: str = Form(...)):
    kwargs = {  
        "semester": semester,
        "semester_type": semester_type,
        "course_code": course_code,
        "course_name": course_name,
        "course_type": course_type,
        "class_no": class_no,
        "class_venue": class_venue,
        "class_slots": class_slots.split(","),
        "faculty_name": faculty_name,
        "faculty_school": faculty_school
    }
    return crud.create_course(db, **kwargs)

@router.get("/courses", response_model=List[schemas.CourseBase])
def get_courses_endpoint(db: Session = Depends(get_db), semester: str = None, semester_type: str = None):
    return crud.get_courses(db, semester, semester_type)

# register course
@router.post("/register-course", response_model=schemas.Registration)
def register_course_endpoint(db: Session = Depends(get_db), user_id: int = Form(...), course_id: int = Form(...)):
    return crud.create_registration(db, user_id, course_id)

# view registered courses
@router.get("/registered-courses/{user_id}", response_model=List[schemas.CourseBase])
def get_registered_courses_endpoint(user_id: int, db: Session = Depends(get_db)):
    return crud.get_registered_courses(db, user_id)

@router.post("/attendance", response_model=schemas.Attendance)
def create_attendance_endpoint(db: Session = Depends(get_db), 
                                semester: str = Form(...),
                                semester_type: str = Form(...),
                                user_id: int = Form(...),
                                time: str = Form(...),
                                day: str = Form(...),
                                date: str = Form(...)):
    # create check attendance

    slot = find_slot(day, time)
    if not slot:
        raise HTTPException(status_code=400, detail="Invalid time")
    course = crud.get_course_by_slot(db, semester, semester_type, slot)
    course_id = course.id
    kwargs = {
        "user_id": user_id,
        "course_id": course_id,
        "date": date,
        "day": day,
        "slot" : slot
    }
    return crud.create_attendance(db, **kwargs)

@router.get("/attendance/{user_id}")
def get_user_attendances_endpoint(user_id: int, db: Session = Depends(get_db)):
    return crud.get_attendance(db, user_id)

@router.get("/course-attendance")
def get_course_attendance_endpoint(user_id: int, course_id: int, db: Session = Depends(get_db)):
    return crud.get_course_attendance(db,course_id, user_id)