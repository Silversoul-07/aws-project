import React, { useState, useEffect } from 'react';
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from './Sidebar';
import axios from 'axios';

const CourseRegistration = () => {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courseReport, setCourseReport] = useState(null);

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

                // Fetch available courses
                const coursesResponse = await axiosInstance.get('/api/courses');
                const courseArray = coursesResponse.data;
                const coursesMap = courseArray.map((course) => ({
                    id: course.id,
                    course_code: course.course_code,
                    course_name: course.course_name,
                    faculty_name: course.faculty_name,
                    course_venue: course.class_venue,
                    course_slots: course.class_slots.join('+'),
                    registered: course.registered,
                }));
                setCourses(coursesMap);

                // Generate course report data
                const totalCourses = coursesMap.length;
                const registeredCourses = coursesMap.filter(course => course.registered).length;
                const availableCourses = totalCourses - registeredCourses;

                setCourseReport({
                    totalCourses,
                    registeredCourses,
                    availableCourses,
                });

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRegister = async (courseId) => {
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
            const formData = new FormData();
            formData.append('user_id', user.id);
            formData.append('course_id', courseId);

            await axiosInstance.post('/api/register-course', formData);

            // Update the courses list to reflect the registration
            setCourses(courses.map(course =>
                course.id === courseId ? { ...course, registered: true } : course
            ));

            // Update the course report
            setCourseReport(prev => ({
                ...prev,
                registeredCourses: prev.registeredCourses + 1,
                availableCourses: prev.availableCourses - 1,
            }));

        } catch (err) {
            console.error('Error registering for course:', err);
            setError('Failed to register for the course. Please try again later.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

    const reportData = courseReport ? [
        { name: 'Total Courses', value: courseReport.totalCourses },
        { name: 'Registered Courses', value: courseReport.registeredCourses },
        { name: 'Available Courses', value: courseReport.availableCourses },
    ] : [];

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="w-64 flex-shrink-0">
                <Sidebar />
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Course Registration</h1>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Course Report</CardTitle>
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
                                    <TableHead>Course ID</TableHead>
                                    <TableHead>Course Code</TableHead>
                                    <TableHead>Course Name</TableHead>
                                    <TableHead>Faculty</TableHead>
                                    <TableHead>Venue </TableHead>
                                    <TableHead>Slots</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell>{course.id}</TableCell>
                                        <TableCell>{course.course_code}</TableCell>
                                        <TableCell>{course.course_name}</TableCell>
                                        <TableCell>{course.faculty_name}</TableCell>
                                        <TableCell>{course.course_venue}</TableCell>
                                        <TableCell>{course.course_slots}</TableCell>
                                        <TableCell>
                                            {course.registered ? (
                                                <Button disabled>Registered</Button>
                                            ) : (
                                                <Button onClick={() => handleRegister(course.id)}>Register</Button>
                                            )}
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

export default CourseRegistration;