// This is a mock API function. Replace with actual API call when ready.
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
