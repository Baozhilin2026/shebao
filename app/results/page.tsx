'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Result } from '@/lib/supabase';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .order('employee_name', { ascending: true });

      if (error) {
        setError('获取数据失败: ' + error.message);
      } else {
        setResults(data || []);
      }
    } catch (err) {
      setError('获取数据时发生错误: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* 返回按钮 */}
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回主页
        </Link>

        {/* 页面标题 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">计算结果</h1>
          <p className="text-gray-600">员工五险一金缴纳详情</p>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="bg-red-100 text-red-800 rounded-xl shadow-lg p-6">
            <p className="font-semibold">错误</p>
            <p>{error}</p>
          </div>
        )}

        {/* 空数据状态 */}
        {!loading && !error && results.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl text-gray-600 mb-2">暂无数据</p>
            <p className="text-gray-500">请先上传数据并执行计算</p>
            <Link
              href="/upload"
              className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              前往上传数据
            </Link>
          </div>
        )}

        {/* 数据表格 */}
        {!loading && !error && results.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">序号</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">员工姓名</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">年度月平均工资</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">最终缴费基数</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">公司缴纳金额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{result.employee_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        ¥{result.avg_salary.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        ¥{result.contribution_base.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600 text-right">
                        ¥{result.company_fee.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {/* 合计行 */}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4 text-sm text-gray-900" colSpan={2}>
                      合计 ({results.length} 位员工)
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      ¥{results.reduce((sum, r) => sum + r.avg_salary, 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      ¥{results.reduce((sum, r) => sum + r.contribution_base, 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right">
                      ¥{results.reduce((sum, r) => sum + r.company_fee, 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 统计信息 */}
        {!loading && !error && results.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-600">员工总数</p>
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-600">平均工资总额</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{results.reduce((sum, r) => sum + r.avg_salary, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-600">公司缴纳总额</p>
              <p className="text-2xl font-bold text-green-600">
                ¥{results.reduce((sum, r) => sum + r.company_fee, 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
