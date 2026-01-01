'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [uploadingCities, setUploadingCities] = useState(false);
  const [uploadingSalaries, setUploadingSalaries] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // 上传城市标准数据
  const handleUploadCities = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadingCities(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('citiesFile') as File;

    if (!file) {
      showMessage('error', '请选择文件');
      setUploadingCities(false);
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      console.log('Uploading cities file:', file.name, 'size:', file.size);

      const response = await fetch('/api/upload-cities', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      console.log('Cities upload response:', result);

      if (response.ok) {
        showMessage('success', result.message);
        e.currentTarget?.reset();
      } else {
        showMessage('error', result.error || '上传失败');
        console.error('Upload failed:', result);
      }
    } catch (error) {
      showMessage('error', '上传失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setUploadingCities(false);
    }
  };

  // 上传员工工资数据
  const handleUploadSalaries = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadingSalaries(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('salariesFile') as File;

    if (!file) {
      showMessage('error', '请选择文件');
      setUploadingSalaries(false);
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      console.log('Uploading salaries file:', file.name, 'size:', file.size);

      const response = await fetch('/api/upload-salaries', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      console.log('Salaries upload response:', result);

      if (response.ok) {
        showMessage('success', result.message);
        e.currentTarget?.reset();
      } else {
        showMessage('error', result.error || '上传失败');
        console.error('Upload failed:', result);
      }
    } catch (error) {
      showMessage('error', '上传失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setUploadingSalaries(false);
    }
  };

  // 执行计算
  const handleCalculate = async () => {
    setCalculating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('success', result.message);
      } else {
        showMessage('error', result.error || '计算失败');
      }
    } catch (error) {
      showMessage('error', '计算失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* 返回按钮 */}
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回主页
        </Link>

        {/* 页面标题 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据上传与操作</h1>
          <p className="text-gray-600">上传数据并执行计算</p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* 操作卡片 */}
        <div className="space-y-6">
          {/* 上传城市标准数据 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">上传城市标准数据</h2>
            <p className="text-sm text-gray-600 mb-4">
              Excel 文件需包含字段: city_name, year, base_min, base_max, rate
            </p>
            <form onSubmit={handleUploadCities}>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  name="citiesFile"
                  accept=".xlsx,.xls"
                  disabled={uploadingCities}
                  className="flex-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={uploadingCities}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadingCities ? '上传中...' : '上传'}
                </button>
              </div>
            </form>
          </div>

          {/* 上传员工工资数据 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">上传员工工资数据</h2>
            <p className="text-sm text-gray-600 mb-4">
              Excel 文件需包含字段: employee_id, employee_name, month, salary_amount
            </p>
            <form onSubmit={handleUploadSalaries}>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  name="salariesFile"
                  accept=".xlsx,.xls"
                  disabled={uploadingSalaries}
                  className="flex-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={uploadingSalaries}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadingSalaries ? '上传中...' : '上传'}
                </button>
              </div>
            </form>
          </div>

          {/* 执行计算 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">执行计算</h2>
            <p className="text-sm text-gray-600 mb-4">
              根据上传的数据，计算每位员工的五险一金缴纳金额
            </p>
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
            >
              {calculating ? '计算中...' : '执行计算并存储结果'}
            </button>
          </div>
        </div>

        {/* 跳转到结果页面 */}
        <div className="mt-8 text-center">
          <Link
            href="/results"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            查看计算结果
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
