import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Session = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log('token:', token);
        const response = await axios.get('/api/session', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSession(response.data);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchSession();
  }, []);

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Session Data</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <img src={session.pic} alt="avatar" />
    </div>
  );
};

export default Session;