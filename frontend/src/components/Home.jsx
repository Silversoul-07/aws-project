import React, { useState, useEffect } from 'react';
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from './Sidebar';
import axios from 'axios';

const Home = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          throw new Error('No auth token found');
        }

        const axiosInstance = axios.create({
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        // Fetch user session
        const sessionResponse = await axiosInstance.get('/api/session');
        setUser(sessionResponse.data);

        // Fetch registered courses
        const coursesResponse = await axiosInstance.get(`/api/registered-courses/${sessionResponse.data.id}`);

        const coursesMap = coursesResponse.data.map((course) => ({
          id: course.id,
          classGroup: course.semester,
          courseDetail: `${course.course_code} - ${course.course_name}`,
          classDetail: `${course.class_no} - ${course.class_venue} - ${course.class_slots.join(', ')}`,
          facultyDetail: `${course.faculty_name} - ${course.faculty_school}`,
          attendedClasses: Math.floor(Math.random() * 20),
          totalClasses: 20,
          attendancePercentage: 0,
          debarStatus: 'Not Debarred',
        }));

        // Calculate attendance percentage
        coursesMap.forEach(course => {
          course.attendancePercentage = Math.round((course.attendedClasses / course.totalClasses) * 100);
        });

        setCourses(coursesMap);

        // Generate fake report data
        const totalCourses = coursesMap.length;
        const totalClasses = coursesMap.reduce((sum, course) => sum + course.totalClasses, 0);
        const totalAttended = coursesMap.reduce((sum, course) => sum + course.attendedClasses, 0);
        const averageAttendance = Math.round((totalAttended / totalClasses) * 100);

        setAttendanceReport({
          totalCourses,
          present: totalAttended,
          absent: totalClasses - totalAttended,
          averageAttendance,
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  const reportData = [
    { name: 'Total Courses', value: attendanceReport.totalCourses },
    { name: 'Present', value: attendanceReport.present },
    { name: 'Absent', value: attendanceReport.absent },
    { name: 'Avg. Attendance', value: attendanceReport.averageAttendance },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Attendance Dashboard</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Attendance Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sl.No.</TableHead>
                  <TableHead>Class Group</TableHead>
                  <TableHead>Course Detail</TableHead>
                  <TableHead>Class Detail</TableHead>
                  <TableHead>Faculty Detail</TableHead>
                  <TableHead>Attended Classes</TableHead>
                  <TableHead>Total Classes</TableHead>
                  <TableHead>Attendance Percentage</TableHead>
                  <TableHead>75% Attendance Alert</TableHead>
                  <TableHead>Debar Status</TableHead>
                  <TableHead>View Attendance Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course, index) => (
                  <TableRow key={course.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{course.classGroup}</TableCell>
                    <TableCell>{course.courseDetail}</TableCell>
                    <TableCell>{course.classDetail}</TableCell>
                    <TableCell>{course.facultyDetail}</TableCell>
                    <TableCell>{course.attendedClasses}</TableCell>
                    <TableCell>{course.totalClasses}</TableCell>
                    <TableCell>{course.attendancePercentage}%</TableCell>
                    <TableCell>
                      {course.attendancePercentage < 75 ? (
                        <Alert variant="warning">
                          <AlertDescription>Low Attendance</AlertDescription>
                        </Alert>
                      ) : null}
                    </TableCell>
                    <TableCell>{course.debarStatus}</TableCell>
                    <TableCell>
                      <button className="text-blue-500 hover:underline" onClick={() => {/* Implement view details logic */}}>
                        View Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;