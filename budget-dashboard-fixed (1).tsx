import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const BudgetDashboard = () => {
  // กำหนดค่าเริ่มต้นให้เป็น array ว่าง
  const [data, setData] = useState([
    {
      year: '2567',
      projectName: 'โครงการตัวอย่าง',
      budget: 1000000,
      spent: 500000,
      returned: 50000,
      remaining: 450000,
      spentPercentage: 50
    }
  ]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newData, setNewData] = useState({
    year: '',
    projectName: '',
    budget: 0,
    spent: 0,
    returned: 0
  });

  useEffect(() => {
    // โหลดข้อมูลจาก localStorage
    const savedData = localStorage.getItem('budgetData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // ตรวจสอบว่าเป็น array หรือไม่
        if (Array.isArray(parsedData)) {
          setData(parsedData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // บันทึกข้อมูลลง localStorage
    localStorage.setItem('budgetData', JSON.stringify(data));
  }, [data]);

  // ฟังก์ชันกรองข้อมูล
  const getFilteredData = () => {
    return data.filter(item => {
      if (!item) return false;
      const yearMatch = selectedYear === 'all' || item.year === selectedYear;
      const projectMatch = selectedProject === 'all' || item.projectName === selectedProject;
      return yearMatch && projectMatch;
    });
  };

  const filteredData = getFilteredData();

  // รายการปีงบประมาณที่มี
  const years = [...new Set(data.map(item => item?.year).filter(Boolean))];
  // รายการโครงการที่มี
  const projects = [...new Set(data.map(item => item?.projectName).filter(Boolean))];

  // ฟังก์ชันเพิ่มข้อมูลใหม่
  const handleAddData = () => {
    const remaining = newData.budget - newData.spent - newData.returned;
    const spentPercentage = (newData.spent / newData.budget) * 100;
    
    const newEntry = {
      ...newData,
      remaining,
      spentPercentage
    };

    setData(prevData => [...prevData, newEntry]);
    setShowAddForm(false);
    setNewData({
      year: '',
      projectName: '',
      budget: 0,
      spent: 0,
      returned: 0
    });
  };

  // คำนวณข้อมูลสรุป
  const summaryData = {
    totalBudget: filteredData.reduce((sum, item) => sum + (item?.budget || 0), 0),
    totalSpent: filteredData.reduce((sum, item) => sum + (item?.spent || 0), 0),
    totalReturned: filteredData.reduce((sum, item) => sum + (item?.returned || 0), 0),
    totalRemaining: filteredData.reduce((sum, item) => sum + ((item?.budget || 0) - (item?.spent || 0) - (item?.returned || 0)), 0)
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            ระบบรายงานงบประมาณ
          </CardTitle>
          <div className="flex gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกปีงบประมาณ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกปี</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกโครงการ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกโครงการ</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button>เพิ่มข้อมูล</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มข้อมูลงบประมาณ</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ปีงบประมาณ</label>
                    <Input
                      type="text"
                      value={newData.year}
                      onChange={(e) => setNewData({...newData, year: e.target.value})}
                      placeholder="เช่น 2568"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ชื่อโครงการ</label>
                    <Input
                      type="text"
                      value={newData.projectName}
                      onChange={(e) => setNewData({...newData, projectName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">งบประมาณ</label>
                    <Input
                      type="number"
                      value={newData.budget}
                      onChange={(e) => setNewData({...newData, budget: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">เบิกจ่าย</label>
                    <Input
                      type="number"
                      value={newData.spent}
                      onChange={(e) => setNewData({...newData, spent: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">โอนคืน</label>
                    <Input
                      type="number"
                      value={newData.returned}
                      onChange={(e) => setNewData({...newData, returned: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <Button onClick={handleAddData} className="w-full">
                    บันทึกข้อมูล
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">งบประมาณทั้งหมด</div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('th-TH').format(summaryData.totalBudget)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">เบิกจ่ายแล้ว</div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('th-TH').format(summaryData.totalSpent)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">โอนคืน</div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('th-TH').format(summaryData.totalReturned)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">คงเหลือ</div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('th-TH').format(summaryData.totalRemaining)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">ปีงบประมาณ</th>
                    <th className="text-left p-2">โครงการ</th>
                    <th className="text-right p-2">งบประมาณ</th>
                    <th className="text-right p-2">เบิกจ่าย</th>
                    <th className="text-right p-2">โอนคืน</th>
                    <th className="text-right p-2">คงเหลือ</th>
                    <th className="text-right p-2">ร้อยละการเบิกจ่าย</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">{item.year}</td>
                      <td className="p-2">{item.projectName}</td>
                      <td className="text-right p-2">{new Intl.NumberFormat('th-TH').format(item.budget)}</td>
                      <td className="text-right p-2">{new Intl.NumberFormat('th-TH').format(item.spent)}</td>
                      <td className="text-right p-2">{new Intl.NumberFormat('th-TH').format(item.returned)}</td>
                      <td className="text-right p-2">{new Intl.NumberFormat('th-TH').format(item.remaining)}</td>
                      <td className="text-right p-2">{item.spentPercentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 h-96">
            <ResponsiveContainer>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="projectName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" name="งบประมาณ" fill="#8884d8" />
                <Bar dataKey="spent" name="เบิกจ่าย" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetDashboard;
