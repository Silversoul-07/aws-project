// This is a mock API function. Replace with actual API call when ready.
import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { fetchAttendanceData } from './api';

const AttendanceCard = ({ course }) => {
  const getAttendanceStatus = (percentage, classesNeeded) => {
    if (percentage >= 75) return { color: 'text-green-600', message: `You can miss ${classesNeeded} more classes` };
    return { color: 'text-red-600', message: `Attend ${classesNeeded} more classes for 75%` };
  };

  const status = getAttendanceStatus(
    course.attendancePercentage, 
    course.attendancePercentage >= 75 ? course.canMissClasses : course.classesNeededFor75Percent
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{course.courseDetail}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Class Detail</p>
            <p className="font-medium">{course.classDetail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Faculty</p>
            <p className="font-medium">{course.facultyDetail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Attendance</p>
            <p className="font-medium">
              {course.attendedClasses} / {course.totalClasses} Classes
            </p>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Attendance</p>
              <p className={`text-2xl font-bold ${
                course.attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'
              }`}>
                {course.attendancePercentage.toFixed(2)}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className={`h-5 w-5 ${status.color}`} />
              <p className={`${status.color} font-medium`}>{status.message}</p>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                course.attendancePercentage >= 75 ? 'bg-green-600' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min(course.attendancePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceView = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAttendanceData();
        setAttendanceData(data);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
        setError("Failed to load attendance data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Attendance Tracker
          </h1>
          <p className="text-gray-600 mt-1">Monitor your attendance and maintain 75% attendance requirement</p>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {attendanceData.map((course, index) => (
              <AttendanceCard key={index} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceView;
export const fetchAttendanceData = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            courseDetail: "Course 1",
            classDetail: "Class Detail 1",
            facultyDetail: "Faculty 1",
            attendedClasses: 20,
            totalClasses: 30,
            attendancePercentage: 66.67,
            classesNeededFor75Percent: 3,
            canMissClasses: 0
          },
          {
            courseDetail: "Course 2",
            classDetail: "Class Detail 2",
            facultyDetail: "Faculty 2",
            attendedClasses: 25,
            totalClasses: 30,
            attendancePercentage: 83.33,
            classesNeededFor75Percent: 0,
            canMissClasses: 3
          }
        ]);
      }, 1000); // Simulate network delay
    });
  };
