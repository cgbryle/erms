import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Reports = ({ currentUser }) => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr')) return;
    const fetchData = async () => {
      setLoading(true);
      const [empRes, attRes, perfRes] = await Promise.all([
        fetch('http://localhost:3001/employees'),
        fetch('http://localhost:3001/attendance'),
        fetch('http://localhost:3001/performance-reviews')
      ]);
      setEmployees(await empRes.json());
      setAttendance(await attRes.json());
      setPerformance(await perfRes.json());
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr')) {
    return <div className="card"><h2>Access Denied</h2><p>You do not have permission to view this page.</p></div>;
  }

  if (loading) {
    return <div className="card"><h2>Loading Reports...</h2></div>;
  }

  // Employee by department
  const deptCounts = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});

  // Attendance summary (present/absent)
  const attendanceSummary = attendance.reduce((acc, rec) => {
    acc[rec.status] = (acc[rec.status] || 0) + 1;
    return acc;
  }, {});

  // Performance average by department
  const perfByDept = {};
  performance.forEach(r => {
    if (!perfByDept[r.department]) perfByDept[r.department] = [];
    perfByDept[r.department].push(r.score);
  });
  const perfAvgByDept = Object.keys(perfByDept).map(dept => ({
    department: dept,
    avg: perfByDept[dept].reduce((a, b) => a + b, 0) / perfByDept[dept].length
  }));

  return (
    <div className="card">
      <h1>Reports & Analytics Dashboard</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
        <div style={{ width: 350 }}>
          <h3>Employees by Department</h3>
          <Pie data={{
            labels: Object.keys(deptCounts),
            datasets: [{
              data: Object.values(deptCounts),
              backgroundColor: [
                '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#8BC34A'
              ]
            }]
          }} />
        </div>
        <div style={{ width: 350 }}>
          <h3>Attendance Summary</h3>
          <Bar data={{
            labels: Object.keys(attendanceSummary),
            datasets: [{
              label: 'Count',
              data: Object.values(attendanceSummary),
              backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
            }]
          }} />
        </div>
        <div style={{ width: 350 }}>
          <h3>Avg. Performance by Department</h3>
          <Line data={{
            labels: perfAvgByDept.map(d => d.department),
            datasets: [{
              label: 'Avg. Score',
              data: perfAvgByDept.map(d => d.avg),
              fill: false,
              borderColor: '#36A2EB',
              tension: 0.1
            }]
          }} />
        </div>
      </div>
    </div>
  );
};

export default Reports; 